// Mock allocations database (in-memory)
const mockAllocations = [
  // Current year (2024-25) allocations
  {
    _id: '1',
    financialYear: '2024-25',
    departmentId: '1',
    departmentName: 'Computer Science',
    budgetHeadId: '1',
    budgetHeadName: 'Academic Expenses',
    budgetHeadCode: 'ACAD',
    allocatedAmount: 500000,
    spentAmount: 0,
    remainingAmount: 500000,
    createdBy: '1',
    createdByName: 'Test Admin',
    createdAt: new Date(),
    updatedAt: new Date(),
    remarks: 'Initial allocation for academic activities',
    isActive: true
  },
  {
    _id: '2',
    financialYear: '2024-25',
    departmentId: '1',
    departmentName: 'Computer Science',
    budgetHeadId: '2',
    budgetHeadName: 'Infrastructure Maintenance',
    budgetHeadCode: 'INFRA',
    allocatedAmount: 300000,
    spentAmount: 0,
    remainingAmount: 300000,
    createdBy: '1',
    createdByName: 'Test Admin',
    createdAt: new Date(),
    updatedAt: new Date(),
    remarks: 'Infrastructure maintenance allocation',
    isActive: true
  },
  {
    _id: '3',
    financialYear: '2024-25',
    departmentId: '2',
    departmentName: 'Electronics and Communication',
    budgetHeadId: '1',
    budgetHeadName: 'Academic Expenses',
    budgetHeadCode: 'ACAD',
    allocatedAmount: 400000,
    spentAmount: 0,
    remainingAmount: 400000,
    createdBy: '1',
    createdByName: 'Test Admin',
    createdAt: new Date(),
    updatedAt: new Date(),
    remarks: 'ECE department academic allocation',
    isActive: true
  },
  {
    _id: '4',
    financialYear: '2024-25',
    departmentId: '2',
    departmentName: 'Electronics and Communication',
    budgetHeadId: '4',
    budgetHeadName: 'Equipment Purchase',
    budgetHeadCode: 'EQUIP',
    allocatedAmount: 600000,
    spentAmount: 0,
    remainingAmount: 600000,
    createdBy: '1',
    createdByName: 'Test Admin',
    createdAt: new Date(),
    updatedAt: new Date(),
    remarks: 'Equipment purchase for ECE lab',
    isActive: true
  }
];

// Last year (2023-24) allocations for comparison
const lastYearAllocations = [
  {
    _id: 'ly1',
    financialYear: '2023-24',
    departmentId: '1',
    departmentName: 'Computer Science',
    budgetHeadId: '1',
    budgetHeadName: 'Academic Expenses',
    budgetHeadCode: 'ACAD',
    allocatedAmount: 450000,
    spentAmount: 420000,
    remainingAmount: 30000,
    createdBy: '1',
    createdByName: 'Test Admin',
    createdAt: new Date('2023-04-01'),
    updatedAt: new Date('2024-03-31'),
    remarks: 'Previous year academic allocation',
    isActive: false
  },
  {
    _id: 'ly2',
    financialYear: '2023-24',
    departmentId: '1',
    departmentName: 'Computer Science',
    budgetHeadId: '2',
    budgetHeadName: 'Infrastructure Maintenance',
    budgetHeadCode: 'INFRA',
    allocatedAmount: 250000,
    spentAmount: 180000,
    remainingAmount: 70000,
    createdBy: '1',
    createdByName: 'Test Admin',
    createdAt: new Date('2023-04-01'),
    updatedAt: new Date('2024-03-31'),
    remarks: 'Previous year infrastructure allocation',
    isActive: false
  },
  {
    _id: 'ly3',
    financialYear: '2023-24',
    departmentId: '2',
    departmentName: 'Electronics and Communication',
    budgetHeadId: '1',
    budgetHeadName: 'Academic Expenses',
    budgetHeadCode: 'ACAD',
    allocatedAmount: 350000,
    spentAmount: 320000,
    remainingAmount: 30000,
    createdBy: '1',
    createdByName: 'Test Admin',
    createdAt: new Date('2023-04-01'),
    updatedAt: new Date('2024-03-31'),
    remarks: 'Previous year ECE academic allocation',
    isActive: false
  },
  {
    _id: 'ly4',
    financialYear: '2023-24',
    departmentId: '2',
    departmentName: 'Electronics and Communication',
    budgetHeadId: '4',
    budgetHeadName: 'Equipment Purchase',
    budgetHeadCode: 'EQUIP',
    allocatedAmount: 500000,
    spentAmount: 450000,
    remainingAmount: 50000,
    createdBy: '1',
    createdByName: 'Test Admin',
    createdAt: new Date('2023-04-01'),
    updatedAt: new Date('2024-03-31'),
    remarks: 'Previous year ECE equipment allocation',
    isActive: false
  }
];

