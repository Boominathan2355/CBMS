const express = require('express');
const router = express.Router();
const {
  getAllocations,
  getAllocationById,
  createAllocation,
  updateAllocation,
  deleteAllocation,
  getAllocationStats,
  bulkCreateAllocations,
  getYearComparison,
  getCSVTemplate,
  bulkUploadCSV
} = require('../controllers/allocationController-mock');
const { verifyToken, authorize } = require('../middleware/auth-mock');
const { budgetConcurrencyMiddleware } = require('../middleware/concurrencyControl');
const { handleCSVUpload, handleCSVUploadError } = require('../middleware/csvUpload');

// All routes require authentication
router.use(verifyToken);

// Get all allocations (Office and above)
router.get('/', authorize(['office', 'vice_principal', 'principal', 'admin']), getAllocations);

// Get allocation statistics (Office and above)
router.get('/stats', authorize(['office', 'vice_principal', 'principal', 'admin']), getAllocationStats);

// Bulk create allocations (Office and above)
router.post('/bulk', authorize(['office', 'vice_principal', 'principal', 'admin']), bulkCreateAllocations);

// Get CSV template for bulk upload (Office and above)
router.get('/csv-template', authorize(['office', 'vice_principal', 'principal', 'admin']), getCSVTemplate);

// Bulk upload CSV file (Office and above)
router.post('/bulk-csv', authorize(['office', 'vice_principal', 'principal', 'admin']), handleCSVUpload, handleCSVUploadError, bulkUploadCSV);

// Get year comparison data (Office, VP, Principal, Admin)
router.get('/year-comparison', authorize(['office', 'vice_principal', 'principal', 'admin']), getYearComparison);

// Get allocation by ID (Office and above)
router.get('/:id', authorize(['office', 'vice_principal', 'principal', 'admin']), getAllocationById);

// Create allocation (Office and above)
router.post('/', authorize(['office', 'vice_principal', 'principal', 'admin']), createAllocation);

// Update allocation (Office and above) with concurrency control
router.put('/:id', authorize(['office', 'vice_principal', 'principal', 'admin']), budgetConcurrencyMiddleware, updateAllocation);

// Delete allocation (Office and above) with concurrency control
router.delete('/:id', authorize(['office', 'vice_principal', 'principal', 'admin']), budgetConcurrencyMiddleware, deleteAllocation);

module.exports = router;
