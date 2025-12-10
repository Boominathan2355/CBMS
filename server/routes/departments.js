const express = require('express');
const router = express.Router();
const {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentStats,
  getDepartmentDetail
} = require('../controllers/departmentController');
const { verifyToken, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(verifyToken);

// Department detail route - accessible by department users for their own dept, or elevated roles
router.get('/:id/detail', getDepartmentDetail);

// All other routes require admin access
router.use(authorize('admin'));

router.get('/', getDepartments);
router.get('/stats', getDepartmentStats);
router.get('/:id', getDepartmentById);
router.post('/', createDepartment);
router.put('/:id', updateDepartment);
router.delete('/:id', deleteDepartment);

module.exports = router;
