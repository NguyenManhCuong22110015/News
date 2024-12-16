import { Router } from 'express';

import indexService from '../service/indexService.js';
import articleService from '../service/articleService.js';


const router = Router();

router.get('/', async (req, res) => {
    try {
        const id = parseInt(req.query.id) || 0;
        const article = await articleService.getArticleById(id);
        const author = await articleService.getAuthorById(article.writer_id);
        const articlesSameCate = await articleService.getArticleSameCate(article.category_id, id);

        // Category handling
        const cat = await articleService.findCatById(article.category_id); 
        let child_cat;
        let parent_cat;

        const comments = await articleService.getCommentByArticleId(id);

        await articleService.incrementViews(id);

        if (cat.parent_id) {
            // If current category is a child
            child_cat = await articleService.findChildCatById(cat.parent_id);
            parent_cat = cat.name; // Use current category name
        } else {
            // If current category is a parent
            child_cat = await articleService.findChildCatById(article.category_id);
            parent_cat = cat.name;
        }

        res.render('readPage', {
            article,
            author,
            articlesSameCate,
            categories: child_cat,
            parent_cat,
            comments,
            num_cmt: comments.length || 0,
            layout: "footer"
        });




    } catch (error) {
        console.error('Error:', error);
        res.status(500).render('error', { 
            message: 'Internal server error',
            layout: "footer"
        });
    }
});


router.post('/comment/add', async (req, res) => {
    try {
        const { article_id, user_id, content } = req.body;
        const comment = await articleService.addComment(article_id, user_id, content);
        res.status(200).json(comment);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


export default router;