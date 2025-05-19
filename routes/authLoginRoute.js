import { Router } from 'express';
import facebookPassport from '../authentication/facebook.js';
import googlePassport from '../authentication/google.js';
import githubPassport from '../authentication/github.js';
import saveUserToDatabase from '../service/userService.js';
import authService from '../service/authService.js';


const router = Router();


const roleBasedAccess = (requiredRole) => (req, res, next) => {
    if (req.session.role === requiredRole) {
      return next();
    }
    res.status(403).send('Access Denied');
  };

  
  router.get('/facebook', facebookPassport.authenticate('facebook',{auth_type: 'reauthenticate'} ));
router.get(
  '/facebook/callback',
  facebookPassport.authenticate('facebook', { failureRedirect: '/login' }),
  async (req, res) => {
    try {
      const user = await saveUserToDatabase(req.user, 'facebook');
      req.session.userId = user.id;
      req.session.role = user.role;

      // Set role cookie
       // 1 day
      req.session.auth = true;
    req.session.authUser = user;
    const currentDate = new Date();
      const expiryDate = new Date(user.subscription_expiry);
      req.session.is_premium = expiryDate > currentDate;
    const retUrl = req.session.retUrl || '/';
    delete req.session.retUrl;
      res.redirect(retUrl);
    } catch (error) {
      res.redirect('/login');
    }
  }
);



router.get('/login', (req, res) => {
  if (req.headers.referer && !req.headers.referer.includes('/login')) {
      req.session.retUrl = req.headers.referer;
  }
  res.render('login', {csrfToken: req.csrfToken()});
});
router.post('/login', async (req, res) => {
  const email = req.body.login_email || '';
  const password = req.body.login_password || '';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    req.flash('error', 'Invalid email format');
    return res.redirect('/login');
  }
  try {
      const user = await authService.login(email, password); 
      if (!user) {
          req.flash('error', 'Invalid email or password');
          return res.redirect('/login');
      }
      
      req.user = user;
      req.session.userId = user.id;
      req.session.role = user.role;
      
      req.session.auth = true;
      req.session.authUser = user;
      

      const currentDate = new Date();
      const expiryDate = new Date(user.subscription_expiry);
      req.session.is_premium = expiryDate > currentDate;


      // Get return URL from session and redirect
      const returnTo = req.session.retUrl || '/';
      delete req.session.retUrl; // Clear stored URL
      return res.redirect(returnTo);
  } catch (error) {
      console.error('Error logging in:', error);
      req.flash('error', 'Internal server error');
      return res.redirect('/login');
  }
});


router.post('/signup', async (req, res) => {



  const email = req.body.reg_email || '';
  const password = req.body.reg_password || '';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    req.flash('error', 'Invalid email format');
    return res.redirect('/login');
  }


  const token = req.body['h-captcha-response'];
  if (!token) {
      req.flash('error', 'Please complete the captcha');
      return res.redirect('/login');
  }

  try {
    const existingUser = await authService.checkAccountOrCreateAccount(email, password);

    if (existingUser === null) {
      req.flash('error', 'Account already exists. Please log in.');
      return res.redirect('/login'); 
    }
    req.flash('success', 'Account created successfully. Please log in.');
    res.redirect('/login'); 

  } catch (error) {
    console.error('Error during signup:', error);
    req.flash('error', 'Internal server error');
    res.redirect('/login');
  }
});



router.get('/google',googlePassport.authenticate('google', { scope: ['profile', 'email'] ,prompt: 'select_account' }));
router.get('/google/callback',googlePassport.authenticate('google', { failureRedirect: '/login' }),
async (req, res) => {
  try {
    const user = await saveUserToDatabase(req.user, 'google');
    req.session.userId = user.id;
    req.session.role = user.role;
    
    // Set role cookie
     // 1 day
    req.session.auth = true;
    req.session.authUser = user;
    const currentDate = new Date();
      const expiryDate = new Date(user.subscription_expiry);
      req.session.is_premium = expiryDate > currentDate;
    const retUrl = req.session.retUrl || '/';
    delete req.session.retUrl;
     return res.redirect(retUrl);
  } catch (error) {
    res.redirect('/login');
  }
}
);

router.get( '/github',(req, res, next) => {req.logout((err) => {
    if (err) return next(err);
    next();
  }); 
},
    githubPassport.authenticate('github', { scope: ['user:email'] })
);

router.get( '/github/callback', githubPassport.authenticate('github', { failureRedirect: '/login' }),
    async (req, res) => {
    try {
    const user = await saveUserToDatabase(req.user, 'github');
    req.session.userId = user.id;
    req.session.role = user.role;

    // Set role cookie
     // 1 day
    req.session.auth = true;
    req.session.authUser = user;
    const currentDate = new Date();
      const expiryDate = new Date(user.subscription_expiry);
      req.session.is_premium = expiryDate > currentDate;
    const retUrl = req.session.retUrl || '/';
    delete req.session.retUrl;
      res.redirect(retUrl);
    } catch (error) {
    res.redirect('/login');
    }
    }
);


export default router;