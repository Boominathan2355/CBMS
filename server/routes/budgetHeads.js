const express = require('express');
const router = express.Router();
const {
  getBudgetHeads,
  getBudgetHeadById,
  createBudgetHead,
  updateBudgetHead,
  deleteBudgetHead,
  getBudgetHeadStats
} = require('../controllers/budgetHeadController');
const { verifyToken, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(verifyToken);

// All routes require admin access
router.use(authorize('admin'));

router.get('/', getBudgetHeads);
router.get('/stats', getBudgetHeadStats);
router.get('/:id', getBudgetHeadById);
router.post('/', createBudgetHead);
router.put('/:id', updateBudgetHead);
router.delete('/:id', deleteBudgetHead);

module.exports = router;
