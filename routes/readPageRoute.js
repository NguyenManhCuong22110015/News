import { Router } from 'express';

import indexService from '../service/indexService.js';

const router = Router();

router.get('/', async (req, res) => {

    res.render('readPage', {
        layout: "footer", 
    });
    
})



export default router;