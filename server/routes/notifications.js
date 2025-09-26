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
} = require('../controllers/notificationController');
const { verifyToken, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(verifyToken);

// User notification routes
router.get('/', getNotifications);
router.get('/stats', getNotificationStats);
router.put('/mark-all-read', markAllAsRead);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

// Admin only routes
router.post('/', authorize('admin'), createNotification);
router.post('/announcement', authorize('admin'), sendSystemAnnouncement);

module.exports = router;
