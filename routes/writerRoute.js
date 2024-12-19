import { Router } from 'express';

import articleService from '../service/articleService.js';
import categoryService from '../service/categoryService.js';
import newsPaperService from '../service/news-paperService.js';
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
    const ret = await newsPaperService.update(id,title, content, summary, category_id.id, tags, userId)
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
  
    res.render('writer/edit-article', 
      {data: 
      {
      id: article.id,
      title: article.title,
      summary: article.summary,
      content: JSON.stringify(article.content)  
  }});
});
  


   export default router;

