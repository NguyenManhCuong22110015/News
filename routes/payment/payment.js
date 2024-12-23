import { Router } from 'express';
import adminService from '../../service/adminService.js';
const router = Router();

router.get('/checkout', async (req, res) => {

   
    res.render('payment/checkout', {layout: false});
});


router.post('/request', async (req, res) => {
    const {email} = req.body;

    if (email) {
        const id = req.session.authUser.id;
        if (id){
            
            const payment = await adminService.request(id);
            if (payment) {
                res.status(200).json({
                    success: true,
                    message: 'Request submitted successfully'
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: 'Request failed'
                });
            }
        }
    }


})



export default router;