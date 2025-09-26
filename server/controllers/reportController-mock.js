// Import mock data from other controllers
const { mockExpenditures } = require('./expenditureController-mock');
const { mockAllocations } = require('./allocationController-mock');
const { mockUsers } = require('./authController-mock');
const { mockDepartments } = require('./departmentController-mock');
const { mockBudgetHeads } = require('./budgetHeadController-mock');

// @desc    Generate expenditure report
// @route   GET /api/reports/expenditures
// @access  Private (Office, VP, Principal, Admin)
const generateExpenditureReport = async (req, res) => {
  try {
    const { 
      format = 'json',
      startDate,
      endDate,
      departmentId,
      budgetHeadId,
      status,
      submittedBy,
      financialYear = '2024-25'
    } = req.query;

    let filteredExpenditures = [...mockExpenditures];

    // Filter by date range
    if (startDate) {
      filteredExpenditures = filteredExpenditures.filter(exp => 
        new Date(exp.submittedAt) >= new Date(startDate)
      );
    }
    if (endDate) {
      filteredExpenditures = filteredExpenditures.filter(exp => 
        new Date(exp.submittedAt) <= new Date(endDate)
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

    // Calculate summary statistics
    const summary = {
      totalExpenditures: filteredExpenditures.length,
      totalAmount: filteredExpenditures.reduce((sum, exp) => sum + exp.billAmount, 0),
      approvedAmount: filteredExpenditures
        .filter(exp => exp.status === 'approved')
        .reduce((sum, exp) => sum + exp.billAmount, 0),
      pendingAmount: filteredExpenditures
        .filter(exp => exp.status === 'pending')
        .reduce((sum, exp) => sum + exp.billAmount, 0),
      rejectedAmount: filteredExpenditures
        .filter(exp => exp.status === 'rejected')
        .reduce((sum, exp) => sum + exp.billAmount, 0),
      averageAmount: filteredExpenditures.length > 0 
        ? filteredExpenditures.reduce((sum, exp) => sum + exp.billAmount, 0) / filteredExpenditures.length 
        : 0
    };

    // Group by department
    const departmentBreakdown = {};
    filteredExpenditures.forEach(exp => {
      if (!departmentBreakdown[exp.departmentId]) {
        departmentBreakdown[exp.departmentId] = {
          departmentName: exp.departmentName,
          count: 0,
          totalAmount: 0,
          approvedAmount: 0,
          pendingAmount: 0,
          rejectedAmount: 0
        };
      }
      departmentBreakdown[exp.departmentId].count++;
      departmentBreakdown[exp.departmentId].totalAmount += exp.billAmount;
      if (exp.status === 'approved') departmentBreakdown[exp.departmentId].approvedAmount += exp.billAmount;
      if (exp.status === 'pending') departmentBreakdown[exp.departmentId].pendingAmount += exp.billAmount;
      if (exp.status === 'rejected') departmentBreakdown[exp.departmentId].rejectedAmount += exp.billAmount;
    });

    // Group by budget head
    const budgetHeadBreakdown = {};
    filteredExpenditures.forEach(exp => {
      if (!budgetHeadBreakdown[exp.budgetHeadId]) {
        budgetHeadBreakdown[exp.budgetHeadId] = {
          budgetHeadName: exp.budgetHeadName,
          budgetHeadCode: exp.budgetHeadCode,
          count: 0,
          totalAmount: 0,
          approvedAmount: 0,
          pendingAmount: 0,
          rejectedAmount: 0
        };
      }
      budgetHeadBreakdown[exp.budgetHeadId].count++;
      budgetHeadBreakdown[exp.budgetHeadId].totalAmount += exp.billAmount;
      if (exp.status === 'approved') budgetHeadBreakdown[exp.budgetHeadId].approvedAmount += exp.billAmount;
      if (exp.status === 'pending') budgetHeadBreakdown[exp.budgetHeadId].pendingAmount += exp.billAmount;
      if (exp.status === 'rejected') budgetHeadBreakdown[exp.budgetHeadId].rejectedAmount += exp.billAmount;
    });

    const reportData = {
      summary,
      departmentBreakdown: Object.values(departmentBreakdown),
      budgetHeadBreakdown: Object.values(budgetHeadBreakdown),
      expenditures: filteredExpenditures,
      generatedAt: new Date(),
      filters: {
        startDate,
        endDate,
        departmentId,
        budgetHeadId,
        status,
        submittedBy,
        financialYear
      }
    };

    if (format === 'csv') {
      // Generate CSV
      const csvHeaders = [
        'Bill Number',
        'Department',
        'Budget Head',
        'Party Name',
        'Bill Amount',
        'Status',
        'Submitted By',
        'Submitted Date',
        'Approved Date',
        'Remarks'
      ];

      const csvRows = filteredExpenditures.map(exp => [
        exp.billNumber,
        exp.departmentName,
        exp.budgetHeadName,
        exp.partyName,
        exp.billAmount,
        exp.status,
        exp.submittedByName,
        new Date(exp.submittedAt).toISOString().split('T')[0],
        exp.approvalHistory && exp.approvalHistory.length > 0 
          ? new Date(exp.approvalHistory[exp.approvalHistory.length - 1].timestamp).toISOString().split('T')[0]
          : '',
        exp.remarks || ''
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=expenditure-report.csv');
      res.send(csvContent);
    } else {
      res.json({
        success: true,
        data: reportData
      });
    }
  } catch (error) {
    console.error('Generate expenditure report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating expenditure report',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Generate allocation report
// @route   GET /api/reports/allocations
// @access  Private (Office, VP, Principal, Admin)
const generateAllocationReport = async (req, res) => {
  try {
    const { 
      format = 'json',
      departmentId,
      budgetHeadId,
      financialYear = '2024-25'
    } = req.query;

    let filteredAllocations = [...mockAllocations];

    // Filter by department
    if (departmentId) {
      filteredAllocations = filteredAllocations.filter(alloc => alloc.departmentId === departmentId);
    }

    // Filter by budget head
    if (budgetHeadId) {
      filteredAllocations = filteredAllocations.filter(alloc => alloc.budgetHeadId === budgetHeadId);
    }

    // Filter by financial year
    if (financialYear) {
      filteredAllocations = filteredAllocations.filter(alloc => alloc.financialYear === financialYear);
    }

    // Calculate summary statistics
    const summary = {
      totalAllocations: filteredAllocations.length,
      totalAllocatedAmount: filteredAllocations.reduce((sum, alloc) => sum + alloc.allocatedAmount, 0),
      totalSpentAmount: filteredAllocations.reduce((sum, alloc) => sum + alloc.spentAmount, 0),
      totalRemainingAmount: filteredAllocations.reduce((sum, alloc) => sum + alloc.remainingAmount, 0),
      averageAllocation: filteredAllocations.length > 0 
        ? filteredAllocations.reduce((sum, alloc) => sum + alloc.allocatedAmount, 0) / filteredAllocations.length 
        : 0,
      utilizationPercentage: filteredAllocations.length > 0 
        ? Math.round((filteredAllocations.reduce((sum, alloc) => sum + alloc.spentAmount, 0) / 
                     filteredAllocations.reduce((sum, alloc) => sum + alloc.allocatedAmount, 0)) * 100)
        : 0
    };

    // Group by department
    const departmentBreakdown = {};
    filteredAllocations.forEach(alloc => {
      if (!departmentBreakdown[alloc.departmentId]) {
        departmentBreakdown[alloc.departmentId] = {
          departmentName: alloc.departmentName,
          count: 0,
          totalAllocated: 0,
          totalSpent: 0,
          totalRemaining: 0
        };
      }
      departmentBreakdown[alloc.departmentId].count++;
      departmentBreakdown[alloc.departmentId].totalAllocated += alloc.allocatedAmount;
      departmentBreakdown[alloc.departmentId].totalSpent += alloc.spentAmount;
      departmentBreakdown[alloc.departmentId].totalRemaining += alloc.remainingAmount;
    });

    // Group by budget head
    const budgetHeadBreakdown = {};
    filteredAllocations.forEach(alloc => {
      if (!budgetHeadBreakdown[alloc.budgetHeadId]) {
        budgetHeadBreakdown[alloc.budgetHeadId] = {
          budgetHeadName: alloc.budgetHeadName,
          budgetHeadCode: alloc.budgetHeadCode,
          count: 0,
          totalAllocated: 0,
          totalSpent: 0,
          totalRemaining: 0
        };
      }
      budgetHeadBreakdown[alloc.budgetHeadId].count++;
      budgetHeadBreakdown[alloc.budgetHeadId].totalAllocated += alloc.allocatedAmount;
      budgetHeadBreakdown[alloc.budgetHeadId].totalSpent += alloc.spentAmount;
      budgetHeadBreakdown[alloc.budgetHeadId].totalRemaining += alloc.remainingAmount;
    });

    const reportData = {
      summary,
      departmentBreakdown: Object.values(departmentBreakdown),
      budgetHeadBreakdown: Object.values(budgetHeadBreakdown),
      allocations: filteredAllocations,
      generatedAt: new Date(),
      filters: {
        departmentId,
        budgetHeadId,
        financialYear
      }
    };

    if (format === 'csv') {
      // Generate CSV
      const csvHeaders = [
        'Department',
        'Budget Head',
        'Allocated Amount',
        'Spent Amount',
        'Remaining Amount',
        'Utilization %',
        'Financial Year',
        'Created Date',
        'Status'
      ];

      const csvRows = filteredAllocations.map(alloc => [
        alloc.departmentName,
        alloc.budgetHeadName,
        alloc.allocatedAmount,
        alloc.spentAmount,
        alloc.remainingAmount,
        Math.round((alloc.spentAmount / alloc.allocatedAmount) * 100),
        alloc.financialYear,
        new Date(alloc.createdAt).toISOString().split('T')[0],
        alloc.isActive ? 'Active' : 'Inactive'
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=allocation-report.csv');
      res.send(csvContent);
    } else {
      res.json({
        success: true,
        data: reportData
      });
    }
  } catch (error) {
    console.error('Generate allocation report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating allocation report',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Generate audit report
// @route   GET /api/reports/audit
// @access  Private (Admin, Office, VP, Principal)
const generateAuditReport = async (req, res) => {
  try {
    const { 
      format = 'json',
      startDate,
      endDate,
      eventType,
      actorId,
      targetType
    } = req.query;

    // Import audit logs
    const { mockAuditLogs } = require('./auditLogController-mock');
    
    let filteredLogs = [...mockAuditLogs];

    // Filter by date range
    if (startDate) {
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.createdAt) >= new Date(startDate)
      );
    }
    if (endDate) {
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.createdAt) <= new Date(endDate)
      );
    }

    // Filter by event type
    if (eventType) {
      filteredLogs = filteredLogs.filter(log => log.eventType === eventType);
    }

    // Filter by actor
    if (actorId) {
      filteredLogs = filteredLogs.filter(log => log.actorId === actorId);
    }

    // Filter by target type
    if (targetType) {
      filteredLogs = filteredLogs.filter(log => log.targetType === targetType);
    }

    // Calculate summary statistics
    const summary = {
      totalLogs: filteredLogs.length,
      logsByEventType: {},
      logsByAction: {},
      logsByActorRole: {},
      logsByTargetType: {},
      dailyActivity: {}
    };

    // Group by various criteria
    filteredLogs.forEach(log => {
      summary.logsByEventType[log.eventType] = (summary.logsByEventType[log.eventType] || 0) + 1;
      summary.logsByAction[log.action] = (summary.logsByAction[log.action] || 0) + 1;
      summary.logsByActorRole[log.actorRole] = (summary.logsByActorRole[log.actorRole] || 0) + 1;
      summary.logsByTargetType[log.targetType] = (summary.logsByTargetType[log.targetType] || 0) + 1;
      
      const date = new Date(log.createdAt).toISOString().split('T')[0];
      summary.dailyActivity[date] = (summary.dailyActivity[date] || 0) + 1;
    });

    const reportData = {
      summary,
      auditLogs: filteredLogs,
      generatedAt: new Date(),
      filters: {
        startDate,
        endDate,
        eventType,
        actorId,
        targetType
      }
    };

    if (format === 'csv') {
      // Generate CSV
      const csvHeaders = [
        'Timestamp',
        'Event Type',
        'Actor Name',
        'Actor Role',
        'Action',
        'Target Type',
        'Target Name',
        'Details'
      ];

      const csvRows = filteredLogs.map(log => [
        new Date(log.createdAt).toISOString(),
        log.eventType,
        log.actorName,
        log.actorRole,
        log.action,
        log.targetType || '',
        log.targetName || '',
        JSON.stringify(log.details)
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=audit-report.csv');
      res.send(csvContent);
    } else {
      res.json({
        success: true,
        data: reportData
      });
    }
  } catch (error) {
    console.error('Generate audit report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating audit report',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Generate dashboard report
// @route   GET /api/reports/dashboard
// @access  Private
const generateDashboardReport = async (req, res) => {
  try {
    console.log('Dashboard report request received:', req.query);
    const { 
      financialYear = '2024-25',
      departmentId,
      includeComparison = false 
    } = req.query;

    console.log('Filtering allocations for financial year:', financialYear);
    // Filter allocations by financial year
    const allocations = mockAllocations.filter(allocation => 
      allocation.financialYear === financialYear
    );
    console.log('Found allocations:', allocations.length);

    console.log('Filtering expenditures for financial year:', financialYear);
    // Filter expenditures by financial year
    const expenditures = mockExpenditures.filter(expenditure => {
      const expDate = new Date(expenditure.billDate);
      const fyStart = new Date(`${financialYear.split('-')[0]}-04-01`);
      const fyEnd = new Date(`${financialYear.split('-')[1]}-03-31`);
      return expDate >= fyStart && expDate <= fyEnd;
    });
    console.log('Found expenditures:', expenditures.length);

    // Filter by department if specified
    let filteredAllocations = allocations;
    let filteredExpenditures = expenditures;
    
    if (departmentId) {
      filteredAllocations = allocations.filter(allocation => allocation.departmentId === departmentId);
      filteredExpenditures = expenditures.filter(expenditure => expenditure.departmentId === departmentId);
    }

    // Calculate consolidated statistics
    const consolidated = {
      financialYear,
      totalAllocated: filteredAllocations.reduce((sum, alloc) => sum + alloc.allocatedAmount, 0),
      totalSpent: filteredExpenditures.reduce((sum, exp) => sum + exp.billAmount, 0),
      totalPending: filteredExpenditures
        .filter(exp => exp.status === 'pending')
        .reduce((sum, exp) => sum + exp.billAmount, 0),
      totalApproved: filteredExpenditures
        .filter(exp => exp.status === 'approved')
        .reduce((sum, exp) => sum + exp.billAmount, 0),
      totalRejected: filteredExpenditures
        .filter(exp => exp.status === 'rejected')
        .reduce((sum, exp) => sum + exp.billAmount, 0),
      utilizationPercentage: 0,
      departmentBreakdown: {},
      budgetHeadBreakdown: {},
      monthlyTrend: {},
      statusBreakdown: {
        pending: 0,
        verified: 0,
        approved: 0,
        rejected: 0
      },
      yearComparison: null
    };

    // Calculate utilization percentage
    if (consolidated.totalAllocated > 0) {
      consolidated.utilizationPercentage = (consolidated.totalSpent / consolidated.totalAllocated) * 100;
    }

    // Department breakdown
    const departments = [...new Set(filteredAllocations.map(alloc => alloc.departmentId))];
    departments.forEach(deptId => {
      const deptAllocations = filteredAllocations.filter(alloc => alloc.departmentId === deptId);
      const deptExpenditures = filteredExpenditures.filter(exp => exp.departmentId === deptId);
      
      const dept = mockDepartments.find(d => d._id === deptId);
      consolidated.departmentBreakdown[deptId] = {
        departmentName: dept ? dept.name : 'Unknown',
        allocated: deptAllocations.reduce((sum, alloc) => sum + alloc.allocatedAmount, 0),
        spent: deptExpenditures.reduce((sum, exp) => sum + exp.billAmount, 0),
        utilization: 0
      };
      
      if (consolidated.departmentBreakdown[deptId].allocated > 0) {
        consolidated.departmentBreakdown[deptId].utilization = 
          (consolidated.departmentBreakdown[deptId].spent / consolidated.departmentBreakdown[deptId].allocated) * 100;
      }
    });

    // Budget head breakdown
    const budgetHeads = [...new Set(filteredAllocations.map(alloc => alloc.budgetHeadId))];
    budgetHeads.forEach(headId => {
      const headAllocations = filteredAllocations.filter(alloc => alloc.budgetHeadId === headId);
      const headExpenditures = filteredExpenditures.filter(exp => exp.budgetHeadId === headId);
      
      const head = mockBudgetHeads.find(h => h._id === headId);
      consolidated.budgetHeadBreakdown[headId] = {
        budgetHeadName: head ? head.name : 'Unknown',
        allocated: headAllocations.reduce((sum, alloc) => sum + alloc.allocatedAmount, 0),
        spent: headExpenditures.reduce((sum, exp) => sum + exp.billAmount, 0),
        utilization: 0
      };
      
      if (consolidated.budgetHeadBreakdown[headId].allocated > 0) {
        consolidated.budgetHeadBreakdown[headId].utilization = 
          (consolidated.budgetHeadBreakdown[headId].spent / consolidated.budgetHeadBreakdown[headId].allocated) * 100;
      }
    });

    // Monthly trend
    filteredExpenditures.forEach(exp => {
      const month = new Date(exp.billDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
      if (!consolidated.monthlyTrend[month]) {
        consolidated.monthlyTrend[month] = 0;
      }
      consolidated.monthlyTrend[month] += exp.billAmount;
    });

    // Status breakdown
    filteredExpenditures.forEach(exp => {
      consolidated.statusBreakdown[exp.status] = (consolidated.statusBreakdown[exp.status] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        consolidated,
        allocations: filteredAllocations,
        expenditures: filteredExpenditures
      }
    });
  } catch (error) {
    console.error('Generate dashboard report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating dashboard report',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  generateExpenditureReport,
  generateAllocationReport,
  generateDashboardReport,
  generateAuditReport
};
