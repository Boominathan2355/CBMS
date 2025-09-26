// Mock expenditures database (in-memory)
const mockExpenditures = [
  {
    _id: '1',
    departmentId: '1',
    departmentName: 'Computer Science',
    budgetHeadId: '1',
    budgetHeadName: 'Academic Expenses',
    budgetHeadCode: 'ACAD',
    billNumber: 'CS-001',
    billDate: new Date('2024-09-01'),
    billAmount: 15000,
    partyName: 'ABC Book Store',
    expenseDetails: 'Purchase of programming books for computer lab',
    attachments: [
      {
        filename: 'bill_cs_001.pdf',
        originalName: 'bill_cs_001.pdf',
        mimetype: 'application/pdf',
        size: 245760,
        url: '/uploads/bill_cs_001.pdf'
      }
    ],
    referenceBudgetRegisterNo: 'BR-2024-001',
    submittedBy: '2',
    submittedByName: 'Test User',
    submittedAt: new Date('2024-09-01T10:00:00Z'),
    status: 'pending',
    approvalHistory: [],
    currentApprover: 'office',
    remarks: '',
    createdAt: new Date('2024-09-01T10:00:00Z'),
    updatedAt: new Date('2024-09-01T10:00:00Z')
  },
  {
    _id: '2',
    departmentId: '2',
    departmentName: 'Electronics and Communication',
    budgetHeadId: '4',
    budgetHeadName: 'Equipment Purchase',
    budgetHeadCode: 'EQUIP',
    billNumber: 'ECE-001',
    billDate: new Date('2024-09-05'),
    billAmount: 25000,
    partyName: 'Tech Solutions Ltd',
    expenseDetails: 'Purchase of oscilloscope for electronics lab',
    attachments: [
      {
        filename: 'bill_ece_001.pdf',
        originalName: 'bill_ece_001.pdf',
        mimetype: 'application/pdf',
        size: 512000,
        url: '/uploads/bill_ece_001.pdf'
      }
    ],
    referenceBudgetRegisterNo: 'BR-2024-002',
    submittedBy: '2',
    submittedByName: 'Test User',
    submittedAt: new Date('2024-09-05T14:30:00Z'),
    status: 'approved',
    approvalHistory: [
      {
        approverId: '1',
        approverName: 'Test Admin',
        approverRole: 'office',
        decision: 'approved',
        remarks: 'Approved as per budget allocation',
        timestamp: new Date('2024-09-06T09:00:00Z')
      }
    ],
    currentApprover: null,
    remarks: 'Approved as per budget allocation',
    createdAt: new Date('2024-09-05T14:30:00Z'),
    updatedAt: new Date('2024-09-06T09:00:00Z')
  }
];

// Import mock data from other controllers
const mockAllocations = [
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
    isActive: true
  },
  {
    _id: '2',
    financialYear: '2024-25',
    departmentId: '2',
    departmentName: 'Electronics and Communication',
    budgetHeadId: '4',
    budgetHeadName: 'Equipment Purchase',
    budgetHeadCode: 'EQUIP',
    allocatedAmount: 600000,
    spentAmount: 25000,
    remainingAmount: 575000,
    isActive: true
  }
];

const mockDepartments = [
  { _id: '1', name: 'Computer Science', code: 'CS' },
  { _id: '2', name: 'Electronics and Communication', code: 'ECE' }
];

const mockBudgetHeads = [
  { _id: '1', name: 'Academic Expenses', code: 'ACAD', category: 'Academic' },
  { _id: '4', name: 'Equipment Purchase', code: 'EQUIP', category: 'Equipment' }
];

// Import notification functions
const { notifyExpenditureSubmitted, notifyExpenditureApproved, notifyExpenditureRejected } = require('./notificationController-mock');

// Import concurrency control
const { atomicBudgetUpdate } = require('../middleware/concurrencyControl');

