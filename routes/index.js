import { Router } from 'express';

import sendConfirmationEmail from '../service/mailService.js';
import upload from '../service/CloudinaryService.js';
import db from '../utils/db.js'
import authService from '../service/authService.js';
import  Swal from 'sweetalert2';

const router = Router();

// CHeck role

const roleBasedAccess = (requiredRole) => (req, res, next) => {
  if (req.session.role === requiredRole) {
    return next();
  }
  res.status(403).send('Access Denied');
};



router.get('/success', (req,res) => { res.render('success-Payment', {layout: false} )
});



router.get('/login', (req,res) => { res.render('login', {layout: false} )
});

router.get('/reset-password', (req,res) => { res.render('reset-password', {layout: false} )
});



router.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    
    // Xóa toàn bộ session
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }
      res.clearCookie('connect.sid');
      res.redirect('/');
    });
  });
});




router.get('/', (req, res) => {
  const userGreeting = req.user ? `<h1>Hello ${req.user.displayName}</h1>` : '<h1>Hello Guest</h1>';
  const loginLink = req.user ? 
      `<a href="/logout" class="btn btn-danger">Logout</a>` : 
      `<a href="/login" class="btn btn-primary">Login </a>`;

  res.send(`
      <div style="text-align: center; margin-top: 50px;">
          ${userGreeting}
          <div style="margin-top: 20px;">
              ${loginLink}
          </div>
      </div>
  `);
});

router.post('/send-email-getCode', async (req, res) => {
  const { email } = req.body;
  const confirmationCode = Math.floor(100000 + Math.random() * 900000);
  req.session.otp = {
    email,
    code: confirmationCode,
    timestamp: Date.now()
  };
  await sendConfirmationEmail(email, confirmationCode);
  res.status(200).json({ message: 'Email xác nhận đã được gửi.' });
});


router.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const sessionOtp = req.session.otp;
  if (!sessionOtp || sessionOtp.email !== email || sessionOtp.code.toString() !== otp.toString()) {
    return res.status(400).json({ message: 'OTP không hợp lệ.' });
  }
  
  const otpExpirationTime = 1800000; 
  const otpAge = Date.now() - sessionOtp.timestamp;

  if (otpAge > otpExpirationTime) {
    delete req.session.otp; 
    return res.status(400).json({ message: 'OTP đã hết hạn.' });
  }
  delete req.session.otp;
  res.status(200).json({ message: 'OTP xác nhận thành công.' });
});

router.post('/upload-image', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: 'No file uploaded' });
  }
  res.send({ imageUrl: req.file.path }); 
});

router.post('/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;  // Get the new password from the request body

  if (!newPassword) {
    return res.status(400).json({ message: 'Password is required' });
  }

  try {
    await authService.resetPassword(email,newPassword);
    res.json({ success: true, message: 'Password successfully reset' });
    
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ success: false, message: 'An error occurred while resetting password' });
  }
});



router.get('/get-article/:id', (req, res) => {
  const articleId = req.params.id;
  
  const query = 'SELECT title, content FROM articles WHERE id = ?';
  db.query(query, [articleId], (err, results) => {
    if (err) {
      console.error('Lỗi khi lấy bài viết:', err);
      return res.status(500).send('Lỗi khi lấy bài viết!');
    }
    if (results.length > 0) {
      res.json(results[0]); // Trả về bài viết đầu tiên
    } else {
      res.status(404).send('Không tìm thấy bài viết!');
    }
  });
});






export default router;