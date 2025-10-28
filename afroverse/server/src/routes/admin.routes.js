const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuth = require('../middleware/adminAuth');
const adminRBAC = require('../middleware/adminRBAC');

// Authentication routes (public)
router.post('/auth/login', adminController.login);
router.post('/auth/magic-link', adminController.loginWithMagicLink);
router.post('/auth/verify-2fa', adminAuth.requireAuth, adminController.verifyTwoFA);
router.post('/auth/refresh', adminController.refreshToken);
router.post('/auth/logout', adminAuth.requireAuth, adminController.logout);

// Profile routes (authenticated)
router.get('/profile', adminAuth.requireAuth, adminController.getProfile);
router.put('/profile', adminAuth.requireAuth, adminController.updateProfile);

// Dashboard route (authenticated)
router.get('/dashboard', adminAuth.requireAuth, adminController.getDashboard);

// Moderation routes (moderator+)
router.get('/moderation/queue', 
  adminAuth.requireAuth, 
  adminRBAC.requireRole(['moderator', 'tands', 'operator', 'admin']),
  adminController.getModerationQueue
);

router.get('/moderation/jobs/:jobId', 
  adminAuth.requireAuth, 
  adminRBAC.requireRole(['moderator', 'tands', 'operator', 'admin']),
  adminController.getModerationJob
);

router.post('/moderation/jobs/:jobId/assign', 
  adminAuth.requireAuth, 
  adminRBAC.requireRole(['moderator', 'tands', 'operator', 'admin']),
  adminController.assignModerationJob
);

router.post('/moderation/jobs/:jobId/decision', 
  adminAuth.requireAuth, 
  adminRBAC.requireRole(['moderator', 'tands', 'operator', 'admin']),
  adminController.makeModerationDecision
);

router.post('/moderation/jobs/:jobId/escalate', 
  adminAuth.requireAuth, 
  adminRBAC.requireRole(['moderator', 'tands', 'operator', 'admin']),
  adminController.escalateModerationJob
);

router.post('/moderation/jobs/:jobId/appeal/resolve', 
  adminAuth.requireAuth, 
  adminRBAC.requireRole(['tands', 'operator', 'admin']),
  adminController.resolveAppeal
);

// Fraud detection routes (tands+)
router.get('/fraud/detections', 
  adminAuth.requireAuth, 
  adminRBAC.requireRole(['tands', 'operator', 'admin']),
  adminController.getFraudDetections
);

router.get('/fraud/detections/:fraudDetectionId', 
  adminAuth.requireAuth, 
  adminRBAC.requireRole(['tands', 'operator', 'admin']),
  adminController.getFraudDetection
);

router.post('/fraud/detections/:fraudDetectionId/review', 
  adminAuth.requireAuth, 
  adminRBAC.requireRole(['tands', 'operator', 'admin']),
  adminController.reviewFraudDetection
);

router.post('/fraud/users/:userId/shadowban', 
  adminAuth.requireAuth, 
  adminRBAC.requireRole(['tands', 'operator', 'admin']),
  adminController.shadowbanUser
);

router.post('/fraud/users/:userId/lift-shadowban', 
  adminAuth.requireAuth, 
  adminRBAC.requireRole(['tands', 'operator', 'admin']),
  adminController.liftShadowban
);

// User management routes (operator+)
router.get('/users', 
  adminAuth.requireAuth, 
  adminRBAC.requireRole(['operator', 'admin']),
  adminController.getUsers
);

router.get('/users/:userId', 
  adminAuth.requireAuth, 
  adminRBAC.requireRole(['operator', 'admin']),
  adminController.getUser
);

router.get('/users/:userId/details', 
  adminAuth.requireAuth, 
  adminRBAC.requireRole(['operator', 'admin']),
  adminController.getUserDetails
);

router.post('/users/:userId/enforcement', 
  adminAuth.requireAuth, 
  adminRBAC.requireRole(['operator', 'admin']),
  adminController.applyEnforcement
);

router.post('/users/:userId/ban', 
  adminAuth.requireAuth, 
  adminRBAC.requireRole(['operator', 'admin']),
  adminController.banUser
);

router.post('/users/:userId/unban', 
  adminAuth.requireAuth, 
  adminRBAC.requireRole(['operator', 'admin']),
  adminController.unbanUser
);

// Tribe management routes (operator+)
router.get('/tribes', 
  adminAuth.requireAuth, 
  adminRBAC.requireRole(['operator', 'admin']),
  adminController.getTribes
);

router.get('/tribes/:tribeId', 
  adminAuth.requireAuth, 
  adminRBAC.requireRole(['operator', 'admin']),
  adminController.getTribe
);

router.put('/tribes/:tribeId', 
  adminAuth.requireAuth, 
  adminRBAC.requireRole(['operator', 'admin']),
  adminController.updateTribe
);

router.post('/tribes/:tribeId/captain', 
  adminAuth.requireAuth, 
  adminRBAC.requireRole(['operator', 'admin']),
  adminController.changeTribeCaptain
);

// Audit log routes (admin only)
router.get('/audit/logs', 
  adminAuth.requireAuth, 
  adminRBAC.requireRole(['admin']),
  adminController.getAuditLogs
);

router.get('/audit/logs/:auditLogId', 
  adminAuth.requireAuth, 
  adminRBAC.requireRole(['admin']),
  adminController.getAuditLog
);

router.post('/audit/logs/:auditLogId/reverse', 
  adminAuth.requireAuth, 
  adminRBAC.requireRole(['admin']),
  adminController.reverseAuditLog
);

module.exports = router;
