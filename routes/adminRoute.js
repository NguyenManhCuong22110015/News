import { Router } from 'express';
import adminService from '../service/adminService.js';
import categoryService from '../service/categoryService.js';
import articleService from '../service/articleService.js';

const router = Router();

router.get('/categories', async (req, res) => {
    const list = await categoryService.getAll();
    const parents = await categoryService.getAllParents();
    res.render('admin/categories', {
        list: list,
        parents: parents,
        layout: "nav-bar-admin"
    });
});

router.post('/categories/add', async (req, res) => {
    const { name, description } = req.body;

    try {
        const ret = await categoryService.add(name, description);
        if (ret) {
            res.redirect('/admin/categories');
        } else {
            res.status(500).send('Error when adding category.');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('An unexpected error occurred.');
    }
});

router.get('/categories/add', (req, res) => {
    res.render('admin/addcat.hbs', {
        layout: false
    });
});

router.post('/categories/delete/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const ret = await categoryService.del(id);
        if (ret) {
            res.redirect('/admin/categories');
        } else {
            res.status(500).send('Error when deleting category.');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('An unexpected error occurred.');
    }
});

router.post('/categories/edit/:id', async (req, res) => {
    const { id } = req.params;
    const updatedCategory = req.body;

    try {
        const ret = await categoryService.patch(id, updatedCategory);
        if (ret) {
            res.redirect('/admin/categories');
        } else {
            res.status(500).send('Error when editing category.');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('An unexpected error occurred.');
    }
});
router.get('/categories/edit/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const category = await categoryService.findById(id);

        if (category) {
            res.render('admin/editcat.hbs', {
                layout: false,
                category, 
            });
        } else {
            res.status(404).send('Category not found.');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('An unexpected error occurred while retrieving the category.');
    }
});


