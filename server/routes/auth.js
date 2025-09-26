const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  changePassword,
  logoutUser
} = require('../controllers/authController-mock');
const { verifyToken, authorize } = require('../middleware/auth-mock');

// Public routes
router.post('/login', loginUser);
router.post('/register', registerUser);

// Protected routes
router.use(verifyToken); // All routes below require authentication

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);
router.post('/logout', logoutUser);

module.exports = router;
