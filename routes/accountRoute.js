import { Router } from 'express';
import bcrypt from 'bcrypt';
import accountService from '../service/accountService.js';
import moment from 'moment';
import check from '../middlewares/auth.mdw.js';


const router = Router();


    router.get('/profile',check, (req, res) => {
    res.render('account/profile',
         {       
        user: req.session.authUser,
        layout:false
     });
    });
    router.post('/update-birthday',check, async (req, res) => {
        try {
            const { birthday } = req.body;
            const formattedDate = moment(birthday, 'DD/MM/YYYY')
                .tz('Asia/Ho_Chi_Minh')
                .add(1, 'days') 
                .toDate()
                .toISOString()
                .slice(0, 19)
                .replace('T', ' ');
                
            const ret = await accountService.updateBirthday(req.session.authUser.id, formattedDate);
            
            if (ret) {
                req.session.authUser.birthday = formattedDate;
                res.status(200).json({ success: true, message: 'Birthday updated successfully' });
            } else {
                res.status(400).json({ success: false, message: 'Failed to update birthday' });
            }
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    });
    router.post('/update-field', check, async (req, res) => {
        try {
            const { field, value } = req.body;
            const ret = await accountService.updateField(req.session.authUser.id, field, value);
            if (ret) {
                req.session.authUser[field] = value;
                res.status(200).json({ success: true, message: 'Field updated successfully' });
            } else {
                res.status(400).json({ success: false, message: 'Failed to update field' });
            }
        }
        catch (error) {
            console.error('Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    })

    
router.post('/update-password',check, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = req.session.authUser;

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                success: false, 
                message: 'Current password is incorrect' 
            });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        // Update password if verification passed
        const ret = await accountService.updatePassword(user.id, hashedPassword);
        if (ret) {
            res.status(200).json({ 
                success: true, 
                message: 'Password updated successfully' 
            });
        } else {
            res.status(400).json({ 
                success: false, 
                message: 'Failed to update password' 
            });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});


export default router;