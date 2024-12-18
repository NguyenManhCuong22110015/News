
import { Router } from 'express';
import adminService from '../service/adminService.js';
import categoryService from '../service/categoryService.js';
import articleService from '../service/articleService.js';
import editorService from '../service/editorService.js';

const router = Router();

router.get('/', async (req, res) => {
    const list = await articleService.getArticle();
    res.render('editor/list', {
        list: list,
        layout: "nav-bar-editor"
    });
});

router.post('/article/delete/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const ret = await articleService.del(id);
        if (ret) {
            res.redirect('/editor');
        } else {
            res.status(500).send('Error when deleting article.');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('An unexpected error occurred while deleting the article.');
    }
});

router.post('/article/status/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const article = await articleService.getArticleByID(id);

    if (!article) {
        return res.status(404).json({ error: 'Article not found' });
    }

    if (article.status === 'draft') {
        return
    }

    if (article.status === 'pending' && !['draft', 'published'].includes(status)) {
        return
    }

    if (article.status === 'published' && status !== 'draft') {
        return
    }

    try {
        //await articleService.patch(id, { status });

        if (article.status === 'pending' && status === 'draft') {
            return res.redirect(`/editor/reason/${id}`);
        }

        if (article.status === 'pending' && status === 'published') {
            return res.redirect(`/editor/accept/${id}`);
        }

        if (article.status === 'published' && status === 'draft') {
            return res.redirect(`/editor/reason/${id}`);
        }

        res.redirect('/editor');

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while updating the article status' });
    }
});

router.get ('/reason/:id', async (req, res) => {
    const { id } = req.params;
    res.render('editor/reason',{
        layout: "nav-bar-editor",
        id:id
    });
})

router.post('/reason/:id', async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
        return res.status(400).json({ error: 'Reason is required.' });
    }

    try {
        const art = await articleService.getArticleByID(id);
        await editorService.saveReason(id, reason);
        await articleService.updateStatusToDraft(id);
        
        res.status(200).json({ message: 'Reason saved successfully.' });
    } catch (error) {
        console.error('Error while saving reason:', error);
        res.status(500).json({ error: 'An error occurred while saving the reason.' });
    }
});

// Example route to render the accept page with tags, categories, and article data
router.get('/accept/:id', async (req, res) => {
    const articleId = req.params.id;

    try {
        const article = await articleService.getArticleByID(articleId);
        const tags = await adminService.getTags();
        const categories = await categoryService.getAll();

        res.render('editor/accept', {
            article:article,
            tags:tags,
            categories:categories,
            layout:"nav-bar-editor"
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching article data');
    }
});

router.post('/accept/:id', async (req, res) => {
    const {id} = req.params;
    const { tag_id, category_id, publish_date } = req.body;

    try {
        await editorService.addAcceptInfo(id, tag_id, category_id, publish_date);
        await articleService.updateStatusToPublished(id);
        res.redirect('/editor');
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to accept the article.' });
    }
});

export default router;