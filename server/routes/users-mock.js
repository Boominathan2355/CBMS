const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUsersByRole,
  getUsersByDepartment,
  getUserStats
} = require('../controllers/userController-mock');
const { verifyToken, authorize } = require('../middleware/auth-mock');

// All routes require authentication
router.use(verifyToken);

// Get all users (Admin only)
router.get('/', authorize('admin'), getUsers);

// Get user statistics (Admin only)
router.get('/stats', authorize('admin'), getUserStats);

// Get users by role
router.get('/role/:role', getUsersByRole);

// Get users by department
router.get('/department/:departmentId', getUsersByDepartment);

// Get user by ID (Admin only)
router.get('/:id', authorize('admin'), getUserById);

// Update user (Admin only)
router.put('/:id', authorize('admin'), updateUser);

// Delete user (Admin only)
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;
