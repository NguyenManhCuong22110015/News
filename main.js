import express from 'express';
import passport from 'passport';
import session from 'express-session'
import './authentication/passport-setup.js'
import { engine } from 'express-handlebars'; 
import path from 'path';
import { fileURLToPath } from 'url';
import facebookPassport from './authentication/facebook.js';
import googlePassport from './authentication/google.js';
import router from './routes/index.js';
import githubPassport from './authentication/github.js';
import flash from 'connect-flash';
import adminRoute from  './routes/adminRoute.js';
import writerRoute from  './routes/writerRoute.js';
import authLogin from  './routes/authLoginRoute.js';
import articleRoute from './routes/articleRoute.js';
import mainPageRoute from './routes/mainPageRoute.js';
import moment from 'moment-timezone';
import readPageRoute from './routes/readPageRoute.js';
import accountRoute from './routes/accountRoute.js';


const app = express()


   app.engine('hbs', engine({
    extname : 'hbs',
    helpers: {
      extractFirstImage: function (content) {
        if (!content) {
          return 'imgs/no_image.jpg';
        }
        const imgTagMatch = content.match(/<img[^>]+src="([^">]+)"/);
        return imgTagMatch ? imgTagMatch[1] : 'imgs/no_image.jpg';
      },
      chunk: function (array, size) {
        const chunkedArr = [];
        for (let i = 0; i < array.length; i += size) {
          chunkedArr.push(array.slice(i, i + size));
        }
        return chunkedArr;
      },
      eq: function (a, b) {
        return a === b;
      },
      formatDate: function (dateString) {
        return moment(dateString)
          .tz('Asia/Ho_Chi_Minh')  
          .format('h:mm A z, dddd MMMM D, YYYY');  
      },
      formatLongDate: function(dateString) {
        return moment(dateString)
            .tz('Asia/Ho_Chi_Minh')
            .format('dddd, MMMM Do YYYY');
    },
      isUndefined: function(value) {
        return value === null || value === undefined;
       },
       toUpperCase: function(text) {
        return text ? text.toUpperCase() : '';
    },
    isSubscriptionActive : function(expiryDate) {
      if (!expiryDate) return false;
      const today = new Date();
      const expiry = new Date(expiryDate);
      
      return expiry > today;
  },
  getRemainingDays: function(expiryDate) {
    if (!expiryDate) return 'No subscription';
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    
    // Reset time part for accurate day calculation
    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);
    
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Expires today';
    if (diffDays === 1) return '1 day remaining';
    return `${diffDays} days remaining`;
}
    
    }
  }));
  app.set('view engine', 'hbs');
  app.set('views', './view');
  
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  app.use(express.static(path.join(__dirname, 'public')));
  
  app.use(session({
      secret: 'Q2VNTVN3QklsQXZTRmFhRHV6ZEtKcHhDdFNldG4xTHdGSzRCWkunSmJ5UT8',
      resave: false,
      saveUninitialized: true,
      cookie: { 
        secure: process.env.NODE_ENV === 'production', // true in production
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
    }
  }));
  router.use((req, res, next) => {
    if (req.session.user) {
      req.user = req.session.user;
    }
    next();
    });
    app.use(flash());
    app.use((req, res, next) => {
      res.locals.errorMessage = req.flash('error');
      res.locals.successMessage = req.flash('success');
      next();
  });


  app.use(async function (req, res, next) {
    if(req.session.auth === null || req.session.auth === undefined){
      req.session.auth = false;
    }
    res.locals.auth = req.session.auth;
    res.locals.authUser = req.session.authUser || null;
    next();
  });

  app.use(async function (req, res, next) {
    res.locals.is_premium = req.session.is_premium;
    next();
  });

  
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json()); 
  app.use(facebookPassport.initialize());
  app.use(facebookPassport.session());
  app.use(googlePassport.initialize());
  app.use(googlePassport.session());
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(githubPassport.initialize());
  app.use(githubPassport.session());
  app.use('/', router);
  
  app.use('/article', articleRoute);


app.use('/auth', authLogin);

app.use('/writer', writerRoute);

app.use('/admin', adminRoute);
app.use('/', mainPageRoute);

import vnpay from "./routes/payment/vnpay.js"

app.use('/api/payment', vnpay);

import payment from "./routes/payment/payment.js"

app.use('/payment', payment);

app.use('/read', readPageRoute);

app.use('/account', accountRoute);




app.get("/", (req, res) => {
    res.send("Hello word")
})


app.listen(3000, ()  => {
    console.log("App is running")
})