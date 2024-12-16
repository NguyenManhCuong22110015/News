export default  function (req, res,next) {
    if(req.session.auth === false){
      req.session.retUrl = req.originalUrl;
      return res.redirect('/account/login');
    }
    next();
  }
  
  export  function authAdmin (req, res,next) {
    if(req.session.auth === false){
      req.session.retUrl = req.originalUrl;

      if (req.user.permission < 1) {
        res.render('features')
      }


      return res.redirect('/account/login');
    }
    next();
  }
  