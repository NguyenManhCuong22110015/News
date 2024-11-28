
import nodemailer from 'nodemailer';

const sendConfirmationEmail = async (email, confirmationCode) => {
  // Cấu hình transporter
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // Thay bằng SMTP server của bạn
    port: 587, // Cổng SMTP (thay đổi nếu cần)
    secure: false, // true cho cổng 465, false cho các cổng khác
    auth: {
      user: 'nmcuongg2004@gmail.com', // Thay bằng email của bạn
      pass: 'xmfm pkrx upfk ipvy', // Thay bằng mật khẩu email của bạn
    },
  });

  // Cấu hình nội dung email
  const mailOptions = {
    from: '"My Web Project" ', // Địa chỉ gửi
    to: email, // Địa chỉ nhận
    subject: 'Email xác nhận', // Tiêu đề email
    html: `
      <style>
        body{
          font-family:  cnn_sans_display, helveticaneue, Helvetica, Arial, Utkal, sans-serif 
        }
      </style>
    <div style=" margin: 0 auto; max-width: 600px;">
        <div style="display: flex; align-items: center;">
            <img src="https://res.cloudinary.com/dj9r2qksh/image/upload/v1730088828/images_1_tcml4f.png" 
                 alt="Image Description" width="50" height="50" style="margin-right: 10px;margin-top:35px;"  />
            <div style="font-size:40px;margin-top:30px; margin-left:20px;margin-right:20px;" >|</div>
            <p style="font-family: 'Brush Script MT', cursive, sans-serif;font-size:40px" >NewsPaper</p>
        </div>
        <p style="font-family: Arial, sans-serif; font-size: 20px; color: #333;">
           <strong>Your email confirmation code</strong>   
        </p>

        <p>Hi,</p>
        <p>To help us confirm your identity on my website , we need to verify your email address.</p>
        <p>This code can only be used once. If you didn't request a code, please ignore this email. Never share this code with anyone else.</p>

          <p style="text-align:center;font-size: 20px; font-weight: bold" >Your email confirmation code</p><br/>
          <p style="text-align:center;font-size: 26px; font-weight: bold" >${confirmationCode}</p>
        
        <p>This code will be expire three minutes after this email was sent.</p>
        <p>Thanks,</p>
       <p>Thank for your registration</p>
         
         `, 
  };

  // Gửi email
  try {
    const info = await transporter.sendMail(mailOptions);
    
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export default sendConfirmationEmail;
