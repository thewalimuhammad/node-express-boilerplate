const express = require('express');
const { authMiddleware } = require('../middlewares/auth.middleware');
const {
  signupUser,
  loginUser,
  verifyOTP,
  verifyToken,
  forgotPassword,
  resetPassword,
  updatePassword,
  updateEmail,
  refreshToken,
} = require('../controllers/auth.controller');

const router = express.Router();

router.post('/login', loginUser);
router.post('/signup', signupUser);
router.post('/verify-otp', verifyOTP);
router.get('/verify-token', authMiddleware, verifyToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', authMiddleware, resetPassword);
router.patch('/update-password', authMiddleware, updatePassword);
router.patch('/update-email', authMiddleware, updateEmail);
router.post('/refresh-token', refreshToken);

module.exports = router;
