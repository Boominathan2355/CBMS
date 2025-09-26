// Mock audit logs database (in-memory)
const mockAuditLogs = [
  {
    _id: '1',
    eventType: 'user_login',
    actorId: '2',
    actorName: 'Test User',
    actorRole: 'department',
    targetType: 'user',
    targetId: '2',
    targetName: 'Test User',
    action: 'login',
    details: {
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      timestamp: new Date('2024-09-01T10:00:00Z')
    },
    previousValues: null,
    newValues: {
      lastLogin: new Date('2024-09-01T10:00:00Z')
    },
    metadata: {
      department: 'Computer Science',
      sessionId: 'sess_123456789'
    },
    createdAt: new Date('2024-09-01T10:00:00Z')
  },
  {
    _id: '2',
    eventType: 'expenditure_submitted',
    actorId: '2',
    actorName: 'Test User',
    actorRole: 'department',
    targetType: 'expenditure',
    targetId: '1',
    targetName: 'CS-001',
    action: 'submit',
    details: {
      billNumber: 'CS-001',
      billAmount: 15000,
      budgetHead: 'Academic Expenses',
      department: 'Computer Science'
    },
    previousValues: null,
    newValues: {
      status: 'pending',
      submittedAt: new Date('2024-09-01T10:30:00Z')
    },
    metadata: {
      department: 'Computer Science',
      budgetHeadId: '1'
    },
    createdAt: new Date('2024-09-01T10:30:00Z')
  },
  {
    _id: '3',
    eventType: 'expenditure_approved',
    actorId: '3',
    actorName: 'Office User',
    actorRole: 'office',
    targetType: 'expenditure',
    targetId: '1',
    targetName: 'CS-001',
    action: 'approve',
    details: {
      billNumber: 'CS-001',
      billAmount: 15000,
      approvedAmount: 15000,
      remarks: 'Approved for academic expenses'
    },
    previousValues: {
      status: 'pending',
      spentAmount: 0
    },
    newValues: {
      status: 'approved',
      spentAmount: 15000,
      approvedAt: new Date('2024-09-01T11:00:00Z')
    },
    metadata: {
      department: 'Computer Science',
      budgetHeadId: '1',
      allocationId: '1'
    },
    createdAt: new Date('2024-09-01T11:00:00Z')
  },
  {
    _id: '4',
    eventType: 'budget_allocation_created',
    actorId: '3',
    actorName: 'Office User',
    actorRole: 'office',
    targetType: 'allocation',
    targetId: '1',
    targetName: 'CS Academic Expenses Allocation',
    action: 'create',
    details: {
      department: 'Computer Science',
      budgetHead: 'Academic Expenses',
      allocatedAmount: 200000,
      financialYear: '2024-25'
    },
    previousValues: null,
    newValues: {
      allocatedAmount: 200000,
      remainingAmount: 200000,
      status: 'active'
    },
    metadata: {
      department: 'Computer Science',
      budgetHeadId: '1',
      financialYear: '2024-25'
    },
    createdAt: new Date('2024-08-15T09:00:00Z')
  }
];

