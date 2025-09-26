// Mock users database (in-memory)
const mockUsers = [
  {
    _id: '1',
    name: 'Test Admin',
    email: 'admin@test.com',
    role: 'admin',
    department: '1',
    isActive: true,
    lastLogin: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '2',
    name: 'Test User',
    email: 'user@test.com',
    role: 'department',
    department: '2',
    isActive: true,
    lastLogin: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '3',
    name: 'John Doe',
    email: 'john@test.com',
    role: 'hod',
    department: '1',
    isActive: true,
    lastLogin: new Date(Date.now() - 86400000), // 1 day ago
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '4',
    name: 'Jane Smith',
    email: 'jane@test.com',
    role: 'office',
    department: null,
    isActive: true,
    lastLogin: new Date(Date.now() - 3600000), // 1 hour ago
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '5',
    name: 'Mike Johnson',
    email: 'mike@test.com',
    role: 'auditor',
    department: null,
    isActive: false,
    lastLogin: new Date(Date.now() - 604800000), // 1 week ago
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Mock departments for reference
const mockDepartments = [
  { _id: '1', name: 'Computer Science', code: 'CS' },
  { _id: '2', name: 'Electronics and Communication', code: 'ECE' },
  { _id: '3', name: 'Mechanical Engineering', code: 'ME' },
  { _id: '4', name: 'Civil Engineering', code: 'CE' },
  { _id: '5', name: 'Electrical Engineering', code: 'EE' },
  { _id: '6', name: 'Information Technology', code: 'IT' }
];

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, isActive, department } = req.query;
    
    let filteredUsers = [...mockUsers];
    
    // Filter by search term
    if (search) {
      filteredUsers = filteredUsers.filter(user => 
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Filter by role
    if (role) {
      filteredUsers = filteredUsers.filter(user => user.role === role);
    }
    
    // Filter by active status
    if (isActive !== undefined) {
      const activeFilter = isActive === 'true';
      filteredUsers = filteredUsers.filter(user => user.isActive === activeFilter);
    }
    
    // Filter by department
    if (department) {
      filteredUsers = filteredUsers.filter(user => user.department === department);
    }
    
    // Sort by name
    filteredUsers.sort((a, b) => a.name.localeCompare(b.name));
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
    
    // Populate department information
    const usersWithDepartment = paginatedUsers.map(user => {
      const userDepartment = mockDepartments.find(dept => dept._id === user.department);
      return {
        ...user,
        departmentInfo: userDepartment ? {
          _id: userDepartment._id,
          name: userDepartment.name,
          code: userDepartment.code
        } : null
      };
    });
    
    res.json({
      success: true,
      data: {
        users: usersWithDepartment,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(filteredUsers.length / limit),
          totalUsers: filteredUsers.length,
          hasNext: endIndex < filteredUsers.length,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = mockUsers.find(u => u._id === id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Populate department information
    const userDepartment = mockDepartments.find(dept => dept._id === user.department);
    const userWithDepartment = {
      ...user,
      departmentInfo: userDepartment ? {
        _id: userDepartment._id,
        name: userDepartment.name,
        code: userDepartment.code
      } : null
    };
    
    res.json({
      success: true,
      data: { user: userWithDepartment }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, department, isActive } = req.body;
    
    const userIndex = mockUsers.findIndex(u => u._id === id);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if email is being changed and if it already exists
    if (email && email !== mockUsers[userIndex].email) {
      const existingUser = mockUsers.find(u => u.email === email && u._id !== id);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already taken by another user'
        });
      }
    }
    
    // Validate department if provided
    if (department) {
      const deptExists = mockDepartments.find(dept => dept._id === department);
      if (!deptExists) {
        return res.status(400).json({
          success: false,
          message: 'Department not found'
        });
      }
    }
    
    // Update user
    const updatedUser = {
      ...mockUsers[userIndex],
      name: name || mockUsers[userIndex].name,
      email: email || mockUsers[userIndex].email,
      role: role || mockUsers[userIndex].role,
      department: department !== undefined ? department : mockUsers[userIndex].department,
      isActive: isActive !== undefined ? isActive : mockUsers[userIndex].isActive,
      updatedAt: new Date()
    };
    
    mockUsers[userIndex] = updatedUser;
    
    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user: updatedUser }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const userIndex = mockUsers.findIndex(u => u._id === id);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Prevent deletion of admin users
    if (mockUsers[userIndex].role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete admin users'
      });
    }
    
    const deletedUser = mockUsers.splice(userIndex, 1)[0];
    
    res.json({
      success: true,
      message: 'User deleted successfully',
      data: { user: deletedUser }
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get users by role
// @route   GET /api/users/role/:role
// @access  Private
const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const roleUsers = mockUsers.filter(u => u.role === role && u.isActive);
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedUsers = roleUsers.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: {
        users: paginatedUsers,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(roleUsers.length / limit),
          totalUsers: roleUsers.length,
          hasNext: endIndex < roleUsers.length,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get users by role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users by role',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get users in HOD's department
// @route   GET /api/users/department/:departmentId
// @access  Private
const getUsersByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const { page = 1, limit = 10, search, isActive } = req.query;
    
    // Get users in the specified department
    let departmentUsers = mockUsers.filter(u => u.department === departmentId);
    
    // Filter by search term
    if (search) {
      departmentUsers = departmentUsers.filter(user => 
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Filter by active status
    if (isActive !== undefined) {
      const activeFilter = isActive === 'true';
      departmentUsers = departmentUsers.filter(user => user.isActive === activeFilter);
    }
    
    // Sort by name
    departmentUsers.sort((a, b) => a.name.localeCompare(b.name));
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedUsers = departmentUsers.slice(startIndex, endIndex);
    
    // Get department info
    const department = mockDepartments.find(dept => dept._id === departmentId);
    
    // Populate department information
    const usersWithDepartment = paginatedUsers.map(user => ({
      ...user,
      departmentInfo: department ? {
        _id: department._id,
        name: department.name,
        code: department.code
      } : null
    }));
    
    res.json({
      success: true,
      data: {
        department: department,
        users: usersWithDepartment,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(departmentUsers.length / limit),
          totalUsers: departmentUsers.length,
          hasNext: endIndex < departmentUsers.length,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get users by department error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching department users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private/Admin
const getUserStats = async (req, res) => {
  try {
    const totalUsers = mockUsers.length;
    const activeUsers = mockUsers.filter(u => u.isActive).length;
    const inactiveUsers = totalUsers - activeUsers;
    
    const roleStats = {};
    mockUsers.forEach(user => {
      roleStats[user.role] = (roleStats[user.role] || 0) + 1;
    });
    
    const departmentStats = {};
    mockUsers.forEach(user => {
      if (user.department) {
        const dept = mockDepartments.find(d => d._id === user.department);
        if (dept) {
          departmentStats[dept.name] = (departmentStats[dept.name] || 0) + 1;
        }
      }
    });
    
    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        roleStats,
        departmentStats
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUsersByRole,
  getUsersByDepartment,
  getUserStats
};
