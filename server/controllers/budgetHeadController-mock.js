// Mock budget heads database (in-memory)
const mockBudgetHeads = [
  {
    _id: '1',
    name: 'Academic Expenses',
    code: 'ACAD',
    description: 'Expenses related to academic activities, books, and educational materials',
    category: 'Academic',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '2',
    name: 'Infrastructure Maintenance',
    code: 'INFRA',
    description: 'Building maintenance, repairs, and infrastructure development',
    category: 'Infrastructure',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '3',
    name: 'Staff Salaries',
    code: 'SALARY',
    description: 'Monthly salaries and benefits for teaching and non-teaching staff',
    category: 'Personnel',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '4',
    name: 'Equipment Purchase',
    code: 'EQUIP',
    description: 'Purchase of laboratory equipment, computers, and other assets',
    category: 'Equipment',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '5',
    name: 'Utilities',
    code: 'UTIL',
    description: 'Electricity, water, internet, and other utility bills',
    category: 'Operations',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '6',
    name: 'Research Grants',
    code: 'RESEARCH',
    description: 'Funding for research projects and academic conferences',
    category: 'Research',
    isActive: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const budgetHeadCategories = [
  'Academic',
  'Infrastructure', 
  'Personnel',
  'Equipment',
  'Operations',
  'Research',
  'Administrative',
  'Student Services',
  'Marketing',
  'Other'
];

// @desc    Get all budget heads
// @route   GET /api/budget-heads
// @access  Private/Admin
const getBudgetHeads = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, isActive } = req.query;
    
    let filteredBudgetHeads = [...mockBudgetHeads];
    
    // Filter by search term
    if (search) {
      filteredBudgetHeads = filteredBudgetHeads.filter(head => 
        head.name.toLowerCase().includes(search.toLowerCase()) ||
        head.code.toLowerCase().includes(search.toLowerCase()) ||
        head.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Filter by category
    if (category) {
      filteredBudgetHeads = filteredBudgetHeads.filter(head => head.category === category);
    }
    
    // Filter by active status
    if (isActive !== undefined) {
      const activeFilter = isActive === 'true';
      filteredBudgetHeads = filteredBudgetHeads.filter(head => head.isActive === activeFilter);
    }
    
    // Sort by name
    filteredBudgetHeads.sort((a, b) => a.name.localeCompare(b.name));
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedBudgetHeads = filteredBudgetHeads.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: {
        budgetHeads: paginatedBudgetHeads,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(filteredBudgetHeads.length / limit),
          totalBudgetHeads: filteredBudgetHeads.length,
          hasNext: endIndex < filteredBudgetHeads.length,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get budget heads error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching budget heads',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get budget head by ID
// @route   GET /api/budget-heads/:id
// @access  Private/Admin
const getBudgetHeadById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const budgetHead = mockBudgetHeads.find(head => head._id === id);
    
    if (!budgetHead) {
      return res.status(404).json({
        success: false,
        message: 'Budget head not found'
      });
    }
    
    res.json({
      success: true,
      data: { budgetHead }
    });
  } catch (error) {
    console.error('Get budget head by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching budget head',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create new budget head
// @route   POST /api/budget-heads
// @access  Private/Admin
const createBudgetHead = async (req, res) => {
  try {
    const { name, code, description, category } = req.body;
    
    // Check if budget head code already exists
    const existingHead = mockBudgetHeads.find(head => head.code === code);
    if (existingHead) {
      return res.status(400).json({
        success: false,
        message: 'Budget head with this code already exists'
      });
    }
    
    // Validate category
    if (category && !budgetHeadCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category'
      });
    }
    
    const newBudgetHead = {
      _id: (mockBudgetHeads.length + 1).toString(),
      name,
      code,
      description: description || '',
      category: category || 'Other',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    mockBudgetHeads.push(newBudgetHead);
    
    res.status(201).json({
      success: true,
      message: 'Budget head created successfully',
      data: { budgetHead: newBudgetHead }
    });
  } catch (error) {
    console.error('Create budget head error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating budget head',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update budget head
// @route   PUT /api/budget-heads/:id
// @access  Private/Admin
const updateBudgetHead = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description, category, isActive } = req.body;
    
    const budgetHeadIndex = mockBudgetHeads.findIndex(head => head._id === id);
    
    if (budgetHeadIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Budget head not found'
      });
    }
    
    // Check if code is being changed and if it already exists
    if (code && code !== mockBudgetHeads[budgetHeadIndex].code) {
      const existingHead = mockBudgetHeads.find(head => head.code === code && head._id !== id);
      if (existingHead) {
        return res.status(400).json({
          success: false,
          message: 'Budget head with this code already exists'
        });
      }
    }
    
    // Validate category
    if (category && !budgetHeadCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category'
      });
    }
    
    // Update budget head
    const updatedBudgetHead = {
      ...mockBudgetHeads[budgetHeadIndex],
      name: name || mockBudgetHeads[budgetHeadIndex].name,
      code: code || mockBudgetHeads[budgetHeadIndex].code,
      description: description !== undefined ? description : mockBudgetHeads[budgetHeadIndex].description,
      category: category || mockBudgetHeads[budgetHeadIndex].category,
      isActive: isActive !== undefined ? isActive : mockBudgetHeads[budgetHeadIndex].isActive,
      updatedAt: new Date()
    };
    
    mockBudgetHeads[budgetHeadIndex] = updatedBudgetHead;
    
    res.json({
      success: true,
      message: 'Budget head updated successfully',
      data: { budgetHead: updatedBudgetHead }
    });
  } catch (error) {
    console.error('Update budget head error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating budget head',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete budget head
// @route   DELETE /api/budget-heads/:id
// @access  Private/Admin
const deleteBudgetHead = async (req, res) => {
  try {
    const { id } = req.params;
    
    const budgetHeadIndex = mockBudgetHeads.findIndex(head => head._id === id);
    
    if (budgetHeadIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Budget head not found'
      });
    }
    
    const deletedBudgetHead = mockBudgetHeads.splice(budgetHeadIndex, 1)[0];
    
    res.json({
      success: true,
      message: 'Budget head deleted successfully',
      data: { budgetHead: deletedBudgetHead }
    });
  } catch (error) {
    console.error('Delete budget head error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting budget head',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get budget head statistics
// @route   GET /api/budget-heads/stats
// @access  Private/Admin
const getBudgetHeadStats = async (req, res) => {
  try {
    const totalBudgetHeads = mockBudgetHeads.length;
    const activeBudgetHeads = mockBudgetHeads.filter(head => head.isActive).length;
    const inactiveBudgetHeads = totalBudgetHeads - activeBudgetHeads;
    
    const categoryStats = {};
    mockBudgetHeads.forEach(head => {
      categoryStats[head.category] = (categoryStats[head.category] || 0) + 1;
    });
    
    res.json({
      success: true,
      data: {
        totalBudgetHeads,
        activeBudgetHeads,
        inactiveBudgetHeads,
        categoryStats,
        categories: budgetHeadCategories
      }
    });
  } catch (error) {
    console.error('Get budget head stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching budget head statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getBudgetHeads,
  getBudgetHeadById,
  createBudgetHead,
  updateBudgetHead,
  deleteBudgetHead,
  getBudgetHeadStats
};
