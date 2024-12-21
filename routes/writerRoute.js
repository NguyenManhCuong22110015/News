import { Router } from 'express';

import articleService from '../service/articleService.js';
import categoryService from '../service/categoryService.js';
import newsPaperService from '../service/news-paperService.js';
import tagService from '../service/tagService.js';

const router = Router();


router.get('/articles', async (req, res) => {

     
    const userID = req.session.userId || 6;
     const list = await articleService.getArticlesByWriterID(userID);
   
     res.render('writer/list-articles', {layout: "nav-bar-writer", list : list});
});


router.post('/update-article', async (req, res) => {

    const userId = req.session.userId || 6;
  
    const {id, title, content, summary, category, tags } = req.body;

    const category_id = await categoryService.findByName(category);
    const ret = await newsPaperService.update(id,title, content, summary, category_id, tags, userId)
    if(ret!== undefined) {
      res.send('Bài viết đã được lưu thành công!');
    }
    else {
      return res.status(500).send('Lỗi khi lưu bài viết!');
    }
});


router.post('/save-article', async (req, res) => {

  const userId = req.session.userId || 6;

  const { title, content, summary, category, tags } = req.body;
 
  
  const ret = await newsPaperService.add(title, content, summary, category, tags, userId)
  if(ret!== undefined) {
    res.send('Bài viết đã được lưu thành công!');
  }
  else {
    return res.status(500).send('Lỗi khi lưu bài viết!');
  }
});



router.get('/add-article', async (req,res) => {

    const categories = await categoryService.getAll();

    res.render('writer/add-article', {categories: categories});
});


router.delete('/delete-article', async (req, res) => {
    const id = +req.query.id ;
    const ret = await articleService.deleteArticle(id);
    if(ret!== undefined) {
      res.send('Bài viết đã được xóa thành công!');
    }
    else {
      return res.status(500).send('Lỗi khi xóa bài viết!');
    }
});

router.get('/edit-article', async (req,res) => {
  const id = +req.query.id || 6;
  const article = await articleService.getArticleByID(id);
  const categories = await categoryService.getAll();

  if(article.status === 'Published' || article.status === 'Approved') 
  {
    return res.render('error')
  }

  res.render('writer/edit-article', {
      data: {
          id: article.id,
          title: article.title,
          summary: article.summary,
          categories: categories,
          category_id: article.category_id, // Add category_id
          content: JSON.stringify(article.content)
      }
  });
});


router.get('/get-rejected-message', async (req, res) => {
    const id = +req.query.id;
    const ret = await articleService.getRejectedMessage(id);
    if(ret!== undefined) {
      res.send(ret);
    }
    else {
      return res.status(500).send('Lỗi khi lấy thông báo từ chối!');
    }
})


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


router.get('/tags', async (req, res) => {
    try {
        const list = await tagService.getAllTags();
        res.json(list);
    }
    catch (err) {
        res.redirect('/error');
    }
});
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






   export default router;

