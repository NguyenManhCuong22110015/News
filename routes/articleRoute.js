import { Router } from 'express';
import indexService from '../service/indexService.js';
const router = Router();

import articleService from '../service/articleService.js';


router.get('/search', async (req, res) => {
    const keyword = req.query.q || '';
    
    if (!keyword) {
        return res.status(400).json({ error: 'Keyword is required' });
    }
    try {
            const limit = 4;
          const current_page = req.query.page || 1;
          const offset = (current_page - 1) * limit;
          const nRows = await articleService.searchAndCountArticles(keyword);
          const nPages = Math.ceil(nRows.total / limit);
          
          
          const pageNumbers = [];


        for (let i = 0; i < nPages; i++) {
          pageNumbers.push({
            value: i + 1,
            active: (i + 1) === +current_page
          });
        }

        const results = await articleService.searchArticles(keyword, limit, offset);
        const category = indexService.getCategories();
        res.render('articles/searchPage',
           {layout: "footer",
            keyword: keyword,
            empty: results.length === 0,
            articles: results,
            categories: category,
            pageNumbers: pageNumbers,
           });
        
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
  
    try {
      const nRows = await articleService.countByCatId(id);
    const nPages = Math.ceil(nRows.total / limit);
    const pageNumbers = [];
    for (let i = 0; i < nPages; i++) {
      pageNumbers.push({
        value: i + 1,
        active: (i + 1) === +current_page
      });
    }
    
    // Check current category type
    const cat = await articleService.findCatById(id); 
    let child_cat;
    let parent_cat; // Declare variable here

    if (cat.parent_id) {
        // Get sibling categories if this is a child
        child_cat = await articleService.findChildCatById(cat.parent_id);
        // For child category, use its own name
        parent_cat = child_cat.find(c => c.id === parseInt(id))?.name || '';
    } else {
        // Get child categories if this is a parent
        child_cat = await articleService.findChildCatById(id);
        // For parent category, use its name
        parent_cat = cat.name;
    }

    const list = await articleService.findPageByCatId(id, limit, offset);

    res.render('articles/byCat', {
        is_parent: !cat.parent_id,
        categories: child_cat,
        parent_cat: parent_cat,
        layout: "footer",
        articles: list,
        empty: list.length === 0,
        pageNumbers: pageNumbers,
        catId: id
    });
    }
    catch (error) {
      res.render('error')
    }
});


router.post('/subscription/update', async function (req, res) {

  const {userId, days} = req.body;

  if (days != 0) {
    try {
      await articleService.updateSubscription(userId, days);
      res.json({ success: true });
    } catch (error) {
      console.error('Error updating subscription:', error);
      res.json({ success: false });
    }
  }
  else {
    try {
      await articleService.cancelSubscription(userId);
      res.json({ success: true });
    } catch (error) {
      console.error('Error updating subscription:', error);
      res.json({ success: false });
    }
  }

});


export default router;