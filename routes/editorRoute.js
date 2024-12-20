
import { Router } from 'express';
import adminService from '../service/adminService.js';
import categoryService from '../service/categoryService.js';
import articleService from '../service/articleService.js';
import editorService from '../service/editorService.js';
import tagService from '../service/tagService.js';
const router = Router();


router.get('/articles', async (req, res) => {
    try {
        // Early return if no auth
        if (!req.session.auth) {
            return res.redirect('/login');
        }
        
        let userId = res.locals.authUser?.id;
        const list = await editorService.getArticlesForCategories(userId);

        // Single render response
        return res.render('editor/list', {
            list: list,
            layout: "nav-bar-editor"
        });

    } catch (err) {
        console.error('Error in /articles:', err);
        // Single error response
        return res.status(500).render('error', {
            layout: "nav-bar-editor",
            message: "An error occurred"
        });
    }
});

router.get('/view', async (req, res) => {
    const id = req.query.id || 0;
    const article = await articleService.getArticleById(id);
    res.render('editor/view', {
        article: article,
        layout: "nav-bar-editor"
    });
})

router.get('/categories', async (req, res) => {
    try {
        const list = await categoryService.getAll();
    res.json(list);
    }
    catch (err) {
        res.redirect('/error');
    }
})


router.get('/article/:id', async (req, res) => {
    try {
        const id = req.params.id || 0;
        
        const article = await articleService.getArticleById(id);
        res.json(article);
    }
    catch (err) {
        res.redirect('/error');
    }
});


router.get('/article-tags', async (req, res) => {
    try {
        const id = req.query.id;
        const list = await tagService.getTagsForArticle(id);
        res.json(list);
    }
    catch (err) {
        res.redirect('/error');
    }
})


router.post('/approve', async (req, res) => {

    try {
        const { articleId,
                categoryId,
                publishDate,
                tags} = req.body;
        // console.log('articleId:', articleId);
        // console.log('categoryId:', categoryId);
        // console.log('publishDate:', publishDate);
        // console.log('tags:', tags);
        await articleService.approveArticle(articleId,categoryId,publishDate,tags);
        res.status(200).json({ 
            success: true,
            message: 'Article approved successfully'
        });
    }
    catch (err) {
        console.error('Error approving article:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to approve article'
        });
    }

})


router.post('/reject', async (req, res) => {
    try {
        const { articleId, reason } = req.body;
        let writer_id = req.session.authUser?.id || 2;

        const result = await articleService.rejectArticle(articleId, reason, writer_id);
        
        return res.status(200).json({ 
            success: true,
            message: 'Article rejected successfully'
        });
    }
    catch (err) {
        console.error('Error rejecting article:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to reject article'
        });
    }
});

router.get('/tags', async (req, res) => {
    try {
        const list = await tagService.getAllTags();
        res.json(list);
    }
    catch (err) {
        res.redirect('/error');
    }
});


router.get('/', async (req, res) => {
    const list = await articleService.getArticle();
    res.render('editor/list', {
        list: list,
        layout: "nav-bar-editor"
    });
});







export default router;