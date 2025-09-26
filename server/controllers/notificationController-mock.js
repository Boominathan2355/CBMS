// Mock notifications database (in-memory)
const mockNotifications = [
  {
    _id: '1',
    recipient: '3', // office user
    sender: '2', // department user
    senderName: 'Test User',
    type: 'expenditure_submitted',
    title: 'New Expenditure Submitted',
    message: 'CS-001 - ₹15,000 expenditure submitted by Computer Science department',
    link: '/approvals',
    priority: 'high',
    read: false,
    metadata: {
      expenditureId: '1',
      departmentId: '1',
      departmentName: 'Computer Science',
      billAmount: 15000,
      billNumber: 'CS-001'
    },
    createdAt: new Date()
  },
  {
    _id: '2',
    recipient: '2', // department user
    sender: '3', // office user
    senderName: 'Office User',
    type: 'expenditure_approved',
    title: 'Expenditure Approved',
    message: 'Your expenditure CS-001 has been approved for ₹15,000',
    link: '/expenditures',
    priority: 'medium',
    read: false,
    metadata: {
      expenditureId: '1',
      approvedAmount: 15000,
      billNumber: 'CS-001'
    },
    createdAt: new Date(Date.now() - 3600000) // 1 hour ago
  },
  {
    _id: '3',
    recipient: '1', // admin user
    sender: 'system',
    senderName: 'System',
    type: 'system_announcement',
    title: 'System Maintenance',
    message: 'System maintenance scheduled for tomorrow from 2 AM to 4 AM',
    link: '/dashboard',
    priority: 'low',
    read: true,
    metadata: {
      maintenanceDate: '2024-09-02',
      maintenanceTime: '02:00 - 04:00'
    },
    createdAt: new Date(Date.now() - 86400000) // 1 day ago
  },
  {
    _id: '4',
    recipient: '4', // hod user
    sender: '2', // department user
    senderName: 'Test User',
    type: 'expenditure_submitted',
    title: 'Department Expenditure Submitted',
    message: 'ECE-001 - ₹25,000 expenditure submitted by Electronics department',
    link: '/department-expenditures',
    priority: 'high',
    read: false,
    metadata: {
      expenditureId: '2',
      departmentId: '2',
      departmentName: 'Electronics and Communication',
      billAmount: 25000,
      billNumber: 'ECE-001'
    },
    createdAt: new Date(Date.now() - 1800000) // 30 minutes ago
  },
  {
    _id: '5',
    recipient: '2', // department user
    sender: '3', // office user
    senderName: 'Office User',
    type: 'budget_warning',
    title: 'Budget Warning',
    message: 'Your Academic Expenses budget is 80% utilized. Remaining: ₹40,000',
    link: '/expenditures',
    priority: 'medium',
    read: false,
    metadata: {
      budgetHeadId: '1',
      budgetHeadName: 'Academic Expenses',
      utilizationPercentage: 80,
      remainingAmount: 40000
    },
    createdAt: new Date(Date.now() - 7200000) // 2 hours ago
  }
];

