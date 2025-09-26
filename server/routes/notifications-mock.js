const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationStats,
  createNotification,
  sendSystemAnnouncement
} = require('../controllers/notificationController-mock');
const { verifyToken, authorize } = require('../middleware/auth-mock');

// All routes require authentication
router.use(verifyToken);

// Get notifications for current user
router.get('/', getNotifications);

// Get notification statistics
router.get('/stats', getNotificationStats);

// Mark notification as read
router.put('/:id/read', markAsRead);

// Mark all notifications as read
router.put('/mark-all-read', markAllAsRead);

// Delete notification
router.delete('/:id', deleteNotification);

// Create notification
router.post('/', createNotification);

// Send system announcement (Admin only)
router.post('/announcement', authorize('admin'), sendSystemAnnouncement);

module.exports = router;
