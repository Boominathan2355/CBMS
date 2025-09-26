const Expenditure = require('../models/Expenditure');
const Allocation = require('../models/Allocation');
const Department = require('../models/Department');
const BudgetHead = require('../models/BudgetHead');
const AuditLog = require('../models/AuditLog');
const { 
  notifyExpenditureSubmission, 
  notifyExpenditureApproval, 
  notifyExpenditureRejection 
} = require('../utils/notificationService');

// @desc    Get all expenditures
// @route   GET /api/expenditures
// @access  Private
const getExpenditures = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      department, 
      budgetHead, 
      status, 
      financialYear,
      search,
      submittedBy 
    } = req.query;

    const query = {};

    // Apply filters based on user role
    if (req.user.role === 'department' || req.user.role === 'hod') {
      query.department = req.user.department;
    } else if (department) {
      query.department = department;
    }

    if (budgetHead) query.budgetHead = budgetHead;
    if (status) query.status = status;
    if (financialYear) query.financialYear = financialYear;
    if (submittedBy) query.submittedBy = submittedBy;

    if (search) {
      query.$or = [
        { billNumber: { $regex: search, $options: 'i' } },
        { partyName: { $regex: search, $options: 'i' } },
        { expenseDetails: { $regex: search, $options: 'i' } }
      ];
    }

    const expenditures = await Expenditure.find(query)
      .populate('department', 'name code')
      .populate('budgetHead', 'name category')
      .populate('submittedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Expenditure.countDocuments(query);

    res.json({
      success: true,
      data: {
        expenditures,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get expenditures error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching expenditures',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get expenditure by ID
// @route   GET /api/expenditures/:id
// @access  Private
const getExpenditureById = async (req, res) => {
  try {
    const expenditure = await Expenditure.findById(req.params.id)
      .populate('department', 'name code')
      .populate('budgetHead', 'name category')
      .populate('submittedBy', 'name email')
      .populate('approvalSteps.approver', 'name email role');

    if (!expenditure) {
      return res.status(404).json({
        success: false,
        message: 'Expenditure not found'
      });
    }

    // Check if user can access this expenditure
    if (req.user.role === 'department' && expenditure.department._id.toString() !== req.user.department.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your department expenditures.'
      });
    }

    res.json({
      success: true,
      data: { expenditure }
    });
  } catch (error) {
    console.error('Get expenditure by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching expenditure',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Submit new expenditure
// @route   POST /api/expenditures
// @access  Private/Department
const submitExpenditure = async (req, res) => {
  const session = await Expenditure.startSession();
  session.startTransaction();

  try {
    const {
      budgetHead,
      billNumber,
      billDate,
      billAmount,
      partyName,
      expenseDetails,
      referenceBudgetRegisterNo,
      attachments
    } = req.body;

    // Validate required fields
    if (!budgetHead || !billNumber || !billDate || !billAmount || !partyName || !expenseDetails) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Get current financial year based on bill date
    const billDateObj = new Date(billDate);
    const year = billDateObj.getFullYear();
    const month = billDateObj.getMonth() + 1;
    const financialYear = month >= 4 ? `${year}-${year + 1}` : `${year - 1}-${year}`;

    // Check if allocation exists for this department and budget head
    const allocation = await Allocation.findOne({
      department: req.user.department,
      budgetHead,
      financialYear
    }).session(session);

    if (!allocation) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'No budget allocation found for this department and budget head'
      });
    }

    // Check if bill amount exceeds remaining budget
    const remainingAmount = allocation.allocatedAmount - allocation.spentAmount;
    if (parseFloat(billAmount) > remainingAmount) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Bill amount (₹${parseFloat(billAmount).toLocaleString()}) exceeds remaining budget (₹${remainingAmount.toLocaleString()})`,
        remainingBudget: remainingAmount
      });
    }

    // Check if bill number already exists for this department
    const existingBill = await Expenditure.findOne({
      department: req.user.department,
      billNumber,
      financialYear
    }).session(session);

    if (existingBill) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Bill number already exists for this department in the current financial year'
      });
    }

    const expenditure = await Expenditure.create([{
      department: req.user.department,
      budgetHead,
      billNumber,
      billDate: billDateObj,
      billAmount: parseFloat(billAmount),
      partyName,
      expenseDetails,
      attachments: attachments || [],
      referenceBudgetRegisterNo,
      submittedBy: req.user._id,
      financialYear,
      status: 'pending'
    }], { session });

    await session.commitTransaction();

    // Log the submission
    await AuditLog.create({
      eventType: 'expenditure_submitted',
      actor: req.user._id,
      actorRole: req.user.role,
      targetEntity: 'Expenditure',
      targetId: expenditure[0]._id,
      details: {
        billNumber,
        billAmount: parseFloat(billAmount),
        partyName,
        department: req.user.department
      }
    });

    const populatedExpenditure = await Expenditure.findById(expenditure[0]._id)
      .populate('department', 'name code')
      .populate('budgetHead', 'name category')
      .populate('submittedBy', 'name email');

    // Send notifications
    await notifyExpenditureSubmission(populatedExpenditure);

    res.status(201).json({
      success: true,
      message: 'Expenditure submitted successfully',
      data: { expenditure: populatedExpenditure }
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Submit expenditure error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting expenditure',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    session.endSession();
  }
};

// @desc    Approve expenditure
// @route   PUT /api/expenditures/:id/approve
// @access  Private/Office/VicePrincipal/Principal
const approveExpenditure = async (req, res) => {
  const session = await Expenditure.startSession();
  session.startTransaction();

  try {
    const { remarks } = req.body;
    const expenditureId = req.params.id;

    const expenditure = await Expenditure.findById(expenditureId).session(session);
    if (!expenditure) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: 'Expenditure not found'
      });
    }

    // Check if expenditure is in pending or verified status
    if (!['pending', 'verified'].includes(expenditure.status)) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Expenditure is not in a state that can be approved'
      });
    }

    // Get allocation
    const allocation = await Allocation.findOne({
      department: expenditure.department,
      budgetHead: expenditure.budgetHead,
      financialYear: expenditure.financialYear
    }).session(session);

    if (!allocation) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Allocation not found'
      });
    }

    // Check if approval would exceed budget
    const newSpentAmount = allocation.spentAmount + expenditure.billAmount;
    if (newSpentAmount > allocation.allocatedAmount) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Approval would exceed allocated budget'
      });
    }

    // Update expenditure status and add approval step
    expenditure.status = 'approved';
    expenditure.approvalSteps.push({
      approver: req.user._id,
      role: req.user.role,
      decision: 'approve',
      remarks: remarks || '',
      timestamp: new Date()
    });

    await expenditure.save({ session });

    // Update allocation spent amount
    allocation.spentAmount = newSpentAmount;
    await allocation.save({ session });

    await session.commitTransaction();

    // Log the approval
    await AuditLog.create({
      eventType: 'expenditure_approved',
      actor: req.user._id,
      actorRole: req.user.role,
      targetEntity: 'Expenditure',
      targetId: expenditureId,
      details: {
        billNumber: expenditure.billNumber,
        billAmount: expenditure.billAmount,
        remarks,
        newSpentAmount
      }
    });

    const populatedExpenditure = await Expenditure.findById(expenditureId)
      .populate('department', 'name code')
      .populate('budgetHead', 'name category')
      .populate('submittedBy', 'name email')
      .populate('approvalSteps.approver', 'name email role');

    // Send notifications
    await notifyExpenditureApproval(populatedExpenditure, req.user);

    res.json({
      success: true,
      message: 'Expenditure approved successfully',
      data: { expenditure: populatedExpenditure }
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Approve expenditure error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while approving expenditure',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    session.endSession();
  }
};

// @desc    Reject expenditure
// @route   PUT /api/expenditures/:id/reject
// @access  Private/Office/VicePrincipal/Principal
const rejectExpenditure = async (req, res) => {
  try {
    const { remarks } = req.body;
    const expenditureId = req.params.id;

    if (!remarks || remarks.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Remarks are mandatory when rejecting an expenditure'
      });
    }

    const expenditure = await Expenditure.findById(expenditureId);
    if (!expenditure) {
      return res.status(404).json({
        success: false,
        message: 'Expenditure not found'
      });
    }

    // Check if expenditure is in pending or verified status
    if (!['pending', 'verified'].includes(expenditure.status)) {
      return res.status(400).json({
        success: false,
        message: 'Expenditure is not in a state that can be rejected'
      });
    }

    // Update expenditure status and add rejection step
    expenditure.status = 'rejected';
    expenditure.approvalSteps.push({
      approver: req.user._id,
      role: req.user.role,
      decision: 'reject',
      remarks: remarks.trim(),
      timestamp: new Date()
    });

    await expenditure.save();

    // Log the rejection
    await AuditLog.create({
      eventType: 'expenditure_rejected',
      actor: req.user._id,
      actorRole: req.user.role,
      targetEntity: 'Expenditure',
      targetId: expenditureId,
      details: {
        billNumber: expenditure.billNumber,
        billAmount: expenditure.billAmount,
        remarks: remarks.trim()
      }
    });

    const populatedExpenditure = await Expenditure.findById(expenditureId)
      .populate('department', 'name code')
      .populate('budgetHead', 'name category')
      .populate('submittedBy', 'name email')
      .populate('approvalSteps.approver', 'name email role');

    // Send notifications
    await notifyExpenditureRejection(populatedExpenditure, req.user, remarks);

    res.json({
      success: true,
      message: 'Expenditure rejected successfully',
      data: { expenditure: populatedExpenditure }
    });
  } catch (error) {
    console.error('Reject expenditure error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while rejecting expenditure',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Verify expenditure (HOD)
// @route   PUT /api/expenditures/:id/verify
// @access  Private/HOD
const verifyExpenditure = async (req, res) => {
  try {
    const { remarks } = req.body;
    const expenditureId = req.params.id;

    const expenditure = await Expenditure.findById(expenditureId);
    if (!expenditure) {
      return res.status(404).json({
        success: false,
        message: 'Expenditure not found'
      });
    }

    // Check if expenditure belongs to HOD's department
    if (expenditure.department.toString() !== req.user.department.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only verify expenditures from your department'
      });
    }

    // Check if expenditure is in pending status
    if (expenditure.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending expenditures can be verified'
      });
    }

    // Update expenditure status and add verification step
    expenditure.status = 'verified';
    expenditure.approvalSteps.push({
      approver: req.user._id,
      role: req.user.role,
      decision: 'verify',
      remarks: remarks || '',
      timestamp: new Date()
    });

    await expenditure.save();

    // Log the verification
    await AuditLog.create({
      eventType: 'expenditure_verified',
      actor: req.user._id,
      actorRole: req.user.role,
      targetEntity: 'Expenditure',
      targetId: expenditureId,
      details: {
        billNumber: expenditure.billNumber,
        billAmount: expenditure.billAmount,
        remarks
      }
    });

    const populatedExpenditure = await Expenditure.findById(expenditureId)
      .populate('department', 'name code')
      .populate('budgetHead', 'name category')
      .populate('submittedBy', 'name email')
      .populate('approvalSteps.approver', 'name email role');

    res.json({
      success: true,
      message: 'Expenditure verified successfully',
      data: { expenditure: populatedExpenditure }
    });
  } catch (error) {
    console.error('Verify expenditure error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while verifying expenditure',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Resubmit expenditure
// @route   POST /api/expenditures/:id/resubmit
// @access  Private/Department
const resubmitExpenditure = async (req, res) => {
  try {
    const expenditureId = req.params.id;
    const {
      billNumber,
      billDate,
      billAmount,
      partyName,
      expenseDetails,
      referenceBudgetRegisterNo,
      attachments
    } = req.body;

    const originalExpenditure = await Expenditure.findById(expenditureId);
    if (!originalExpenditure) {
      return res.status(404).json({
        success: false,
        message: 'Original expenditure not found'
      });
    }

    // Check if user can resubmit this expenditure
    if (originalExpenditure.submittedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only resubmit your own expenditures'
      });
    }

    // Check if expenditure is rejected
    if (originalExpenditure.status !== 'rejected') {
      return res.status(400).json({
        success: false,
        message: 'Only rejected expenditures can be resubmitted'
      });
    }

    // Create new expenditure based on original
    const newExpenditure = await Expenditure.create({
      department: originalExpenditure.department,
      budgetHead: originalExpenditure.budgetHead,
      billNumber: billNumber || originalExpenditure.billNumber,
      billDate: billDate ? new Date(billDate) : originalExpenditure.billDate,
      billAmount: billAmount ? parseFloat(billAmount) : originalExpenditure.billAmount,
      partyName: partyName || originalExpenditure.partyName,
      expenseDetails: expenseDetails || originalExpenditure.expenseDetails,
      attachments: attachments || originalExpenditure.attachments,
      referenceBudgetRegisterNo: referenceBudgetRegisterNo || originalExpenditure.referenceBudgetRegisterNo,
      submittedBy: req.user._id,
      financialYear: originalExpenditure.financialYear,
      status: 'pending',
      isResubmission: true,
      originalExpenditureId: expenditureId
    });

    // Log the resubmission
    await AuditLog.create({
      eventType: 'expenditure_resubmitted',
      actor: req.user._id,
      actorRole: req.user.role,
      targetEntity: 'Expenditure',
      targetId: newExpenditure._id,
      details: {
        originalExpenditureId: expenditureId,
        billNumber: newExpenditure.billNumber,
        billAmount: newExpenditure.billAmount
      }
    });

    const populatedExpenditure = await Expenditure.findById(newExpenditure._id)
      .populate('department', 'name code')
      .populate('budgetHead', 'name category')
      .populate('submittedBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Expenditure resubmitted successfully',
      data: { expenditure: populatedExpenditure }
    });
  } catch (error) {
    console.error('Resubmit expenditure error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while resubmitting expenditure',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get expenditure statistics
// @route   GET /api/expenditures/stats
// @access  Private
const getExpenditureStats = async (req, res) => {
  try {
    const { financialYear, department } = req.query;

    const query = {};
    if (financialYear) query.financialYear = financialYear;
    if (department) query.department = department;
    
    // Apply department filter for department users
    if (req.user.role === 'department' || req.user.role === 'hod') {
      query.department = req.user.department;
    }

    const stats = await Expenditure.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$billAmount' }
        }
      }
    ]);

    const totalStats = await Expenditure.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalExpenditures: { $sum: 1 },
          totalAmount: { $sum: '$billAmount' },
          pendingAmount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'pending'] }, '$billAmount', 0]
            }
          },
          approvedAmount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'approved'] }, '$billAmount', 0]
            }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        byStatus: stats,
        summary: totalStats[0] || {
          totalExpenditures: 0,
          totalAmount: 0,
          pendingAmount: 0,
          approvedAmount: 0
        }
      }
    });
  } catch (error) {
    console.error('Get expenditure stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching expenditure statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getExpenditures,
  getExpenditureById,
  submitExpenditure,
  approveExpenditure,
  rejectExpenditure,
  verifyExpenditure,
  resubmitExpenditure,
  getExpenditureStats
};
