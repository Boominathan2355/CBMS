const express = require('express');
const router = express.Router();
const {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentsByHOD,
  getDepartmentStats
} = require('../controllers/departmentController-mock');
const { verifyToken, authorize } = require('../middleware/auth-mock');

// All routes require authentication
router.use(verifyToken);

// Get all departments
router.get('/', getDepartments);

// Get department statistics
router.get('/stats', getDepartmentStats);

// Get departments by HOD
router.get('/hod/:hodId', getDepartmentsByHOD);

// Get department by ID
router.get('/:id', getDepartmentById);

// Create department (Admin only)
router.post('/', authorize('admin'), createDepartment);

// Update department (Admin only)
router.put('/:id', authorize('admin'), updateDepartment);

// Delete department (Admin only)
router.delete('/:id', authorize('admin'), deleteDepartment);

module.exports = router;
