import { Router } from 'express';

import indexService from '../service/indexService.js';

const router = Router();

router.get('/', async (req, res) => {

    let approvedArticles  = [];
    let mostViewedArticles = [];
    let latestArticles = [];
    let topCategoriesByViews = [];

    let isPremium = req.session.is_premium ? true : false;

    if (isPremium) {
         approvedArticles = await indexService.getApprovedArticlesEachWeek(7,true);
         mostViewedArticles = await indexService.getMostViewedArticles(10,true);
         latestArticles = await indexService.getLatestArticles(10,true);
         topCategoriesByViews = await indexService.getTopCategoriesByViews(10,true);


    }
    else {
         approvedArticles = await indexService.getApprovedArticlesEachWeek(7,false);
         mostViewedArticles = await indexService.getMostViewedArticles(10,false);
         latestArticles = await indexService.getLatestArticles(10,false);
         topCategoriesByViews = await indexService.getTopCategoriesByViews(10,false);
         
    }
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