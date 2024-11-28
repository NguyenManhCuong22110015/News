import db from '../utils/db.js';
import bcrypt from 'bcrypt';

export default {
    async login(email, password) {
        const user = await db('users').where({ email,provider: 'email'  }).first();
        if (!user) return null; 

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return null; 

        return user; 
    },

    async checkAccountOrCreateAccount(email, password) {
        const user = await db('users').where({ email,provider: 'email' }).first();
        if (user) {return null}
        const hashedPassword = await bcrypt.hash(password, 10);
        return db('users').insert({ email: email, password: hashedPassword, name: email  });
    },

    async resetPassword(email, newPassword) {
        const user = await db('users').where({ email : email, provider: 'email' }).first();
        if (!user) {
          throw new Error('User not found'); 
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db('users')
          .where({ email })
          .update({ password: hashedPassword, updated_at: new Date() });
    
        return { message: 'Password successfully reset' };
      }
};