// @desc    Get all audit logs
// @route   GET /api/audit-logs
// @access  Private (Admin, Office, VP, Principal)
const getAuditLogs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      eventType, 
      actorId, 
      targetType, 
      targetId,
      startDate,
      endDate,
      action,
      search
    } = req.query;
    
    let filteredLogs = [...mockAuditLogs];
    
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
    
    // Filter by target ID
    if (targetId) {
      filteredLogs = filteredLogs.filter(log => log.targetId === targetId);
    }
    
    // Filter by action
    if (action) {
      filteredLogs = filteredLogs.filter(log => log.action === action);
    }
    
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
    
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredLogs = filteredLogs.filter(log => 
        log.actorName.toLowerCase().includes(searchLower) ||
        log.targetName.toLowerCase().includes(searchLower) ||
        log.eventType.toLowerCase().includes(searchLower) ||
        log.action.toLowerCase().includes(searchLower) ||
        (log.details && JSON.stringify(log.details).toLowerCase().includes(searchLower))
      );
    }
    
    // Sort by creation date (newest first)
    filteredLogs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: {
        auditLogs: paginatedLogs,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(filteredLogs.length / limit),
          totalLogs: filteredLogs.length,
          hasNext: endIndex < filteredLogs.length,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching audit logs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get audit log by ID
// @route   GET /api/audit-logs/:id
// @access  Private (Admin, Office, VP, Principal)
const getAuditLogById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const auditLog = mockAuditLogs.find(log => log._id === id);
    
    if (!auditLog) {
      return res.status(404).json({
        success: false,
        message: 'Audit log not found'
      });
    }
    
    res.json({
      success: true,
      data: auditLog
    });
  } catch (error) {
    console.error('Get audit log error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching audit log',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get audit log statistics
// @route   GET /api/audit-logs/stats
// @access  Private (Admin, Office, VP, Principal)
const getAuditLogStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
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
    
    // Calculate statistics
    const stats = {
      totalLogs: filteredLogs.length,
      logsByEventType: {},
      logsByAction: {},
      logsByActorRole: {},
      logsByTargetType: {},
      recentActivity: filteredLogs.slice(0, 10),
      dailyActivity: {}
    };
    
    // Group by event type
    filteredLogs.forEach(log => {
      stats.logsByEventType[log.eventType] = (stats.logsByEventType[log.eventType] || 0) + 1;
      stats.logsByAction[log.action] = (stats.logsByAction[log.action] || 0) + 1;
      stats.logsByActorRole[log.actorRole] = (stats.logsByActorRole[log.actorRole] || 0) + 1;
      stats.logsByTargetType[log.targetType] = (stats.logsByTargetType[log.targetType] || 0) + 1;
      
      // Daily activity
      const date = new Date(log.createdAt).toISOString().split('T')[0];
      stats.dailyActivity[date] = (stats.dailyActivity[date] || 0) + 1;
    });
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get audit log stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching audit log statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create audit log entry
// @route   POST /api/audit-logs
// @access  Private (Internal use)
const createAuditLog = async (req, res) => {
  try {
    const {
      eventType,
      actorId,
      actorName,
      actorRole,
      targetType,
      targetId,
      targetName,
      action,
      details,
      previousValues,
      newValues,
      metadata
    } = req.body;
    
    // Validate required fields
    if (!eventType || !actorId || !action) {
      return res.status(400).json({
        success: false,
        message: 'Event type, actor ID, and action are required'
      });
    }
    
    const newAuditLog = {
      _id: (mockAuditLogs.length + 1).toString(),
      eventType,
      actorId,
      actorName: actorName || 'System',
      actorRole: actorRole || 'system',
      targetType: targetType || null,
      targetId: targetId || null,
      targetName: targetName || null,
      action,
      details: details || {},
      previousValues: previousValues || null,
      newValues: newValues || null,
      metadata: metadata || {},
      createdAt: new Date()
    };
    
    mockAuditLogs.push(newAuditLog);
    
    res.status(201).json({
      success: true,
      message: 'Audit log created successfully',
      data: newAuditLog
    });
  } catch (error) {
    console.error('Create audit log error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating audit log',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Export audit logs
// @route   GET /api/audit-logs/export
// @access  Private (Admin, Office, VP, Principal)
const exportAuditLogs = async (req, res) => {
  try {
    const { format = 'csv', startDate, endDate } = req.query;
    
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
      res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.csv');
      res.send(csvContent);
    } else {
      res.json({
        success: true,
        data: filteredLogs
      });
    }
  } catch (error) {
    console.error('Export audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while exporting audit logs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAuditLogs,
  getAuditLogById,
  getAuditLogStats,
  createAuditLog,
  exportAuditLogs,
  mockAuditLogs
};
