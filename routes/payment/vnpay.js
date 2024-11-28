import express from "express";
import crypto from "crypto";
import qs from "qs";
import dotenv from 'dotenv';
import moment from "moment-timezone";
import paymentService from "../../service/paymentService.js";


dotenv.config();
const router = express.Router();

function generateSecureHash(secretKey, data) {
    const hmac = crypto.createHmac("sha512", secretKey);
    return hmac.update(data, "utf-8").digest("hex");
}

function sortObject(obj) {
    const sorted = {};
    Object.keys(obj).sort().forEach((key) => {
        sorted[key] = obj[key];
    });
    return sorted;
}

router.post("/create_payment_url", (req, res) => {
    const ipAddr = "127.0.0.1";

    // Config variables
    const tmnCode = process.env.vnp_TmnCode;
    const secretKey = process.env.vnp_HashSecret;
    const vnpUrl = process.env.vnp_Url;
    const returnUrl = process.env.vnp_ReturnUrl;

    // Payment details
    const amount = req.body.amount * 100 || 1000000; 
    const bankCode = req.body.bankCode || "NCB";
    const orderInfo = req.body.orderDescription || "ThanhToan" ;
    const orderType = req.body.orderType || "other";
    const locale = req.body.language || "vn";
    const email = req.body.email || "ngcuong1182004@gmail.com" ;
    const date = moment().tz("Asia/Ho_Chi_Minh");
 
    const offerDate = req.body.date ? new Date(req.body.date).toLocaleDateString('en-GB').replace(/\//g, '') : new Date().toLocaleDateString('en-GB').replace(/\//g, '');


    const createDate = date.format("YYYYMMDDHHmmss");
    const expireDate = date.add(15, "minutes").format("YYYYMMDDHHmmss");
    
    // Transaction ID
    const txnRef = `${date.format("HHmmss")}-${email}-${offerDate}`;

    // VNPAY parameters
    let vnp_Params = {
        vnp_Version: "2.1.0",
        vnp_Command: "pay",
        vnp_TmnCode: tmnCode,
        vnp_Locale: locale,
        vnp_CurrCode: "VND",
        vnp_TxnRef: txnRef,
        vnp_OrderInfo: orderInfo,
        vnp_OrderType: orderType,
        vnp_Amount: amount,
        vnp_ReturnUrl: returnUrl,
        vnp_IpAddr: ipAddr,
        vnp_CreateDate: createDate,
        vnp_ExpireDate: expireDate,
        
    };

    // Add bank code if provided
    if (bankCode) {
        vnp_Params["vnp_BankCode"] = bankCode;
    }

    // Sort parameters
    vnp_Params = sortObject(vnp_Params);

    // Generate secure hash
    const signData = qs.stringify(vnp_Params, { encode: true });
    const secureHash = generateSecureHash(secretKey, signData);
    vnp_Params["vnp_SecureHash"] = secureHash;

    // Build payment URL
    const paymentUrl = vnpUrl + "?" + qs.stringify(vnp_Params, { encode: false });
    
    // Response
    res.status(200).json({
        status: "OK",
        message: "Successfully generated payment URL",
        url: paymentUrl,
    });
});

router.get("/payment_info", async (req, res) => {
    const { vnp_Amount, vnp_BankCode, vnp_OrderInfo, vnp_ResponseCode, vnp_SecureHash, vnp_TxnRef } = req.query;

    const secretKey = process.env.vnp_HashSecret;
    const isValidSignature = verifyVnpaySignature(req.query, secretKey);
    if (!isValidSignature) {
        return res.status(400).render("payment/payment_result", {
            status: "Failed",
            message: "Invalid signature detected. Transaction failed.",
            isSuccess: false // Đưa isSuccess vào dữ liệu trả về
        });
    }


    const txnRefParts = vnp_TxnRef.split("-");
    const email = txnRefParts[1]; // Lấy email từ phần thứ 2
    const offerDate = txnRefParts[2]; // Lấy offerDate từ phần thứ 3

    const transactionData = {
        amount: parseInt(vnp_Amount, 10) / 100,
        bank_Code: vnp_BankCode,
        order_Info: vnp_OrderInfo,
        status: vnp_ResponseCode === "00" ? "Success" : "Fail",
        response_code: vnp_ResponseCode, // Lưu mã phản hồi
        transaction_no: req.query.vnp_TransactionNo || null, // Lưu mã giao dịch từ VNPAY
        ip_address: req.query.vnp_IpAddr || null, // Lưu IP nếu có
        order_type: req.query.vnp_OrderType || null, // Lưu loại giao dịch
        created_At: moment().tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD HH:mm:ss"),
        response_time: moment().tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD HH:mm:ss"), // Thời gian phản hồi
        email: email,
        offer_Date: offerDate,
    };

    try {
        const existingTransaction = await paymentService.findByTxnRef(transactionData.transaction_no);
        
            if (existingTransaction) {
                console.log("here")
                return res.render("payment/payment_result", {
                    status: transactionData.status,
                    message: "Transaction has already been processed.",
                    amount: transactionData.amount,
                    bankCode: transactionData.bankCode,
                    email: transactionData.email,
                    offerDate: transactionData.offerDate,
                    isSuccess: transactionData.status === "Success"
                });
            }
        await paymentService.add(transactionData)

        return res.render("payment/payment_result", {
            status: transactionData.status === "Success" ? "Success" : "Failed",
            message: transactionData.status === "Success" ? 
                "Transaction completed successfully." : 
                "Transaction failed. Please try again.",
            amount: transactionData.amount,
            bankCode: transactionData.bankCode,
            email: transactionData.email,
            offerDate: transactionData.offerDate,
            isSuccess: transactionData.status === "Success" // Đưa isSuccess vào dữ liệu trả về
        });
    } catch (err) {
        console.error("Error saving transaction: ", err);
        return res.status(500).render("payment/payment_result", {
            status: "Failed",
            message: "An error occurred while saving the transaction. Please contact support.",
            isSuccess: false // Đưa isSuccess vào dữ liệu trả về
        });
    }
});


function verifyVnpaySignature(queryParams, secretKey) {
    // Lấy vnp_SecureHash từ query parameters
    const vnpSecureHash = queryParams.vnp_SecureHash;
    if (!vnpSecureHash) {
        return false; // Không có chữ ký, không hợp lệ
    }

    // Loại bỏ vnp_SecureHash khỏi query parameters để chuẩn bị cho việc tạo chữ ký mới
    const { vnp_SecureHash: _, ...filteredParams } = queryParams;

    // Sắp xếp các tham số theo thứ tự từ điển
    const sortedParams = Object.keys(filteredParams)
        .sort()
        .reduce((acc, key) => {
            acc[key] = filteredParams[key];
            return acc;
        }, {});

    // Tạo chuỗi dữ liệu để mã hóa
    const signData = qs.stringify(sortedParams, { encode: true });

    // Tạo chữ ký bằng HMAC SHA512
    const generatedHash = crypto
        .createHmac("sha512", secretKey)
        .update(signData, "utf-8")
        .digest("hex");

    // So sánh chữ ký được tạo với chữ ký từ VNPAY
    return generatedHash === vnpSecureHash;
}



export default router;
