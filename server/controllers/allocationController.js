const Allocation = require('../models/Allocation');
const Department = require('../models/Department');
const BudgetHead = require('../models/BudgetHead');
const Expenditure = require('../models/Expenditure');

// @desc    Get all allocations
// @route   GET /api/allocations
// @access  Private/Office
const getAllocations = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      financialYear, 
      department, 
      budgetHead,
      search 
    } = req.query;

    const query = {};

    if (financialYear) query.financialYear = financialYear;
    if (department) query.department = department;
    if (budgetHead) query.budgetHead = budgetHead;
    if (search) {
      query.$or = [
        { remarks: { $regex: search, $options: 'i' } }
      ];
    }

    const allocations = await Allocation.find(query)
      .populate('department', 'name code')
      .populate('budgetHead', 'name category')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Allocation.countDocuments(query);

    res.json({
      success: true,
      data: {
        allocations,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
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
    const allocation = await Allocation.findById(req.params.id)
      .populate('department', 'name code')
      .populate('budgetHead', 'name category')
      .populate('createdBy', 'name email')
      .populate('lastModifiedBy', 'name email');

    if (!allocation) {
      return res.status(404).json({
        success: false,
        message: 'Allocation not found'
      });
    }

    // Get related expenditures
    const expenditures = await Expenditure.find({
      department: allocation.department._id,
      budgetHead: allocation.budgetHead._id,
      financialYear: allocation.financialYear
    })
    .populate('submittedBy', 'name email')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { 
        allocation,
        expenditures 
      }
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
  const session = await Allocation.startSession();
  session.startTransaction();

  try {
    const { 
      financialYear, 
      department, 
      budgetHead, 
      allocatedAmount, 
      remarks 
    } = req.body;

    // Validate required fields
    if (!financialYear || !department || !budgetHead || !allocatedAmount) {
      return res.status(400).json({
        success: false,
        message: 'Financial year, department, budget head, and allocated amount are required'
      });
    }

    // Check if allocation already exists for this combination
    const existingAllocation = await Allocation.findOne({
      financialYear,
      department,
      budgetHead
    }).session(session);

    if (existingAllocation) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Allocation already exists for this department and budget head in the specified financial year'
      });
    }

    // Validate department exists
    const deptExists = await Department.findById(department).session(session);
    if (!deptExists) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Validate budget head exists
    const budgetHeadExists = await BudgetHead.findById(budgetHead).session(session);
    if (!budgetHeadExists) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Budget head not found'
      });
    }

    const allocation = await Allocation.create([{
      financialYear,
      department,
      budgetHead,
      allocatedAmount: parseFloat(allocatedAmount),
      remarks,
      createdBy: req.user._id
    }], { session });

    await session.commitTransaction();

    const populatedAllocation = await Allocation.findById(allocation[0]._id)
      .populate('department', 'name code')
      .populate('budgetHead', 'name category')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Allocation created successfully',
      data: { allocation: populatedAllocation }
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Create allocation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating allocation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    session.endSession();
  }
};

// @desc    Update allocation
// @route   PUT /api/allocations/:id
// @access  Private/Office
const updateAllocation = async (req, res) => {
  const session = await Allocation.startSession();
  session.startTransaction();

  try {
    const { allocatedAmount, remarks } = req.body;
    const allocationId = req.params.id;

    const allocation = await Allocation.findById(allocationId).session(session);
    if (!allocation) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Allocation not found'
      });
    }

    // Check if new allocated amount is less than already spent amount
    if (allocatedAmount && parseFloat(allocatedAmount) < allocation.spentAmount) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Allocated amount cannot be less than already spent amount'
      });
    }

    const updateData = {};
    if (allocatedAmount !== undefined) updateData.allocatedAmount = parseFloat(allocatedAmount);
    if (remarks !== undefined) updateData.remarks = remarks;
    updateData.lastModifiedBy = req.user._id;

    const updatedAllocation = await Allocation.findByIdAndUpdate(
      allocationId,
      updateData,
      { new: true, runValidators: true, session }
    )
    .populate('department', 'name code')
    .populate('budgetHead', 'name category')
    .populate('createdBy', 'name email')
    .populate('lastModifiedBy', 'name email');

    await session.commitTransaction();

    res.json({
      success: true,
      message: 'Allocation updated successfully',
      data: { allocation: updatedAllocation }
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Update allocation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating allocation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    session.endSession();
  }
};

