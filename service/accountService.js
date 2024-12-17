import db from '../utils/db.js';

export default {

    updateBirthday(id, birthday) {
        return db('users')
        .where('id', id)
        .update({ 
            birthday: birthday,
            updated_at: db.fn.now() // Add updated timestamp
        })
    },
    updateField(id, field, value) {
        return db('users')
        .where('id', id)
        .update({ 
            [field]: value,
            updated_at: db.fn.now() // Add updated timestamp
        })
    },
    updatePassword(id, newPassword) {
        return db('users')
        .where('id', id)
        .update({ 
            password: newPassword,
            updated_at: db.fn.now() // Add updated timestamp
        })
    }


}