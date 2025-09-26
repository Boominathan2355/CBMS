const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    
    const query = { recipient: req.user._id };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .populate('recipient', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ 
      recipient: req.user._id, 
      isRead: false 
    });

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
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
    const notification = await Notification.findOneAndUpdate(
      { 
        _id: req.params.id, 
        recipient: req.user._id 
      },
      { 
        isRead: true, 
        readAt: new Date() 
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: { notification }
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating notification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/mark-all-read
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { 
        recipient: req.user._id, 
        isRead: false 
      },
      { 
        isRead: true, 
        readAt: new Date() 
      }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`,
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating notifications',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
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
    const stats = await Notification.aggregate([
      { $match: { recipient: req.user._id } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          unreadCount: {
            $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] }
          }
        }
      }
    ]);

    const totalNotifications = await Notification.countDocuments({ 
      recipient: req.user._id 
    });
    const unreadNotifications = await Notification.countDocuments({ 
      recipient: req.user._id, 
      isRead: false 
    });

    res.json({
      success: true,
      data: {
        totalNotifications,
        unreadNotifications,
        byType: stats
      }
    });
  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching notification statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create notification (Admin only)
// @route   POST /api/notifications
// @access  Private/Admin
const createNotification = async (req, res) => {
  try {
    const {
      recipients,
      title,
      message,
      type,
      priority,
      actionRequired,
      actionUrl
    } = req.body;

    if (!recipients || !title || !message || !type) {
      return res.status(400).json({
        success: false,
        message: 'Recipients, title, message, and type are required'
      });
    }

    const notifications = [];
    
    for (const recipientId of recipients) {
      const notification = await Notification.create({
        recipient: recipientId,
        title,
        message,
        type,
        priority: priority || 'medium',
        actionRequired: actionRequired || false,
        actionUrl,
        metadata: { createdBy: req.user._id }
      });
      notifications.push(notification);
    }

    res.status(201).json({
      success: true,
      message: `${notifications.length} notifications created successfully`,
      data: { notifications }
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

// @desc    Send system announcement (Admin only)
// @route   POST /api/notifications/announcement
// @access  Private/Admin
const sendSystemAnnouncement = async (req, res) => {
  try {
    const { title, message, targetRoles } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required'
      });
    }

    // Get users by roles
    const query = { isActive: true };
    if (targetRoles && targetRoles.length > 0) {
      query.role = { $in: targetRoles };
    }

    const users = await User.find(query).select('_id');
    const userIds = users.map(user => user._id);

    if (userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No users found for the specified criteria'
      });
    }

    const notifications = [];
    
    for (const userId of userIds) {
      const notification = await Notification.create({
        recipient: userId,
        title,
        message,
        type: 'system_announcement',
        priority: 'high',
        actionRequired: false,
        metadata: { 
          createdBy: req.user._id,
          announcementType: 'system'
        }
      });
      notifications.push(notification);
    }

    res.status(201).json({
      success: true,
      message: `Announcement sent to ${notifications.length} users`,
      data: { 
        notificationsSent: notifications.length,
        targetUsers: userIds.length
      }
    });
  } catch (error) {
    console.error('Send system announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending announcement',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationStats,
  createNotification,
  sendSystemAnnouncement
};
