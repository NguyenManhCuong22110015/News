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

router.put('/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
  
    try {
      await articleService.updateStatus(id, status);
      res.json({ success: true });
    } catch (error) {
      console.error('Error updating status:', error);
      res.json({ success: false });
    }
  });

  router.get('/byCat', async function (req, res) {
    const id = req.query.id || 0;
    const limit = 6;
    const current_page = req.query.page || 1;
    const offset = (current_page - 1) * limit;
  
    const nRows = await articleService.countByCatId(id);
    const nPages = Math.ceil(nRows.total / limit);
    const pageNumbers = [];
    for (let i = 0; i < nPages; i++) {
      pageNumbers.push({
        value: i + 1,
        active: (i + 1) === +current_page
      });
    }
    

   

    const list = await articleService.findPageByCatId(id, limit, offset);
    res.render('articles/byCat', {
      layout: false,
      articles: list,
      empty: list.length === 0,
      pageNumbers: pageNumbers,
      catId: id
    });
  });
  


export default router;