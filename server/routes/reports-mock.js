const express = require('express');
const router = express.Router();
const {
  generateExpenditureReport,
  generateAllocationReport,
  generateDashboardReport,
  generateAuditReport
} = require('../controllers/reportController-mock');
const { verifyToken, authorize } = require('../middleware/auth-mock');

// All routes require authentication
router.use(verifyToken);

// Generate expenditure report (Office, VP, Principal, Admin)
router.get('/expenditures', authorize(['office', 'vice_principal', 'principal', 'admin']), generateExpenditureReport);

// Generate allocation report (Office, VP, Principal, Admin)
router.get('/allocations', authorize(['office', 'vice_principal', 'principal', 'admin']), generateAllocationReport);

// Generate dashboard report (Office, VP, Principal, Admin)
router.get('/dashboard', authorize(['office', 'vice_principal', 'principal', 'admin']), generateDashboardReport);

// Generate audit report (Admin, Office, VP, Principal)
router.get('/audit', authorize(['admin', 'office', 'vice_principal', 'principal']), generateAuditReport);

module.exports = router;