// @desc    Delete allocation
// @route   DELETE /api/allocations/:id
// @access  Private/Office
const deleteAllocation = async (req, res) => {
  try {
    const allocationId = req.params.id;

    // Check if allocation has expenditures
    const expendituresCount = await Expenditure.countDocuments({
      department: { $exists: true },
      budgetHead: { $exists: true },
      financialYear: { $exists: true }
    });

    if (expendituresCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete allocation with existing expenditures'
      });
    }

    const allocation = await Allocation.findByIdAndDelete(allocationId);
    if (!allocation) {
      return res.status(404).json({
        success: false,
        message: 'Allocation not found'
      });
    }

    res.json({
      success: true,
      message: 'Allocation deleted successfully'
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

    const query = {};
    if (financialYear) query.financialYear = financialYear;

    const stats = await Allocation.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalAllocated: { $sum: '$allocatedAmount' },
          totalSpent: { $sum: '$spentAmount' },
          totalAllocations: { $sum: 1 }
        }
      }
    ]);

    const departmentStats = await Allocation.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'departments',
          localField: 'department',
          foreignField: '_id',
          as: 'department'
        }
      },
      { $unwind: '$department' },
      {
        $group: {
          _id: '$department._id',
          departmentName: { $first: '$department.name' },
          totalAllocated: { $sum: '$allocatedAmount' },
          totalSpent: { $sum: '$spentAmount' }
        }
      },
      {
        $project: {
          departmentName: 1,
          totalAllocated: 1,
          totalSpent: 1,
          remaining: { $subtract: ['$totalAllocated', '$totalSpent'] },
          utilizationPercentage: {
            $multiply: [
              { $divide: ['$totalSpent', '$totalAllocated'] },
              100
            ]
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalAllocated: 0,
      totalSpent: 0,
      totalAllocations: 0
    };

    result.remaining = result.totalAllocated - result.totalSpent;
    result.utilizationPercentage = result.totalAllocated > 0 
      ? (result.totalSpent / result.totalAllocated) * 100 
      : 0;

    res.json({
      success: true,
      data: {
        summary: result,
        departmentBreakdown: departmentStats
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
  const session = await Allocation.startSession();
  session.startTransaction();

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
      
      try {
        // Validate required fields
        if (!allocationData.financialYear || !allocationData.department || 
            !allocationData.budgetHead || !allocationData.allocatedAmount) {
          errors.push(`Row ${i + 1}: Missing required fields`);
          continue;
        }

        // Check if allocation already exists
        const existingAllocation = await Allocation.findOne({
          financialYear: allocationData.financialYear,
          department: allocationData.department,
          budgetHead: allocationData.budgetHead
        }).session(session);

        if (existingAllocation) {
          errors.push(`Row ${i + 1}: Allocation already exists for this combination`);
          continue;
        }

        const allocation = await Allocation.create([{
          financialYear: allocationData.financialYear,
          department: allocationData.department,
          budgetHead: allocationData.budgetHead,
          allocatedAmount: parseFloat(allocationData.allocatedAmount),
          remarks: allocationData.remarks || '',
          createdBy: req.user._id
        }], { session });

        createdAllocations.push(allocation[0]);
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error.message}`);
      }
    }

    if (createdAllocations.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'No allocations were created',
        errors
      });
    }

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: `${createdAllocations.length} allocations created successfully`,
      data: {
        created: createdAllocations.length,
        total: allocations.length,
        errors: errors.length > 0 ? errors : undefined
      }
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Bulk create allocations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating bulk allocations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    session.endSession();
  }
};

module.exports = {
  getAllocations,
  getAllocationById,
  createAllocation,
  updateAllocation,
  deleteAllocation,
  getAllocationStats,
  bulkCreateAllocations
};
