import { Router } from 'express';
import categoryService from '../service/categoryService.js';
import articleService from '../service/articleService.js';
import path from 'path'; 
import pdf from 'html-pdf';
import fs from 'fs';

import { promises as fsPromises } from 'fs';
const router = Router();

router.get('/', async (req, res) => {
    const list = await articleService.getArticleByPre(0);
    res.render('sub/list', {
        list: list
    });
});


router.get('/download/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const htmlContent = await articleService.getArticleContentById(id);

        if (!htmlContent) {
            return res.status(404).send('Article content not found.');
        }

        const outputPath = path.resolve('downloads', `article_${id}.pdf`);
        await articleService.generatePdfFromHtml(htmlContent, outputPath);

        res.download(outputPath, `article_${id}.pdf`, (err) => {
            if (err) {
                console.error('Error sending file:', err);
            }

            fs.unlinkSync(outputPath);
        });
    } catch (error) {
        console.error('Error processing download request:', error);
        res.status(500).send('An error occurred while processing your request.');
    }
});

router.get('/view/:id', async (req, res) => {
    const { id } = req.params;
    const article = await articleService.getArticleByID(id);

    if (!article) {
        return res.status(404).send('Article not found');
    }

    res.render('sub/view', {
        title: article.title,
        content: article.content,
    });
});

export default router;