// @desc    Get notifications for a user
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10, page = 1, type, priority, unreadOnly } = req.query;
    
    // Filter notifications for the current user (including announcements)
    let userNotifications = mockNotifications.filter(notif => 
      notif.recipient === userId || notif.recipient === 'all'
    );
    
    // Filter by type
    if (type) {
      userNotifications = userNotifications.filter(notif => notif.type === type);
    }
    
    // Filter by priority
    if (priority) {
      userNotifications = userNotifications.filter(notif => notif.priority === priority);
    }
    
    // Filter by read status
    if (unreadOnly === 'true') {
      userNotifications = userNotifications.filter(notif => !notif.read);
    }
    
    // Sort by creation date (newest first)
    userNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedNotifications = userNotifications.slice(startIndex, endIndex);
    
    // Count unread notifications
    const unreadCount = userNotifications.filter(notif => !notif.read).length;
    
    res.json({
      success: true,
      data: {
        notifications: paginatedNotifications,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(userNotifications.length / limit),
          totalNotifications: userNotifications.length,
          hasNext: endIndex < userNotifications.length,
          hasPrev: page > 1
        },
        unreadCount
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching notifications',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    const notification = mockNotifications.find(notif => notif._id === id && notif.recipient === userId);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    notification.read = true;
    
    res.json({
      success: true,
      message: 'Notification marked as read',
      data: { notification }
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while marking notification as read',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/mark-all-read
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const userNotifications = mockNotifications.filter(notif => notif.recipient === userId);
    userNotifications.forEach(notif => {
      notif.read = true;
    });
    
    res.json({
      success: true,
      message: 'All notifications marked as read',
      data: { updatedCount: userNotifications.length }
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while marking all notifications as read',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    const notificationIndex = mockNotifications.findIndex(notif => notif._id === id && notif.recipient === userId);
    
    if (notificationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    const deletedNotification = mockNotifications.splice(notificationIndex, 1)[0];
    
    res.json({
      success: true,
      message: 'Notification deleted successfully',
      data: { notification: deletedNotification }
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting notification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get notification statistics
// @route   GET /api/notifications/stats
// @access  Private
const getNotificationStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const userNotifications = mockNotifications.filter(notif => notif.recipient === userId);
    const unreadCount = userNotifications.filter(notif => !notif.read).length;
    const totalCount = userNotifications.length;
    
    res.json({
      success: true,
      data: {
        totalNotifications: totalCount,
        unreadNotifications: unreadCount,
        readNotifications: totalCount - unreadCount
      }
    });
  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching notification stats',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create a new notification
// @route   POST /api/notifications
// @access  Private
const createNotification = async (req, res) => {
  try {
    const { recipient, type, message, link } = req.body;
    const sender = req.user.userId;
    
    const newNotification = {
      _id: (mockNotifications.length + 1).toString(),
      recipient,
      sender,
      type,
      message,
      link: link || null,
      read: false,
      createdAt: new Date()
    };
    
    mockNotifications.push(newNotification);
    
    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: { notification: newNotification }
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating notification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Send system announcement
// @route   POST /api/notifications/announcement
// @access  Private/Admin
const sendSystemAnnouncement = async (req, res) => {
  try {
    const { message, link } = req.body;
    
    // Create announcement for all users (in real app, you'd get all user IDs)
    const announcement = {
      _id: (mockNotifications.length + 1).toString(),
      recipient: 'all', // Special recipient for announcements
      sender: req.user.userId,
      type: 'announcement',
      message,
      link: link || null,
      read: false,
      createdAt: new Date()
    };
    
    mockNotifications.push(announcement);
    
    res.status(201).json({
      success: true,
      message: 'System announcement sent successfully',
      data: { notification: announcement }
    });
  } catch (error) {
    console.error('Send announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending announcement',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create notification for expenditure submission
// @route   POST /api/notifications/expenditure-submitted
// @access  Private (Internal use)
const notifyExpenditureSubmitted = async (expenditureData, approverType = 'office') => {
  try {
    let recipientId;
    let link;
    let title;
    
    if (approverType === 'hod') {
      // Send notification to HOD
      recipientId = expenditureData.hodId;
      link = '/department-expenditures';
      title = 'Department Expenditure Awaiting Approval';
    } else {
      // Send notification to Office
      recipientId = '3'; // Office user ID
      link = '/approvals';
      title = 'New Expenditure Submitted';
    }
    
    const notification = {
      _id: (mockNotifications.length + 1).toString(),
      recipient: recipientId,
      sender: expenditureData.submittedBy,
      senderName: expenditureData.submittedByName,
      type: 'expenditure_submitted',
      title: title,
      message: `${expenditureData.billNumber} - ₹${expenditureData.billAmount.toLocaleString()} expenditure submitted by ${expenditureData.departmentName}`,
      link: link,
      priority: 'high',
      read: false,
      metadata: {
        expenditureId: expenditureData._id,
        departmentId: expenditureData.departmentId,
        departmentName: expenditureData.departmentName,
        billAmount: expenditureData.billAmount,
        billNumber: expenditureData.billNumber,
        approverType: approverType
      },
      createdAt: new Date()
    };
    
    mockNotifications.push(notification);
    return notification;
  } catch (error) {
    console.error('Notify expenditure submitted error:', error);
    return null;
  }
};

// @desc    Create notification for expenditure approval
// @route   POST /api/notifications/expenditure-approved
// @access  Private (Internal use)
const notifyExpenditureApproved = async (expenditureData, approverData) => {
  try {
    const notification = {
      _id: (mockNotifications.length + 1).toString(),
      recipient: expenditureData.submittedBy,
      sender: approverData.id,
      senderName: approverData.name,
      type: 'expenditure_approved',
      title: 'Expenditure Approved',
      message: `Your expenditure ${expenditureData.billNumber} has been approved for ₹${expenditureData.billAmount.toLocaleString()}`,
      link: '/expenditures',
      priority: 'medium',
      read: false,
      metadata: {
        expenditureId: expenditureData._id,
        approvedAmount: expenditureData.billAmount,
        billNumber: expenditureData.billNumber,
        approverName: approverData.name
      },
      createdAt: new Date()
    };
    
    mockNotifications.push(notification);
    return notification;
  } catch (error) {
    console.error('Notify expenditure approved error:', error);
    return null;
  }
};

// @desc    Create notification for expenditure rejection
// @route   POST /api/notifications/expenditure-rejected
// @access  Private (Internal use)
const notifyExpenditureRejected = async (expenditureData, rejectorData, remarks) => {
  try {
    const notification = {
      _id: (mockNotifications.length + 1).toString(),
      recipient: expenditureData.submittedBy,
      sender: rejectorData.id,
      senderName: rejectorData.name,
      type: 'expenditure_rejected',
      title: 'Expenditure Rejected',
      message: `Your expenditure ${expenditureData.billNumber} has been rejected. Reason: ${remarks}`,
      link: '/expenditures',
      priority: 'high',
      read: false,
      metadata: {
        expenditureId: expenditureData._id,
        rejectedAmount: expenditureData.billAmount,
        billNumber: expenditureData.billNumber,
        rejectorName: rejectorData.name,
        remarks: remarks
      },
      createdAt: new Date()
    };
    
    mockNotifications.push(notification);
    return notification;
  } catch (error) {
    console.error('Notify expenditure rejected error:', error);
    return null;
  }
};

// @desc    Create notification for budget warning
// @route   POST /api/notifications/budget-warning
// @access  Private (Internal use)
const notifyBudgetWarning = async (userId, budgetData) => {
  try {
    const notification = {
      _id: (mockNotifications.length + 1).toString(),
      recipient: userId,
      sender: 'system',
      senderName: 'System',
      type: 'budget_warning',
      title: 'Budget Warning',
      message: `Your ${budgetData.budgetHeadName} budget is ${budgetData.utilizationPercentage}% utilized. Remaining: ₹${budgetData.remainingAmount.toLocaleString()}`,
      link: '/expenditures',
      priority: 'medium',
      read: false,
      metadata: {
        budgetHeadId: budgetData.budgetHeadId,
        budgetHeadName: budgetData.budgetHeadName,
        utilizationPercentage: budgetData.utilizationPercentage,
        remainingAmount: budgetData.remainingAmount
      },
      createdAt: new Date()
    };
    
    mockNotifications.push(notification);
    return notification;
  } catch (error) {
    console.error('Notify budget warning error:', error);
    return null;
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationStats,
  createNotification,
  sendSystemAnnouncement,
  notifyExpenditureSubmitted,
  notifyExpenditureApproved,
  notifyExpenditureRejected,
  notifyBudgetWarning,
  mockNotifications
};
