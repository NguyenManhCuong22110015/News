import { Router } from 'express';

const router = Router();

import articleService from '../service/articleService.js';


router.get('/search', async (req, res) => {
    const keyword = req.query.q || '';
    
    if (!keyword) {
        return res.status(400).json({ error: 'Keyword is required' });
    }

    try {
        const results = await articleService.searchArticles(keyword);

        res.json(results);
       

    } catch (error) {
        console.error('Error searching articles:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



export default router;