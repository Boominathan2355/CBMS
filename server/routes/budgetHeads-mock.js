const express = require('express');
const router = express.Router();
const {
  getBudgetHeads,
  getBudgetHeadById,
  createBudgetHead,
  updateBudgetHead,
  deleteBudgetHead,
  getBudgetHeadStats
} = require('../controllers/budgetHeadController-mock');
const { verifyToken, authorize } = require('../middleware/auth-mock');

// All routes require authentication
router.use(verifyToken);

// Get all budget heads (Admin only)
router.get('/', authorize('admin'), getBudgetHeads);

// Get budget head statistics (Admin only)
router.get('/stats', authorize('admin'), getBudgetHeadStats);

// Get budget head by ID (Admin only)
router.get('/:id', authorize('admin'), getBudgetHeadById);

// Create budget head (Admin only)
router.post('/', authorize('admin'), createBudgetHead);

// Update budget head (Admin only)
router.put('/:id', authorize('admin'), updateBudgetHead);

// Delete budget head (Admin only)
router.delete('/:id', authorize('admin'), deleteBudgetHead);

module.exports = router;
