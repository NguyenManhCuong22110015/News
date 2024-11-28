import { Router } from 'express';
const router = Router();

router.get('/checkout', async (req, res) => {

   
    res.render('payment/checkout', {layout: false});
});




export default router;