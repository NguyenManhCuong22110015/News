
import { Router } from 'express';
import adminService from '../service/adminService.js';
import categoryService from '../service/categoryService.js';
import articleService from '../service/articleService.js';
import editorService from '../service/editorService.js';

const router = Router();


router.get('/articles', (req, res) => {


    const userId = req.session.authUser.id || 2;
    const list = editorService.getArticlesForCategories(userId);
    res.render('editor/list', {
        list: list,
        layout: "nav-bar-editor"
    });
});



router.get('/', async (req, res) => {
    const list = await articleService.getArticle();
    res.render('editor/list', {
        list: list,
        layout: "nav-bar-editor"
    });
});

router.get('/getCate', async (req, res) => {
    try {
        const id = req.query.id;
        const list = await categoryService.getCategory(id);
        
        res.json(list);
    }
    catch(error){
        res.redirect('error');
    }
});
router.get('/getUnassignedCate', async (req, res) => {
    try {
        const id = req.query.id;
        const list = await categoryService.getUnassignedCate(id);
        res.json(list);
    }
    catch(error){
        res.redirect('error');
    }
});



router.post('/removeCate', async (req, res) => {
    try {
        const id = req.body.id;
        await categoryService.delCatForEditor(id);
        res.status(200).json({ 
            success: true,
            message: 'Category removed successfully'
        });
    }
    catch(error){
        console.error('Error removing category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove category'
        });
    }
});



router.post('/addCate', async (req, res) => {
    try {
        const {userId, categoryId} = req.body;
         await categoryService.addCat(userId, categoryId);
         res.status(200).json({ 
            success: true,
            message: 'Category added successfully'
        });
    }
    catch(error){
        res.redirect('/error');
    }
});

export default router;