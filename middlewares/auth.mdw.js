export default  function (req, res,next) {
    if(req.session.auth === false){
      req.session.retUrl = req.originalUrl;
      return res.redirect('/login');
    }
    next();
  }
  
  export function authAdmin (req, res,next) {
    
    if (!req.session.auth) {
          req.session.retUrl = req.originalUrl;
          return res.redirect('/login');
      }
      if (!req.session.authUser || req.session.authUser.role === 'user') {
          return res.redirect('/error');
      }
      next();
  }
  export function authWriter (req, res,next) {
    
    if (!req.session.auth) {
          req.session.retUrl = req.originalUrl;
          return res.redirect('/login');
      }
      if (!req.session.authUser || req.session.authUser.role === 'user') {
          return res.redirect('/error');
      }
      next();
  }
  export function authEditor (req, res,next) {
    
    if (!req.session.auth) {
          req.session.retUrl = req.originalUrl;
          return res.redirect('/login');
      }
      if (!req.session.authUser || req.session.authUser.role === 'user') {
          return res.redirect('/error');
      }
      next();
  }
  export  function premiumPage (req, res,next) {
    if(req.session.auth === false){
      req.session.retUrl = req.originalUrl;
      return res.redirect('/login');
    }
    const subscriptionDate = new Date(req.session.authUser.subscription_expiry).getTime();
    const currentDate = Date.now();

    if (subscriptionDate < currentDate) {
        return res.redirect('/error');
    }
    next();
  }
  

  