router.post('/categories/updateParent/:id', async (req, res) => {
    const { id } = req.params;
    const { parent_id } = req.body;
    
    try {
        await categoryService.updateParent(id, parent_id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update parent category' });
    }
});


// Tags
router.get('/tags', async (req, res) => {
    const list = await adminService.getTags();
    res.render('admin/tags', {
        list: list,
        layout: "nav-bar-admin"
    });
});

router.get('/tags/add', async (req, res) => {
    res.render('admin/addtag', {
        layout: false
    });
});

router.post('/tags/add', async (req, res) => {
    const { name } = req.body;
  
    try {
      const tagId = await adminService.addTag({ name });
  
      if (tagId) {
        res.redirect('/admin/tags');
      } else {
        res.redirect('/admin/tags/add');
      }
    } catch (error) {
      console.error(error);
      res.redirect('/admin/tags/add');
    }
  });


router.get('/view', async (req, res) => {
    const id = +req.query.id || 0;
     const article = await articleService.getArticleById(id);
     const tags = await articleService.getTagsByArticleId(id);
    res.render('admin/view', {
        article: article,
        tags: tags,
        layout: 'nav-bar-admin'
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
router.post('/tags/delete/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const ret = await adminService.delTag(id);
        if (ret) {
            res.redirect('/admin/tags');
        } else {
            res.status(500).send('Error when deleting tag.');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('An unexpected error occurred.');
    }
});

router.post('/tags/edit/:id', async (req, res) => {
    const { id } = req.params;
    const updatedTag = req.body;

    try {
        const ret = await adminService.patchTag(id, updatedTag);
        if (ret) {
            res.redirect('/admin/tags');
        } else {
            res.status(500).send('Error when editing tag.');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('An unexpected error occurred.');
    }
});

router.get('/tags/edit/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const tag = await adminService.findTagById(id);

        if (tag) {
            res.render('admin/edittag.hbs', {
                layout: false,
                tag,
            });
        } else {
            res.status(404).send('tags not found.');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('An unexpected error occurred while retrieving the tags.');
    }
});

// Users
router.get('/users', async (req, res) => {
    const list = await adminService.getAllUsers();
    res.render('admin/users', {
        list: list,
        layout: "nav-bar-admin"
    });
});
router.get('/users/add', (req, res) => {
    res.render('admin/adduser.hbs', {
        layout: false
    });
});

router.post('/users/add', async (req, res) => {
    const { Firstname, LastName, Email } = req.body;
  
    if (!Firstname || !LastName || !Email) {
      req.flash('error', 'All fields are required');
      return res.redirect('/admin/users/add');
    }
    const Fullname = Firstname + " " + LastName;
  
    try {
      const newUser = {
        Fullname, 
        Firstname,
        LastName,
        Email
      };
  
      const result = await adminService.addUser(newUser);
  
      if (result) {
        req.flash('success', 'User added successfully');
        res.redirect('/admin/users');
      } else {
        req.flash('error', 'Failed to add user');
        res.redirect('/admin/users/add');
      }
    } catch (error) {
      console.error('Error adding user:', error);
      req.flash('error', 'An unexpected error occurred');
      res.redirect('/admin/users/add');
    }
  });
  

router.post('/users/delete/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const ret = await adminService.delUser(id);
        if (ret) {
            res.redirect('/admin/users');
        } else {
            res.status(500).send('Error when deleting user.');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('An unexpected error occurred.');
    }
});

router.get('/users/edit/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const user = await adminService.getUserById(id);
  
      if (user) {
        res.render('admin/edituser', {
          user,
          layout: false
        });
      } else {
        req.flash('error', 'User not found');
        res.redirect('/admin/users');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      req.flash('error', 'An unexpected error occurred');
      res.redirect('/admin/users');
    }
  });


router.post('/users/edit/:id', async (req, res) => {
    const { id } = req.params;
    const updatedUser = req.body;

    try {
        const ret = await adminService.patchUser(id, updatedUser);
        if (ret) {
            res.redirect('/admin/users');
        } else {
            res.status(500).send('Error when editing user.');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('An unexpected error occurred.');
    }
});

router.get('/articles', async (req, res) => {
    try {
        const list = await articleService.getArticle(); // Retrieves all articles
        res.render('admin/articles', {
            list: list,
            layout: "nav-bar-admin"
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('An unexpected error occurred while retrieving articles.');
    }
});

// Add Article
router.post('/articles/add', async (req, res) => {
    const { title, content, summary, status } = req.body;

    try {
        const addDate = new Date();
        const ret = await db('articles').insert({
            title,
            content,
            summary,
            status: status || 'draft', // Default to 'draft' if status is not provided
            created_at: addDate,
            updated_at: addDate
        });
        if (ret) {
            res.redirect('/admin/articles');
        } else {
            res.status(500).send('Error when adding article.');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('An unexpected error occurred while adding the article.');
    }
});

// Add Article Form
router.get('/articles/add', (req, res) => {
    res.render('admin/addarticle.hbs', {
        layout: "nav-bar-admin"
    });
});

// Delete Article
router.post('/articles/delete/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const ret = await articleService.del(id);
        if (ret) {
            res.redirect('/admin/articles');
        } else {
            res.status(500).send('Error when deleting article.');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('An unexpected error occurred while deleting the article.');
    }
});

// Edit Article
router.post('/articles/edit/:id', async (req, res) => {
    const { id } = req.params;
    const updatedArticle = req.body;

    try {
        const ret = await articleService.patch(id, updatedArticle);
        if (ret) {
            res.redirect('/admin/articles');
        } else {
            res.status(500).send('Error when editing article.');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('An unexpected error occurred while editing the article.');
    }
});

// View Single Article by ID
router.get('/articles/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const article = await articleService.getArticleByID(id);
        if (article) {
            res.render('admin/viewarticle.hbs', {
                article: article,
                layout: false
            });
        } else {
            res.status(404).send('Article not found.');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('An unexpected error occurred while retrieving the article.');
    }
});

export default router;