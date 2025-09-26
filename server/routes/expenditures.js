const express = require('express');
const router = express.Router();
const {
  getExpenditures,
  getExpenditureById,
  submitExpenditure,
  approveExpenditure,
  rejectExpenditure,
  verifyExpenditure,
  resubmitExpenditure,
  getExpenditureStats
} = require('../controllers/expenditureController');
const { verifyToken, authorize } = require('../middleware/auth');
const { upload, handleUploadError, processUploadedFiles } = require('../middleware/fileUpload');

// All routes require authentication
router.use(verifyToken);

// Get expenditures (all authenticated users)
router.get('/', getExpenditures);
router.get('/stats', getExpenditureStats);
router.get('/:id', getExpenditureById);

// Submit expenditure (department users only)
router.post('/', 
  authorize('department'), 
  upload.array('attachments', 5),
  handleUploadError,
  processUploadedFiles,
  submitExpenditure
);

// Resubmit expenditure (department users only)
router.post('/:id/resubmit', 
  authorize('department'),
  upload.array('attachments', 5),
  handleUploadError,
  processUploadedFiles,
  resubmitExpenditure
);

// Verify expenditure (HOD only)
router.put('/:id/verify', authorize('hod'), verifyExpenditure);

// Approve expenditure (Office, Vice Principal, Principal)
router.put('/:id/approve', 
  authorize('office', 'vice_principal', 'principal'), 
  approveExpenditure
);

// Reject expenditure (Office, Vice Principal, Principal)
router.put('/:id/reject', 
  authorize('office', 'vice_principal', 'principal'), 
  rejectExpenditure
);

module.exports = router;
