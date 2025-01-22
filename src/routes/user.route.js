const express = require('express');
const { authMiddleware } = require('../middlewares/auth.middleware');
const checkBlacklist = require('./auth.route');
const {
  getUsers,
  getUserById,
  updateUserById,
  deleteUserById,
} = require('../controllers/user.controller');

const router = express.Router();

router.get('/', checkBlacklist.checkBlacklist, authMiddleware, getUsers);
router.get('/:id', authMiddleware, getUserById);
router.patch('/:id', authMiddleware, updateUserById);
router.delete('/:id', authMiddleware, deleteUserById);

module.exports = router;
