import { Router } from 'express';
import captchaService from '../service/captchaService.js';

const HCAPTCHA_SITE_KEY = 'f2aacc22-14fa-4572-bc96-0028525e7082';

const router = Router();

router.get('/', (req, res) => {
    res.render('captcha/captcha', { siteKey: HCAPTCHA_SITE_KEY });
});

// Handle form submission
router.post('/', async (req, res) => {
    const token = req.body['h-captcha-response'];

    if (!token) {
        return res.status(400).send('CAPTCHA token is missing');
    }

    try {
        const isValid = await captchaService.verifyHCaptcha(token, req.ip);
        if (isValid) {
            res.send('CAPTCHA verified successfully!');
        } else {
            res.status(400).send('CAPTCHA verification failed');
        }
    } catch (error) {
        res.status(500).send('Error verifying CAPTCHA');
    }
});


export default router;