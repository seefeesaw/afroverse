const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

// All notification routes require authentication
router.use(authenticateToken);

// Get user notifications
router.get('/', notificationController.getUserNotifications);

// Get unread count
router.get('/unread-count', notificationController.getUnreadCount);

// Mark notification as read
router.post('/:id/read', notificationController.markAsRead);

// Mark all notifications as read
router.post('/read-all', notificationController.markAllAsRead);

// Get notification settings
router.get('/settings', notificationController.getSettings);

// Update notification settings
router.put('/settings', notificationController.updateSettings);

// Register device token for push notifications
router.post('/device-token', notificationController.registerDeviceToken);

// Remove device token
router.delete('/device-token', notificationController.removeDeviceToken);

// Register WhatsApp phone number
router.post('/whatsapp-phone', notificationController.registerWhatsAppPhone);

// Remove WhatsApp phone number
router.delete('/whatsapp-phone', notificationController.removeWhatsAppPhone);

// Send test notification
router.post('/test', notificationController.sendTestNotification);

// Get notification statistics
router.get('/stats', notificationController.getStats);

module.exports = router;