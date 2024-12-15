import { Router } from 'express';

import indexService from '../service/indexService.js';

const router = Router();

router.get('/', async (req, res) => {

    const approvedArticles = await indexService.getApprovedArticlesEachWeek();
    const mostViewedArticles = await indexService.getMostViewedArticles();
    const latestArticles = await indexService.getLatestArticles();
    const topCategoriesByViews = await indexService.getTopCategoriesByViews();
    const categories = await indexService.getCategories();



    const top = approvedArticles[0];
    const otherArticles = approvedArticles.slice(1);
    res.render('main/index', {
        layout: "footer", 
        articles : otherArticles,
        categories: categories,
        topArticle:top,
        mostViewedArticles: mostViewedArticles,
        latestArticles: latestArticles,
        topCategoriesByViews: topCategoriesByViews,
        empty: approvedArticles.length === 0
        
    });
})



export default router;