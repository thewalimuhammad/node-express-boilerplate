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
} = require('../controllers/auth.controller');

const router = express.Router();

const redis = require('redis');
const client = redis.createClient();

client.on('error', (err) => {
  console.error('Redis error:', err);
});

client.connect().catch(console.error);

client.on('connect', () => {
  console.log('Redis connected');
});

// Middleware to check if token is blacklisted
const checkBlacklist = async (req, res, next) => {
  try {
    // console.log('Checking blacklist');
    const token = req.headers.authorization?.split(' ')[1];
    // console.log('Token:', token);
    const data = await client.get(token);
    // console.log('Data:', data);
    if (data) return res.status(401).send('Token is blacklisted');
    next();
  } catch (err) {
    console.error('Error checking blacklist:', err);
    res.status(500).send('Internal Server Error');
  }
};

const logout = async (req, res) => {
  const token = req.header('Authorization').replace('Bearer ', '');
  if (!token) return res.status(400).send('Token not provided');
  try {
    await client.set(token, 'blacklisted', 'EX', 3600); // Expire after 1 hour
    res.status(200).send('Logged out successfully');
  } catch (err) {
    res.status(500).send('Failed to blacklist token');
  }
};

router.post('/logout', authMiddleware, logout);

// Protected route
router.get('/protected', checkBlacklist, (req, res) => {
  try {
    res.status(200).send('Protected route');
  } catch (err) {
    res.status(500).send('Failed to access protected route');
  }
});

router.post('/login', loginUser);
router.post('/signup', signupUser);
router.post('/verify-otp', verifyOTP);
router.get('/verify-token', authMiddleware, verifyToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', authMiddleware, resetPassword);
router.patch('/update-password', authMiddleware, updatePassword);
router.patch('/update-email', authMiddleware, updateEmail);

module.exports = router;
module.exports.checkBlacklist = checkBlacklist;