// Combine current and last year allocations
const allAllocations = [...mockAllocations, ...lastYearAllocations];

// Mock departments and budget heads (imported from other controllers)
const mockDepartments = [
  { _id: '1', name: 'Computer Science', code: 'CS', hodId: '3', hodName: 'John Doe' },
  { _id: '2', name: 'Electronics and Communication', code: 'ECE', hodId: null, hodName: null },
  { _id: '3', name: 'Mechanical Engineering', code: 'ME', hodId: null, hodName: null },
  { _id: '4', name: 'Civil Engineering', code: 'CE', hodId: null, hodName: null },
  { _id: '5', name: 'Electrical Engineering', code: 'EE', hodId: null, hodName: null },
  { _id: '6', name: 'Information Technology', code: 'IT', hodId: null, hodName: null }
];

const mockBudgetHeads = [
  { _id: '1', name: 'Academic Expenses', code: 'ACAD', category: 'Academic' },
  { _id: '2', name: 'Infrastructure Maintenance', code: 'INFRA', category: 'Infrastructure' },
  { _id: '3', name: 'Staff Salaries', code: 'SALARY', category: 'Personnel' },
  { _id: '4', name: 'Equipment Purchase', code: 'EQUIP', category: 'Equipment' },
  { _id: '5', name: 'Utilities', code: 'UTIL', category: 'Operations' },
  { _id: '6', name: 'Research Grants', code: 'RESEARCH', category: 'Research' }
];

