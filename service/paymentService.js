import db from '../utils/db.js';

export default {
    add(data) {
       return db("transactions").insert(data)
    },
    findByTxnRef(transaction_no){
        const ret = db("transactions").where("transaction_no", transaction_no).first()
        return ret ? true : false
    }
}
