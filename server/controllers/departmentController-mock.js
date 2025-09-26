// Mock departments database (in-memory)
const mockDepartments = [
  {
    _id: '1',
    name: 'Computer Science',
    code: 'CS',
    description: 'Department of Computer Science and Engineering',
    hod: '1', // admin user as HOD
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '2',
    name: 'Electronics and Communication',
    code: 'ECE',
    description: 'Department of Electronics and Communication Engineering',
    hod: '2', // user as HOD
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '3',
    name: 'Mechanical Engineering',
    code: 'ME',
    description: 'Department of Mechanical Engineering',
    hod: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '4',
    name: 'Civil Engineering',
    code: 'CE',
    description: 'Department of Civil Engineering',
    hod: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Mock users for reference
const mockUsers = [
  {
    _id: '1',
    name: 'Test Admin',
    email: 'admin@test.com',
    role: 'admin',
    department: '1'
  },
  {
    _id: '2',
    name: 'Test User',
    email: 'user@test.com',
    role: 'department',
    department: '2'
  }
];

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private
const getDepartments = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, isActive } = req.query;
    
    let filteredDepartments = [...mockDepartments];
    
    // Filter by search term
    if (search) {
      filteredDepartments = filteredDepartments.filter(dept => 
        dept.name.toLowerCase().includes(search.toLowerCase()) ||
        dept.code.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Filter by active status
    if (isActive !== undefined) {
      const activeFilter = isActive === 'true';
      filteredDepartments = filteredDepartments.filter(dept => dept.isActive === activeFilter);
    }
    
    // Sort by name
    filteredDepartments.sort((a, b) => a.name.localeCompare(b.name));
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedDepartments = filteredDepartments.slice(startIndex, endIndex);
    
    // Populate HOD information
    const departmentsWithHOD = paginatedDepartments.map(dept => {
      const hodUser = mockUsers.find(user => user._id === dept.hod);
      return {
        ...dept,
        hodInfo: hodUser ? {
          _id: hodUser._id,
          name: hodUser.name,
          email: hodUser.email,
          role: hodUser.role
        } : null
      };
    });
    
    res.json({
      success: true,
      data: {
        departments: departmentsWithHOD,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(filteredDepartments.length / limit),
          totalDepartments: filteredDepartments.length,
          hasNext: endIndex < filteredDepartments.length,
          hasPrev: page > 1
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
// @access  Private
const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const department = mockDepartments.find(dept => dept._id === id);
    
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }
    
    // Populate HOD information
    const hodUser = mockUsers.find(user => user._id === department.hod);
    const departmentWithHOD = {
      ...department,
      hodInfo: hodUser ? {
        _id: hodUser._id,
        name: hodUser.name,
        email: hodUser.email,
        role: hodUser.role
      } : null
    };
    
    res.json({
      success: true,
      data: { department: departmentWithHOD }
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
    
    // Check if department code already exists
    const existingDept = mockDepartments.find(dept => dept.code === code);
    if (existingDept) {
      return res.status(400).json({
        success: false,
        message: 'Department with this code already exists'
      });
    }
    
    // Validate HOD if provided
    if (hod) {
      const hodUser = mockUsers.find(user => user._id === hod);
      if (!hodUser) {
        return res.status(400).json({
          success: false,
          message: 'HOD user not found'
        });
      }
    }
    
    const newDepartment = {
      _id: (mockDepartments.length + 1).toString(),
      name,
      code,
      description: description || '',
      hod: hod || null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    mockDepartments.push(newDepartment);
    
    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: { department: newDepartment }
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
    const { id } = req.params;
    const { name, code, description, hod, isActive } = req.body;
    
    const departmentIndex = mockDepartments.findIndex(dept => dept._id === id);
    
    if (departmentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }
    
    // Check if code is being changed and if it already exists
    if (code && code !== mockDepartments[departmentIndex].code) {
      const existingDept = mockDepartments.find(dept => dept.code === code && dept._id !== id);
      if (existingDept) {
        return res.status(400).json({
          success: false,
          message: 'Department with this code already exists'
        });
      }
    }
    
    // Validate HOD if provided
    if (hod) {
      const hodUser = mockUsers.find(user => user._id === hod);
      if (!hodUser) {
        return res.status(400).json({
          success: false,
          message: 'HOD user not found'
        });
      }
    }
    
    // Update department
    const updatedDepartment = {
      ...mockDepartments[departmentIndex],
      name: name || mockDepartments[departmentIndex].name,
      code: code || mockDepartments[departmentIndex].code,
      description: description !== undefined ? description : mockDepartments[departmentIndex].description,
      hod: hod !== undefined ? hod : mockDepartments[departmentIndex].hod,
      isActive: isActive !== undefined ? isActive : mockDepartments[departmentIndex].isActive,
      updatedAt: new Date()
    };
    
    mockDepartments[departmentIndex] = updatedDepartment;
    
    res.json({
      success: true,
      message: 'Department updated successfully',
      data: { department: updatedDepartment }
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
    const { id } = req.params;
    
    const departmentIndex = mockDepartments.findIndex(dept => dept._id === id);
    
    if (departmentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }
    
    // Check if department has users assigned
    const hasUsers = mockUsers.some(user => user.department === id);
    if (hasUsers) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete department with assigned users'
      });
    }
    
    const deletedDepartment = mockDepartments.splice(departmentIndex, 1)[0];
    
    res.json({
      success: true,
      message: 'Department deleted successfully',
      data: { department: deletedDepartment }
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

// @desc    Get departments for HOD
// @route   GET /api/departments/hod/:hodId
// @access  Private
const getDepartmentsByHOD = async (req, res) => {
  try {
    const { hodId } = req.params;
    
    const hodDepartments = mockDepartments.filter(dept => dept.hod === hodId && dept.isActive);
    
    res.json({
      success: true,
      data: { departments: hodDepartments }
    });
  } catch (error) {
    console.error('Get departments by HOD error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching HOD departments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get department statistics
// @route   GET /api/departments/stats
// @access  Private
const getDepartmentStats = async (req, res) => {
  try {
    const totalDepartments = mockDepartments.length;
    const activeDepartments = mockDepartments.filter(dept => dept.isActive).length;
    const departmentsWithHOD = mockDepartments.filter(dept => dept.hod).length;
    const departmentsWithoutHOD = totalDepartments - departmentsWithHOD;
    
    res.json({
      success: true,
      data: {
        totalDepartments,
        activeDepartments,
        inactiveDepartments: totalDepartments - activeDepartments,
        departmentsWithHOD,
        departmentsWithoutHOD
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
  getDepartmentsByHOD,
  getDepartmentStats
};
