const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { upload } = require('../middleware/imageUpload');
const moderationController = require('../controllers/moderationController');

// All moderation routes require authentication
router.use(authenticateToken);

// Submit a report
router.post('/report', moderationController.submitReport);

// Get report reasons
router.get('/reasons', moderationController.getReportReasons);

// Block a user
router.post('/block', moderationController.blockUser);

// Unblock a user
router.delete('/block', moderationController.unblockUser);

// Get blocked users
router.get('/blocked-users', moderationController.getBlockedUsers);

// Get users who blocked this user
router.get('/blockers', moderationController.getBlockers);

// Get moderation history
router.get('/history', moderationController.getModerationHistory);

// Get user reports (as reporter)
router.get('/reports', moderationController.getUserReports);

// Get reports against user
router.get('/reports-against', moderationController.getReportsAgainst);

// Moderate image upload (internal)
router.post('/moderate-image', upload.single('image'), moderationController.moderateImage);

// Moderate text content
router.post('/moderate-text', moderationController.moderateText);

// Check if user is blocked
router.get('/check-block/:userId2', moderationController.checkBlock);

// Get moderation statistics
router.get('/stats', moderationController.getModerationStats);

// Get moderation service status
router.get('/status', moderationController.getModerationStatus);

module.exports = router;