// @desc    Get all expenditures
// @route   GET /api/expenditures
// @access  Private
const getExpenditures = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, departmentId, budgetHeadId, status, submittedBy } = req.query;
    const user = req.user;
    
    let filteredExpenditures = [...mockExpenditures];
    
    // Filter by user role and department
    if (user.role === 'department') {
      filteredExpenditures = filteredExpenditures.filter(exp => exp.departmentId === user.department);
    } else if (user.role === 'hod') {
      // HOD can see expenditures from their department
      const hodDepartment = mockDepartments.find(dept => dept.hodId === user._id);
      if (hodDepartment) {
        filteredExpenditures = filteredExpenditures.filter(exp => exp.departmentId === hodDepartment._id);
      }
    }
    
    // Filter by search term
    if (search) {
      filteredExpenditures = filteredExpenditures.filter(exp => 
        exp.billNumber.toLowerCase().includes(search.toLowerCase()) ||
        exp.partyName.toLowerCase().includes(search.toLowerCase()) ||
        exp.expenseDetails.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Filter by department
    if (departmentId) {
      filteredExpenditures = filteredExpenditures.filter(exp => exp.departmentId === departmentId);
    }
    
    // Filter by budget head
    if (budgetHeadId) {
      filteredExpenditures = filteredExpenditures.filter(exp => exp.budgetHeadId === budgetHeadId);
    }
    
    // Filter by status
    if (status) {
      filteredExpenditures = filteredExpenditures.filter(exp => exp.status === status);
    }
    
    // Filter by submitted by
    if (submittedBy) {
      filteredExpenditures = filteredExpenditures.filter(exp => exp.submittedBy === submittedBy);
    }
    
    // Sort by submission date (newest first)
    filteredExpenditures.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedExpenditures = filteredExpenditures.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: {
        expenditures: paginatedExpenditures,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(filteredExpenditures.length / limit),
          totalExpenditures: filteredExpenditures.length,
          hasNext: endIndex < filteredExpenditures.length,
          hasPrev: page > 1
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
    const { id } = req.params;
    const user = req.user;
    
    const expenditure = mockExpenditures.find(exp => exp._id === id);
    
    if (!expenditure) {
      return res.status(404).json({
        success: false,
        message: 'Expenditure not found'
      });
    }
    
    // Check access permissions
    if (user.role === 'department' && expenditure.departmentId !== user.department) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
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
  try {
    const { 
      budgetHeadId, 
      billNumber, 
      billDate, 
      billAmount, 
      partyName, 
      expenseDetails, 
      referenceBudgetRegisterNo
    } = req.body;
    
    // Process uploaded files
    const attachments = req.uploadedFiles ? req.uploadedFiles.map(file => ({
      filename: file.filename,
      originalName: file.originalName,
      mimetype: file.mimetype,
      size: file.size,
      url: file.url
    })) : [];
    
    const user = req.user;
    
    // Validate required fields
    if (!budgetHeadId || !billNumber || !billDate || !billAmount || !partyName || !expenseDetails) {
      return res.status(400).json({
        success: false,
        message: 'Budget head, bill number, bill date, bill amount, party name, and expense details are required'
      });
    }
    
    // Check if user has department
    if (!user.department) {
      return res.status(400).json({
        success: false,
        message: 'User must be assigned to a department to submit expenditures'
      });
    }
    
    // Get department and budget head details
    const department = mockDepartments.find(dept => dept._id === user.department);
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
    
    // Determine approval workflow based on department HOD
    let currentApprover = 'office'; // Default to office approval
    let approvalWorkflow = ['office']; // Default workflow
    
    if (department.hod) {
      // Department has HOD - use multi-level approval
      currentApprover = 'hod';
      approvalWorkflow = ['hod', 'office'];
    }
    
    // Check if allocation exists for this department and budget head
    const allocation = mockAllocations.find(allocation => 
      allocation.departmentId === user.department &&
      allocation.budgetHeadId === budgetHeadId &&
      allocation.isActive
    );
    
    if (!allocation) {
      return res.status(400).json({
        success: false,
        message: 'No budget allocation found for this department and budget head'
      });
    }
    
    // Check if bill amount exceeds remaining budget
    if (parseFloat(billAmount) > allocation.remainingAmount) {
      return res.status(400).json({
        success: false,
        message: `Bill amount exceeds remaining budget. Available: ₹${allocation.remainingAmount.toLocaleString()}`
      });
    }
    
    const newExpenditure = {
      _id: (mockExpenditures.length + 1).toString(),
      departmentId: user.department,
      departmentName: department.name,
      budgetHeadId,
      budgetHeadName: budgetHead.name,
      budgetHeadCode: budgetHead.code,
      billNumber,
      billDate: new Date(billDate),
      billAmount: parseFloat(billAmount),
      partyName,
      expenseDetails,
      attachments: attachments || [],
      referenceBudgetRegisterNo: referenceBudgetRegisterNo || '',
      submittedBy: user._id,
      submittedByName: user.name,
      submittedAt: new Date(),
      status: 'pending',
      approvalHistory: [],
      currentApprover: currentApprover,
      approvalWorkflow: approvalWorkflow,
      hodId: department.hod || null,
      remarks: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    mockExpenditures.push(newExpenditure);
    
    // Send notification to appropriate approver
    if (currentApprover === 'hod') {
      // Send notification to HOD
      await notifyExpenditureSubmitted(newExpenditure, 'hod');
    } else {
      // Send notification to office users
      await notifyExpenditureSubmitted(newExpenditure, 'office');
    }
    
    res.status(201).json({
      success: true,
      message: `Expenditure submitted successfully. Awaiting ${currentApprover === 'hod' ? 'HOD' : 'Office'} approval.`,
      data: { expenditure: newExpenditure }
    });
  } catch (error) {
    console.error('Submit expenditure error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting expenditure',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Approve expenditure
// @route   PUT /api/expenditures/:id/approve
// @access  Private/Office+
const approveExpenditure = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;
    const user = req.user;
    
    const expenditureIndex = mockExpenditures.findIndex(exp => exp._id === id);
    
    if (expenditureIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Expenditure not found'
      });
    }
    
    const expenditure = mockExpenditures[expenditureIndex];
    
    // Check if expenditure can be approved
    if (expenditure.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Expenditure is not in pending status'
      });
    }
    
    // Find the allocation
    const allocationIndex = mockAllocations.findIndex(allocation => 
      allocation.departmentId === expenditure.departmentId &&
      allocation.budgetHeadId === expenditure.budgetHeadId &&
      allocation.isActive
    );
    
    if (allocationIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'Allocation not found'
      });
    }
    
    const allocation = mockAllocations[allocationIndex];
    
    // Check if there's enough remaining budget
    if (expenditure.billAmount > allocation.remainingAmount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient budget. Available: ₹${allocation.remainingAmount.toLocaleString()}`
      });
    }
    
    // Determine next approver in workflow
    const currentWorkflowIndex = expenditure.approvalWorkflow.indexOf(expenditure.currentApprover);
    const nextApprover = expenditure.approvalWorkflow[currentWorkflowIndex + 1];
    
    let updatedExpenditure;
    let isFinalApproval = false;
    
    if (nextApprover) {
      // Move to next approver in workflow
      updatedExpenditure = {
        ...expenditure,
        status: 'pending',
        currentApprover: nextApprover,
        remarks: remarks || '',
        approvalHistory: [
          ...expenditure.approvalHistory,
          {
            approverId: user._id,
            approverName: user.name,
            approverRole: user.role,
            decision: 'approved',
            remarks: remarks || '',
            timestamp: new Date()
          }
        ],
        updatedAt: new Date()
      };
    } else {
      // Final approval - mark as approved
      updatedExpenditure = {
        ...expenditure,
        status: 'approved',
        currentApprover: null,
        remarks: remarks || '',
        approvalHistory: [
          ...expenditure.approvalHistory,
          {
            approverId: user._id,
            approverName: user.name,
            approverRole: user.role,
            decision: 'approved',
            remarks: remarks || '',
            timestamp: new Date()
          }
        ],
        updatedAt: new Date()
      };
      isFinalApproval = true;
    }
    
    // Update allocation atomically with concurrency control (only on final approval)
    let updatedAllocation = allocation;
    if (isFinalApproval) {
      updatedAllocation = await atomicBudgetUpdate(
        allocation._id,
        async () => {
          // Double-check allocation hasn't changed
          const currentAllocation = mockAllocations[allocationIndex];
          if (currentAllocation.spentAmount !== allocation.spentAmount) {
            throw new Error('Allocation has been modified by another user. Please refresh and try again.');
          }
          
          // Check if there's enough remaining budget
          if (currentAllocation.remainingAmount < expenditure.billAmount) {
            throw new Error('Insufficient remaining budget for this expenditure');
          }
          
          // Update allocation
          const updatedAllocation = {
            ...currentAllocation,
            spentAmount: currentAllocation.spentAmount + expenditure.billAmount,
            remainingAmount: currentAllocation.remainingAmount - expenditure.billAmount,
            updatedAt: new Date()
          };
          
          mockAllocations[allocationIndex] = updatedAllocation;
          return updatedAllocation;
        },
        user.id
      );
    }
    
    mockExpenditures[expenditureIndex] = updatedExpenditure;
    
    // Send notifications
    if (isFinalApproval) {
      // Send notification to submitter about final approval
      await notifyExpenditureApproved(updatedExpenditure, user);
    } else {
      // Send notification to next approver
      await notifyExpenditureSubmitted(updatedExpenditure, nextApprover);
    }
    
    res.json({
      success: true,
      message: isFinalApproval 
        ? 'Expenditure approved and budget deducted successfully'
        : `Expenditure approved by ${user.role}. Forwarded to ${nextApprover} for final approval.`,
      data: { expenditure: updatedExpenditure }
    });
  } catch (error) {
    console.error('Approve expenditure error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while approving expenditure',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Reject expenditure
// @route   PUT /api/expenditures/:id/reject
// @access  Private/Office+
const rejectExpenditure = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;
    const user = req.user;
    
    if (!remarks) {
      return res.status(400).json({
        success: false,
        message: 'Remarks are required for rejection'
      });
    }
    
    const expenditureIndex = mockExpenditures.findIndex(exp => exp._id === id);
    
    if (expenditureIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Expenditure not found'
      });
    }
    
    const expenditure = mockExpenditures[expenditureIndex];
    
    // Check if expenditure can be rejected
    if (expenditure.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Expenditure is not in pending status'
      });
    }
    
    // Update expenditure
    const updatedExpenditure = {
      ...expenditure,
      status: 'rejected',
      currentApprover: null,
      remarks: remarks,
      approvalHistory: [
        ...expenditure.approvalHistory,
        {
          approverId: user._id,
          approverName: user.name,
          approverRole: user.role,
          decision: 'rejected',
          remarks: remarks,
          timestamp: new Date()
        }
      ],
      updatedAt: new Date()
    };
    
    mockExpenditures[expenditureIndex] = updatedExpenditure;
    
    // Send notification to submitter
    await notifyExpenditureRejected(updatedExpenditure, user, remarks);
    
    res.json({
      success: true,
      message: 'Expenditure rejected successfully',
      data: { expenditure: updatedExpenditure }
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

// @desc    Get expenditure statistics
// @route   GET /api/expenditures/stats
// @access  Private
const getExpenditureStats = async (req, res) => {
  try {
    const { departmentId, budgetHeadId, status } = req.query;
    const user = req.user;
    
    let filteredExpenditures = [...mockExpenditures];
    
    // Filter by user role and department
    if (user.role === 'department') {
      filteredExpenditures = filteredExpenditures.filter(exp => exp.departmentId === user.department);
    }
    
    // Apply additional filters
    if (departmentId) {
      filteredExpenditures = filteredExpenditures.filter(exp => exp.departmentId === departmentId);
    }
    
    if (budgetHeadId) {
      filteredExpenditures = filteredExpenditures.filter(exp => exp.budgetHeadId === budgetHeadId);
    }
    
    if (status) {
      filteredExpenditures = filteredExpenditures.filter(exp => exp.status === status);
    }
    
    const totalExpenditures = filteredExpenditures.length;
    const pendingExpenditures = filteredExpenditures.filter(exp => exp.status === 'pending').length;
    const approvedExpenditures = filteredExpenditures.filter(exp => exp.status === 'approved').length;
    const rejectedExpenditures = filteredExpenditures.filter(exp => exp.status === 'rejected').length;
    
    const totalAmount = filteredExpenditures.reduce((sum, exp) => sum + exp.billAmount, 0);
    const approvedAmount = filteredExpenditures
      .filter(exp => exp.status === 'approved')
      .reduce((sum, exp) => sum + exp.billAmount, 0);
    
    // Department-wise stats
    const departmentStats = {};
    filteredExpenditures.forEach(exp => {
      if (!departmentStats[exp.departmentId]) {
        departmentStats[exp.departmentId] = {
          departmentName: exp.departmentName,
          totalExpenditures: 0,
          totalAmount: 0,
          approvedAmount: 0,
          pendingAmount: 0
        };
      }
      departmentStats[exp.departmentId].totalExpenditures++;
      departmentStats[exp.departmentId].totalAmount += exp.billAmount;
      if (exp.status === 'approved') {
        departmentStats[exp.departmentId].approvedAmount += exp.billAmount;
      } else if (exp.status === 'pending') {
        departmentStats[exp.departmentId].pendingAmount += exp.billAmount;
      }
    });
    
    res.json({
      success: true,
      data: {
        summary: {
          totalExpenditures,
          pendingExpenditures,
          approvedExpenditures,
          rejectedExpenditures,
          totalAmount,
          approvedAmount,
          pendingAmount: totalAmount - approvedAmount
        },
        departmentStats: Object.values(departmentStats)
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

// @desc    Resubmit rejected expenditure
// @route   POST /api/expenditures/:id/resubmit
// @access  Private (Department users)
const resubmitExpenditure = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      billNumber, 
      billDate, 
      billAmount, 
      partyName, 
      expenseDetails, 
      referenceBudgetRegisterNo,
      remarks
    } = req.body;
    const user = req.user;
    
    const expenditureIndex = mockExpenditures.findIndex(exp => exp._id === id);
    
    if (expenditureIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Expenditure not found'
      });
    }
    
    const originalExpenditure = mockExpenditures[expenditureIndex];
    
    // Check if expenditure can be resubmitted
    if (originalExpenditure.status !== 'rejected') {
      return res.status(400).json({
        success: false,
        message: 'Only rejected expenditures can be resubmitted'
      });
    }
    
    // Check if user is authorized to resubmit
    if (originalExpenditure.submittedBy !== user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only resubmit your own expenditures'
      });
    }
    
    // Validate required fields
    if (!billNumber || !billDate || !billAmount || !partyName || !expenseDetails) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }
    
    // Find the allocation to check budget
    const allocation = mockAllocations.find(alloc => 
      alloc.departmentId === originalExpenditure.departmentId &&
      alloc.budgetHeadId === originalExpenditure.budgetHeadId &&
      alloc.isActive
    );
    
    if (!allocation) {
      return res.status(400).json({
        success: false,
        message: 'Budget allocation not found'
      });
    }
    
    // Check if there's enough remaining budget
    if (allocation.remainingAmount < billAmount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient remaining budget. Available: ₹${allocation.remainingAmount.toLocaleString()}, Required: ₹${billAmount.toLocaleString()}`
      });
    }
    
    // Process uploaded files
    const attachments = req.uploadedFiles ? req.uploadedFiles.map(file => ({
      filename: file.filename,
      originalName: file.originalName,
      mimetype: file.mimetype,
      size: file.size,
      url: file.url
    })) : originalExpenditure.attachments; // Keep original attachments if no new ones
    
    // Create resubmitted expenditure
    const resubmittedExpenditure = {
      ...originalExpenditure,
      billNumber: billNumber || originalExpenditure.billNumber,
      billDate: billDate || originalExpenditure.billDate,
      billAmount: billAmount || originalExpenditure.billAmount,
      partyName: partyName || originalExpenditure.partyName,
      expenseDetails: expenseDetails || originalExpenditure.expenseDetails,
      referenceBudgetRegisterNo: referenceBudgetRegisterNo || originalExpenditure.referenceBudgetRegisterNo,
      attachments: attachments,
      status: 'pending',
      currentApprover: null,
      remarks: remarks || '',
      resubmissionHistory: [
        ...(originalExpenditure.resubmissionHistory || []),
        {
          resubmittedAt: new Date(),
          resubmittedBy: user.id,
          resubmittedByName: user.name,
          originalExpenditureId: originalExpenditure._id,
          changes: {
            billNumber: billNumber !== originalExpenditure.billNumber,
            billDate: billDate !== originalExpenditure.billDate,
            billAmount: billAmount !== originalExpenditure.billAmount,
            partyName: partyName !== originalExpenditure.partyName,
            expenseDetails: expenseDetails !== originalExpenditure.expenseDetails,
            referenceBudgetRegisterNo: referenceBudgetRegisterNo !== originalExpenditure.referenceBudgetRegisterNo,
            attachments: req.uploadedFiles ? true : false
          },
          remarks: remarks || ''
        }
      ],
      approvalHistory: [
        ...originalExpenditure.approvalHistory,
        {
          approverId: user.id,
          approverName: user.name,
          approverRole: user.role,
          decision: 'resubmitted',
          remarks: remarks || 'Resubmitted with corrections',
          timestamp: new Date()
        }
      ],
      updatedAt: new Date()
    };
    
    mockExpenditures[expenditureIndex] = resubmittedExpenditure;
    
    // Send notification to office users
    await notifyExpenditureSubmitted(resubmittedExpenditure);
    
    res.json({
      success: true,
      message: 'Expenditure resubmitted successfully',
      data: { expenditure: resubmittedExpenditure }
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

module.exports = {
  getExpenditures,
  getExpenditureById,
  submitExpenditure,
  approveExpenditure,
  rejectExpenditure,
  resubmitExpenditure,
  getExpenditureStats
};