// @desc    Get all allocations
// @route   GET /api/allocations
// @access  Private/Office
const getAllocations = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, departmentId, budgetHeadId, financialYear } = req.query;
    
    let filteredAllocations = [...allAllocations];
    
    // Filter by search term
    if (search) {
      filteredAllocations = filteredAllocations.filter(allocation => 
        allocation.departmentName.toLowerCase().includes(search.toLowerCase()) ||
        allocation.budgetHeadName.toLowerCase().includes(search.toLowerCase()) ||
        allocation.budgetHeadCode.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Filter by department
    if (departmentId) {
      filteredAllocations = filteredAllocations.filter(allocation => allocation.departmentId === departmentId);
    }
    
    // Filter by budget head
    if (budgetHeadId) {
      filteredAllocations = filteredAllocations.filter(allocation => allocation.budgetHeadId === budgetHeadId);
    }
    
    // Filter by financial year
    if (financialYear) {
      filteredAllocations = filteredAllocations.filter(allocation => allocation.financialYear === financialYear);
    }
    
    // Sort by department name, then budget head name
    filteredAllocations.sort((a, b) => {
      if (a.departmentName !== b.departmentName) {
        return a.departmentName.localeCompare(b.departmentName);
      }
      return a.budgetHeadName.localeCompare(b.budgetHeadName);
    });
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedAllocations = filteredAllocations.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: {
        allocations: paginatedAllocations,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(filteredAllocations.length / limit),
          totalAllocations: filteredAllocations.length,
          hasNext: endIndex < filteredAllocations.length,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get allocations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching allocations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get allocation by ID
// @route   GET /api/allocations/:id
// @access  Private/Office
const getAllocationById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const allocation = mockAllocations.find(allocation => allocation._id === id);
    
    if (!allocation) {
      return res.status(404).json({
        success: false,
        message: 'Allocation not found'
      });
    }
    
    res.json({
      success: true,
      data: { allocation }
    });
  } catch (error) {
    console.error('Get allocation by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching allocation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create new allocation
// @route   POST /api/allocations
// @access  Private/Office
const createAllocation = async (req, res) => {
  try {
    const { departmentId, budgetHeadId, allocatedAmount, financialYear, remarks } = req.body;
    
    // Validate required fields
    if (!departmentId || !budgetHeadId || !allocatedAmount || !financialYear) {
      return res.status(400).json({
        success: false,
        message: 'Department, budget head, amount, and financial year are required'
      });
    }
    
    // Check if allocation already exists for this department + budget head + financial year
    const existingAllocation = mockAllocations.find(allocation => 
      allocation.departmentId === departmentId &&
      allocation.budgetHeadId === budgetHeadId &&
      allocation.financialYear === financialYear &&
      allocation.isActive
    );
    
    if (existingAllocation) {
      return res.status(400).json({
        success: false,
        message: 'Allocation already exists for this department and budget head in this financial year'
      });
    }
    
    // Get department and budget head details
    const department = mockDepartments.find(dept => dept._id === departmentId);
    const budgetHead = mockBudgetHeads.find(head => head._id === budgetHeadId);
    
    if (!department) {
      return res.status(400).json({
        success: false,
        message: 'Department not found'
      });
    }
    
    if (!budgetHead) {
      return res.status(400).json({
        success: false,
        message: 'Budget head not found'
      });
    }
    
    const newAllocation = {
      _id: (mockAllocations.length + 1).toString(),
      financialYear,
      departmentId,
      departmentName: department.name,
      budgetHeadId,
      budgetHeadName: budgetHead.name,
      budgetHeadCode: budgetHead.code,
      allocatedAmount: parseFloat(allocatedAmount),
      spentAmount: 0,
      remainingAmount: parseFloat(allocatedAmount),
      createdBy: req.user._id,
      createdByName: req.user.name,
      createdAt: new Date(),
      updatedAt: new Date(),
      remarks: remarks || '',
      isActive: true
    };
    
    mockAllocations.push(newAllocation);
    
    res.status(201).json({
      success: true,
      message: 'Allocation created successfully',
      data: { allocation: newAllocation }
    });
  } catch (error) {
    console.error('Create allocation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating allocation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update allocation
// @route   PUT /api/allocations/:id
// @access  Private/Office
const updateAllocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { allocatedAmount, remarks } = req.body;
    
    const allocationIndex = mockAllocations.findIndex(allocation => allocation._id === id);
    
    if (allocationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Allocation not found'
      });
    }
    
    const allocation = mockAllocations[allocationIndex];
    
    // Calculate new remaining amount
    const newAllocatedAmount = parseFloat(allocatedAmount);
    const newRemainingAmount = newAllocatedAmount - allocation.spentAmount;
    
    // Update allocation
    const updatedAllocation = {
      ...allocation,
      allocatedAmount: newAllocatedAmount,
      remainingAmount: newRemainingAmount,
      remarks: remarks !== undefined ? remarks : allocation.remarks,
      updatedAt: new Date()
    };
    
    mockAllocations[allocationIndex] = updatedAllocation;
    
    res.json({
      success: true,
      message: 'Allocation updated successfully',
      data: { allocation: updatedAllocation }
    });
  } catch (error) {
    console.error('Update allocation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating allocation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete allocation
// @route   DELETE /api/allocations/:id
// @access  Private/Office
const deleteAllocation = async (req, res) => {
  try {
    const { id } = req.params;
    
    const allocationIndex = mockAllocations.findIndex(allocation => allocation._id === id);
    
    if (allocationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Allocation not found'
      });
    }
    
    const deletedAllocation = mockAllocations.splice(allocationIndex, 1)[0];
    
    res.json({
      success: true,
      message: 'Allocation deleted successfully',
      data: { allocation: deletedAllocation }
    });
  } catch (error) {
    console.error('Delete allocation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting allocation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get allocation statistics
// @route   GET /api/allocations/stats
// @access  Private/Office
const getAllocationStats = async (req, res) => {
  try {
    const { financialYear } = req.query;
    
    let allocations = mockAllocations;
    if (financialYear) {
      allocations = allocations.filter(allocation => allocation.financialYear === financialYear);
    }
    
    const totalAllocated = allocations.reduce((sum, allocation) => sum + allocation.allocatedAmount, 0);
    const totalSpent = allocations.reduce((sum, allocation) => sum + allocation.spentAmount, 0);
    const totalRemaining = totalAllocated - totalSpent;
    const utilizationPercentage = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;
    
    // Department-wise stats
    const departmentStats = {};
    allocations.forEach(allocation => {
      if (!departmentStats[allocation.departmentId]) {
        departmentStats[allocation.departmentId] = {
          departmentName: allocation.departmentName,
          totalAllocated: 0,
          totalSpent: 0,
          totalRemaining: 0
        };
      }
      departmentStats[allocation.departmentId].totalAllocated += allocation.allocatedAmount;
      departmentStats[allocation.departmentId].totalSpent += allocation.spentAmount;
      departmentStats[allocation.departmentId].totalRemaining += allocation.remainingAmount;
    });
    
    // Budget head-wise stats
    const budgetHeadStats = {};
    allocations.forEach(allocation => {
      if (!budgetHeadStats[allocation.budgetHeadId]) {
        budgetHeadStats[allocation.budgetHeadId] = {
          budgetHeadName: allocation.budgetHeadName,
          budgetHeadCode: allocation.budgetHeadCode,
          totalAllocated: 0,
          totalSpent: 0,
          totalRemaining: 0
        };
      }
      budgetHeadStats[allocation.budgetHeadId].totalAllocated += allocation.allocatedAmount;
      budgetHeadStats[allocation.budgetHeadId].totalSpent += allocation.spentAmount;
      budgetHeadStats[allocation.budgetHeadId].totalRemaining += allocation.remainingAmount;
    });
    
    res.json({
      success: true,
      data: {
        summary: {
          totalAllocated,
          totalSpent,
          totalRemaining,
          utilizationPercentage: Math.round(utilizationPercentage * 100) / 100,
          totalAllocations: allocations.length
        },
        departmentStats: Object.values(departmentStats),
        budgetHeadStats: Object.values(budgetHeadStats),
        financialYears: [...new Set(mockAllocations.map(a => a.financialYear))]
      }
    });
  } catch (error) {
    console.error('Get allocation stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching allocation statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Bulk create allocations
// @route   POST /api/allocations/bulk
// @access  Private/Office
const bulkCreateAllocations = async (req, res) => {
  try {
    const { allocations } = req.body;
    
    if (!Array.isArray(allocations) || allocations.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Allocations array is required'
      });
    }
    
    const createdAllocations = [];
    const errors = [];
    
    for (let i = 0; i < allocations.length; i++) {
      const allocationData = allocations[i];
      const { departmentId, budgetHeadId, allocatedAmount, financialYear, remarks } = allocationData;
      
      try {
        // Validate required fields
        if (!departmentId || !budgetHeadId || !allocatedAmount || !financialYear) {
          errors.push(`Row ${i + 1}: Missing required fields`);
          continue;
        }
        
        // Check if allocation already exists
        const existingAllocation = mockAllocations.find(allocation => 
          allocation.departmentId === departmentId &&
          allocation.budgetHeadId === budgetHeadId &&
          allocation.financialYear === financialYear &&
          allocation.isActive
        );
        
        if (existingAllocation) {
          errors.push(`Row ${i + 1}: Allocation already exists for this department and budget head`);
          continue;
        }
        
        // Get department and budget head details
        const department = mockDepartments.find(dept => dept._id === departmentId);
        const budgetHead = mockBudgetHeads.find(head => head._id === budgetHeadId);
        
        if (!department) {
          errors.push(`Row ${i + 1}: Department not found`);
          continue;
        }
        
        if (!budgetHead) {
          errors.push(`Row ${i + 1}: Budget head not found`);
          continue;
        }
        
        const newAllocation = {
          _id: (mockAllocations.length + createdAllocations.length + 1).toString(),
          financialYear,
          departmentId,
          departmentName: department.name,
          budgetHeadId,
          budgetHeadName: budgetHead.name,
          budgetHeadCode: budgetHead.code,
          allocatedAmount: parseFloat(allocatedAmount),
          spentAmount: 0,
          remainingAmount: parseFloat(allocatedAmount),
          createdBy: req.user._id,
          createdByName: req.user.name,
          createdAt: new Date(),
          updatedAt: new Date(),
          remarks: remarks || '',
          isActive: true
        };
        
        mockAllocations.push(newAllocation);
        createdAllocations.push(newAllocation);
        
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error.message}`);
      }
    }
    
    res.status(201).json({
      success: true,
      message: `Bulk allocation completed. ${createdAllocations.length} allocations created, ${errors.length} errors`,
      data: {
        createdAllocations,
        errors: errors.length > 0 ? errors : undefined
      }
    });
  } catch (error) {
    console.error('Bulk create allocations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating bulk allocations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get year comparison data
// @route   GET /api/allocations/year-comparison
// @access  Private (Office, VP, Principal, Admin)
const getYearComparison = async (req, res) => {
  try {
    const { currentYear = '2024-25', previousYear = '2023-24' } = req.query;
    
    // Get current year allocations
    const currentAllocations = allAllocations.filter(alloc => alloc.financialYear === currentYear);
    const previousAllocations = allAllocations.filter(alloc => alloc.financialYear === previousYear);
    
    // Calculate overall comparison
    const currentTotal = currentAllocations.reduce((sum, alloc) => sum + alloc.allocatedAmount, 0);
    const previousTotal = previousAllocations.reduce((sum, alloc) => sum + alloc.allocatedAmount, 0);
    const currentSpent = currentAllocations.reduce((sum, alloc) => sum + alloc.spentAmount, 0);
    const previousSpent = previousAllocations.reduce((sum, alloc) => sum + alloc.spentAmount, 0);
    
    const overallComparison = {
      currentYear,
      previousYear,
      allocationChange: {
        current: currentTotal,
        previous: previousTotal,
        change: currentTotal - previousTotal,
        changePercentage: previousTotal > 0 ? Math.round(((currentTotal - previousTotal) / previousTotal) * 100) : 0
      },
      spendingChange: {
        current: currentSpent,
        previous: previousSpent,
        change: currentSpent - previousSpent,
        changePercentage: previousSpent > 0 ? Math.round(((currentSpent - previousSpent) / previousSpent) * 100) : 0
      },
      utilizationChange: {
        current: currentTotal > 0 ? Math.round((currentSpent / currentTotal) * 100) : 0,
        previous: previousTotal > 0 ? Math.round((previousSpent / previousTotal) * 100) : 0,
        change: 0 // Will be calculated below
      }
    };
    
    overallComparison.utilizationChange.change = 
      overallComparison.utilizationChange.current - overallComparison.utilizationChange.previous;
    
    // Department-wise comparison
    const departmentComparison = {};
    
    // Get all unique departments
    const allDepartments = [...new Set([
      ...currentAllocations.map(alloc => alloc.departmentId),
      ...previousAllocations.map(alloc => alloc.departmentId)
    ])];
    
    allDepartments.forEach(deptId => {
      const deptName = mockDepartments.find(dept => dept._id === deptId)?.name || 'Unknown';
      const currentDeptAllocations = currentAllocations.filter(alloc => alloc.departmentId === deptId);
      const previousDeptAllocations = previousAllocations.filter(alloc => alloc.departmentId === deptId);
      
      const currentDeptTotal = currentDeptAllocations.reduce((sum, alloc) => sum + alloc.allocatedAmount, 0);
      const previousDeptTotal = previousDeptAllocations.reduce((sum, alloc) => sum + alloc.allocatedAmount, 0);
      const currentDeptSpent = currentDeptAllocations.reduce((sum, alloc) => sum + alloc.spentAmount, 0);
      const previousDeptSpent = previousDeptAllocations.reduce((sum, alloc) => sum + alloc.spentAmount, 0);
      
      departmentComparison[deptId] = {
        departmentId: deptId,
        departmentName: deptName,
        allocationChange: {
          current: currentDeptTotal,
          previous: previousDeptTotal,
          change: currentDeptTotal - previousDeptTotal,
          changePercentage: previousDeptTotal > 0 ? Math.round(((currentDeptTotal - previousDeptTotal) / previousDeptTotal) * 100) : 0
        },
        spendingChange: {
          current: currentDeptSpent,
          previous: previousDeptSpent,
          change: currentDeptSpent - previousDeptSpent,
          changePercentage: previousDeptSpent > 0 ? Math.round(((currentDeptSpent - previousDeptSpent) / previousDeptSpent) * 100) : 0
        },
        utilizationChange: {
          current: currentDeptTotal > 0 ? Math.round((currentDeptSpent / currentDeptTotal) * 100) : 0,
          previous: previousDeptTotal > 0 ? Math.round((previousDeptSpent / previousDeptTotal) * 100) : 0,
          change: 0
        }
      };
      
      departmentComparison[deptId].utilizationChange.change = 
        departmentComparison[deptId].utilizationChange.current - departmentComparison[deptId].utilizationChange.previous;
    });
    
    // Budget head-wise comparison
    const budgetHeadComparison = {};
    
    // Get all unique budget heads
    const allBudgetHeads = [...new Set([
      ...currentAllocations.map(alloc => alloc.budgetHeadId),
      ...previousAllocations.map(alloc => alloc.budgetHeadId)
    ])];
    
    allBudgetHeads.forEach(headId => {
      const headName = mockBudgetHeads.find(head => head._id === headId)?.name || 'Unknown';
      const currentHeadAllocations = currentAllocations.filter(alloc => alloc.budgetHeadId === headId);
      const previousHeadAllocations = previousAllocations.filter(alloc => alloc.budgetHeadId === headId);
      
      const currentHeadTotal = currentHeadAllocations.reduce((sum, alloc) => sum + alloc.allocatedAmount, 0);
      const previousHeadTotal = previousHeadAllocations.reduce((sum, alloc) => sum + alloc.allocatedAmount, 0);
      const currentHeadSpent = currentHeadAllocations.reduce((sum, alloc) => sum + alloc.spentAmount, 0);
      const previousHeadSpent = previousHeadAllocations.reduce((sum, alloc) => sum + alloc.spentAmount, 0);
      
      budgetHeadComparison[headId] = {
        budgetHeadId: headId,
        budgetHeadName: headName,
        allocationChange: {
          current: currentHeadTotal,
          previous: previousHeadTotal,
          change: currentHeadTotal - previousHeadTotal,
          changePercentage: previousHeadTotal > 0 ? Math.round(((currentHeadTotal - previousHeadTotal) / previousHeadTotal) * 100) : 0
        },
        spendingChange: {
          current: currentHeadSpent,
          previous: previousHeadSpent,
          change: currentHeadSpent - previousHeadSpent,
          changePercentage: previousHeadSpent > 0 ? Math.round(((currentHeadSpent - previousHeadSpent) / previousHeadSpent) * 100) : 0
        },
        utilizationChange: {
          current: currentHeadTotal > 0 ? Math.round((currentHeadSpent / currentHeadTotal) * 100) : 0,
          previous: previousHeadTotal > 0 ? Math.round((previousHeadSpent / previousHeadTotal) * 100) : 0,
          change: 0
        }
      };
      
      budgetHeadComparison[headId].utilizationChange.change = 
        budgetHeadComparison[headId].utilizationChange.current - budgetHeadComparison[headId].utilizationChange.previous;
    });
    
    res.json({
      success: true,
      data: {
        overallComparison,
        departmentComparison: Object.values(departmentComparison),
        budgetHeadComparison: Object.values(budgetHeadComparison),
        generatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Get year comparison error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating year comparison',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Import CSV processing utilities
const { 
  parseCSV, 
  validateCSVHeaders, 
  convertCSVRowToAllocation, 
  generateCSVTemplate,
  generateImportReport 
} = require('../utils/csvProcessor');

// @desc    Get CSV template for bulk allocation upload
// @route   GET /api/allocations/csv-template
// @access  Private (Office, VP, Principal, Admin)
const getCSVTemplate = async (req, res) => {
  try {
    const csvContent = generateCSVTemplate(mockDepartments, mockBudgetHeads);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=allocation-template.csv');
    res.send(csvContent);
  } catch (error) {
    console.error('Get CSV template error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating CSV template',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Upload and process CSV file for bulk allocation
// @route   POST /api/allocations/bulk-csv
// @access  Private (Office, VP, Principal, Admin)
const bulkUploadCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'CSV file is required'
      });
    }
    
    const csvContent = req.file.buffer.toString('utf8');
    
    // Parse CSV
    const parsedData = parseCSV(csvContent);
    
    // Validate headers
    const headerValidation = validateCSVHeaders(parsedData.headers);
    if (!headerValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid CSV headers',
        errors: {
          missingHeaders: headerValidation.missingHeaders,
          invalidHeaders: headerValidation.invalidHeaders
        }
      });
    }
    
    const results = [];
    const createdAllocations = [];
    const errors = [];
    
    // Process each row
    for (let i = 0; i < parsedData.rows.length; i++) {
      const row = parsedData.rows[i];
      
      try {
        const allocationData = convertCSVRowToAllocation(row, mockDepartments, mockBudgetHeads);
        
        if (!allocationData.isValid) {
          results.push({
            rowNumber: i + 1,
            success: false,
            message: allocationData.error,
            departmentName: row.department_name,
            budgetHeadName: row.budget_head_name,
            allocatedAmount: row.allocated_amount,
            financialYear: row.financial_year
          });
          errors.push(`Row ${i + 1}: ${allocationData.error}`);
          continue;
        }
        
        // Check if allocation already exists
        const existingAllocation = allAllocations.find(allocation => 
          allocation.departmentId === allocationData.departmentId &&
          allocation.budgetHeadId === allocationData.budgetHeadId &&
          allocation.financialYear === allocationData.financialYear &&
          allocation.isActive
        );
        
        if (existingAllocation) {
          results.push({
            rowNumber: i + 1,
            success: false,
            message: 'Allocation already exists for this department and budget head',
            departmentName: allocationData.departmentName,
            budgetHeadName: allocationData.budgetHeadName,
            allocatedAmount: allocationData.allocatedAmount,
            financialYear: allocationData.financialYear
          });
          errors.push(`Row ${i + 1}: Allocation already exists`);
          continue;
        }
        
        // Create allocation
        const newAllocation = {
          _id: (allAllocations.length + 1).toString(),
          financialYear: allocationData.financialYear,
          departmentId: allocationData.departmentId,
          departmentName: allocationData.departmentName,
          budgetHeadId: allocationData.budgetHeadId,
          budgetHeadName: allocationData.budgetHeadName,
          budgetHeadCode: allocationData.budgetHeadCode,
          allocatedAmount: allocationData.allocatedAmount,
          spentAmount: 0,
          remainingAmount: allocationData.allocatedAmount,
          createdBy: req.user.id,
          createdByName: req.user.name,
          createdAt: new Date(),
          updatedAt: new Date(),
          remarks: allocationData.remarks,
          isActive: true
        };
        
        allAllocations.push(newAllocation);
        createdAllocations.push(newAllocation);
        
        results.push({
          rowNumber: i + 1,
          success: true,
          message: 'Allocation created successfully',
          departmentName: allocationData.departmentName,
          budgetHeadName: allocationData.budgetHeadName,
          allocatedAmount: allocationData.allocatedAmount,
          financialYear: allocationData.financialYear
        });
        
      } catch (error) {
        results.push({
          rowNumber: i + 1,
          success: false,
          message: error.message,
          departmentName: row.department_name,
          budgetHeadName: row.budget_head_name,
          allocatedAmount: row.allocated_amount,
          financialYear: row.financial_year
        });
        errors.push(`Row ${i + 1}: ${error.message}`);
      }
    }
    
    // Generate import report
    const importReport = generateImportReport(results);
    
    res.json({
      success: true,
      message: `CSV processing completed. ${createdAllocations.length} allocations created, ${errors.length} errors`,
      data: {
        totalRows: parsedData.rows.length,
        successfulRows: createdAllocations.length,
        errorRows: errors.length,
        results: results,
        importReport: importReport,
        createdAllocations: createdAllocations
      }
    });
    
  } catch (error) {
    console.error('Bulk CSV upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing CSV file',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAllocations,
  getAllocationById,
  createAllocation,
  updateAllocation,
  deleteAllocation,
  getAllocationStats,
  bulkCreateAllocations,
  getYearComparison,
  getCSVTemplate,
  bulkUploadCSV,
  mockAllocations
};
