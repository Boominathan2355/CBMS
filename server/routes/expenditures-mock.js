const express = require('express');
const router = express.Router();
const {
  getExpenditures,
  getExpenditureById,
  submitExpenditure,
  approveExpenditure,
  rejectExpenditure,
  resubmitExpenditure,
  getExpenditureStats
} = require('../controllers/expenditureController-mock');
const { verifyToken, authorize } = require('../middleware/auth-mock');
const { handleFileUpload } = require('../middleware/fileUpload');
const { expenditureConcurrencyMiddleware } = require('../middleware/concurrencyControl');

// All routes require authentication
router.use(verifyToken);

// Get all expenditures
router.get('/', getExpenditures);

// Get expenditure statistics
router.get('/stats', getExpenditureStats);

// Submit expenditure (Department users) with file upload
router.post('/', authorize(['department']), handleFileUpload, submitExpenditure);

// Get expenditure by ID
router.get('/:id', getExpenditureById);

// Approve expenditure (Office and above) with concurrency control
router.put('/:id/approve', authorize(['office', 'vice_principal', 'principal', 'admin']), expenditureConcurrencyMiddleware, approveExpenditure);

// Reject expenditure (Office and above) with concurrency control
router.put('/:id/reject', authorize(['office', 'vice_principal', 'principal', 'admin']), expenditureConcurrencyMiddleware, rejectExpenditure);

// Resubmit expenditure (Department users) with file upload
router.post('/:id/resubmit', authorize(['department']), handleFileUpload, resubmitExpenditure);

module.exports = router;
