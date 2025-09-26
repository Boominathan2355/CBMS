const Department = require('../models/Department');
const User = require('../models/User');

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private/Admin
const getDepartments = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, isActive } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const departments = await Department.find(query)
      .populate('hod', 'name email')
      .sort({ name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Department.countDocuments(query);

    res.json({
      success: true,
      data: {
        departments,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching departments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get department by ID
// @route   GET /api/departments/:id
// @access  Private/Admin
const getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('hod', 'name email role');

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    res.json({
      success: true,
      data: { department }
    });
  } catch (error) {
    console.error('Get department by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching department',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create new department
// @route   POST /api/departments
// @access  Private/Admin
const createDepartment = async (req, res) => {
  try {
    const { name, code, description, hod } = req.body;

    // Check if department with same name or code already exists
    const existingDept = await Department.findOne({
      $or: [{ name }, { code }]
    });

    if (existingDept) {
      return res.status(400).json({
        success: false,
        message: 'Department with this name or code already exists'
      });
    }

    // Validate HOD if provided
    if (hod) {
      const hodUser = await User.findById(hod);
      if (!hodUser || hodUser.role !== 'hod') {
        return res.status(400).json({
          success: false,
          message: 'Invalid HOD user'
        });
      }
    }

    const department = await Department.create({
      name,
      code,
      description,
      hod
    });

    const populatedDepartment = await Department.findById(department._id)
      .populate('hod', 'name email');

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: { department: populatedDepartment }
    });
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating department',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private/Admin
const updateDepartment = async (req, res) => {
  try {
    const { name, code, description, hod, isActive } = req.body;
    const departmentId = req.params.id;

    // Check if department exists
    const existingDept = await Department.findById(departmentId);
    if (!existingDept) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Check if name or code is already taken by another department
    if (name || code) {
      const duplicateDept = await Department.findOne({
        $or: [
          ...(name ? [{ name }] : []),
          ...(code ? [{ code }] : [])
        ],
        _id: { $ne: departmentId }
      });

      if (duplicateDept) {
        return res.status(400).json({
          success: false,
          message: 'Department with this name or code already exists'
        });
      }
    }

    // Validate HOD if provided
    if (hod) {
      const hodUser = await User.findById(hod);
      if (!hodUser || hodUser.role !== 'hod') {
        return res.status(400).json({
          success: false,
          message: 'Invalid HOD user'
        });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (code) updateData.code = code;
    if (description !== undefined) updateData.description = description;
    if (hod !== undefined) updateData.hod = hod;
    if (isActive !== undefined) updateData.isActive = isActive;

    const department = await Department.findByIdAndUpdate(
      departmentId,
      updateData,
      { new: true, runValidators: true }
    ).populate('hod', 'name email');

    res.json({
      success: true,
      message: 'Department updated successfully',
      data: { department }
    });
  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating department',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private/Admin
const deleteDepartment = async (req, res) => {
  try {
    const departmentId = req.params.id;

    // Check if department has users
    const usersInDept = await User.countDocuments({ department: departmentId });
    if (usersInDept > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete department with existing users'
      });
    }

    const department = await Department.findByIdAndDelete(departmentId);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    res.json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting department',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get department statistics
// @route   GET /api/departments/stats
// @access  Private/Admin
const getDepartmentStats = async (req, res) => {
  try {
    const totalDepartments = await Department.countDocuments();
    const activeDepartments = await Department.countDocuments({ isActive: true });
    const departmentsWithHOD = await Department.countDocuments({ hod: { $exists: true } });

    const userStats = await User.aggregate([
      {
        $match: { department: { $exists: true } }
      },
      {
        $group: {
          _id: '$department',
          userCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: '_id',
          as: 'department'
        }
      },
      {
        $unwind: '$department'
      },
      {
        $project: {
          departmentName: '$department.name',
          userCount: 1
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalDepartments,
        activeDepartments,
        inactiveDepartments: totalDepartments - activeDepartments,
        departmentsWithHOD,
        userDistribution: userStats
      }
    });
  } catch (error) {
    console.error('Get department stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching department statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentStats
};
