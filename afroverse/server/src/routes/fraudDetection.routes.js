const express = require('express');
const { body, param, query } = require('express-validator');
const { validateRequest } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');
const { generalLimiter } = require('../middleware/rateLimiter');
const {
  getFraudDetectionsByUser,
  getPendingFraudDetections,
  getFraudDetectionStatistics,
  getFraudDetectionTrends,
  getFraudDetectionPerformance,
  getTrustScoreByUser,
  updateTrustScore,
  shadowbanUser,
  liftShadowban,
  temporaryBanUser,
  permanentBanUser,
  getLowTrustUsers,
  getShadowbannedUsers,
  getTrustScoreStatistics,
  getTrustScoreSummary,
  getModerationLogsByUser,
  getPendingModerationLogs,
  getModerationStatistics,
  getDeviceFingerprintsByUser,
  getSuspiciousDevices,
  getMultiAccountDevices,
  getDeviceFingerprintStatistics,
  getFraudDetectionOptions,
  testFraudDetection
} = require('../controllers/fraudDetectionController');

const router = express.Router();

// Validation rules
const updateTrustScoreValidation = [
  body('userId').isMongoId().withMessage('Valid user ID is required'),
  body('points').isNumeric().withMessage('Points must be a number'),
  body('reason').notEmpty().withMessage('Reason is required'),
  body('action').notEmpty().withMessage('Action is required')
];

const shadowbanUserValidation = [
  body('userId').isMongoId().withMessage('Valid user ID is required'),
  body('reason').notEmpty().withMessage('Reason is required')
];

const temporaryBanUserValidation = [
  body('userId').isMongoId().withMessage('Valid user ID is required'),
  body('duration').isNumeric().withMessage('Duration must be a number'),
  body('reason').notEmpty().withMessage('Reason is required')
];

const permanentBanUserValidation = [
  body('userId').isMongoId().withMessage('Valid user ID is required'),
  body('reason').notEmpty().withMessage('Reason is required')
];

const testFraudDetectionValidation = [
  body('type').notEmpty().withMessage('Type is required'),
  body('userId').isMongoId().withMessage('Valid user ID is required'),
  body('data').isObject().withMessage('Data must be an object')
];

// Protected routes (authentication required)
router.get('/fraud-detections',
  authenticateToken,
  generalLimiter,
  getFraudDetectionsByUser
);

router.get('/pending-fraud-detections',
  authenticateToken,
  generalLimiter,
  getPendingFraudDetections
);

router.get('/fraud-detection-statistics',
  authenticateToken,
  generalLimiter,
  getFraudDetectionStatistics
);

router.get('/fraud-detection-trends',
  authenticateToken,
  generalLimiter,
  getFraudDetectionTrends
);

router.get('/fraud-detection-performance',
  authenticateToken,
  generalLimiter,
  getFraudDetectionPerformance
);

router.get('/trust-score',
  authenticateToken,
  generalLimiter,
  getTrustScoreByUser
);

router.post('/trust-score/update',
  authenticateToken,
  generalLimiter,
  updateTrustScoreValidation,
  validateRequest,
  updateTrustScore
);

router.post('/trust-score/shadowban',
  authenticateToken,
  generalLimiter,
  shadowbanUserValidation,
  validateRequest,
  shadowbanUser
);

router.post('/trust-score/lift-shadowban',
  authenticateToken,
  generalLimiter,
  shadowbanUserValidation,
  validateRequest,
  liftShadowban
);

router.post('/trust-score/temporary-ban',
  authenticateToken,
  generalLimiter,
  temporaryBanUserValidation,
  validateRequest,
  temporaryBanUser
);

router.post('/trust-score/permanent-ban',
  authenticateToken,
  generalLimiter,
  permanentBanUserValidation,
  validateRequest,
  permanentBanUser
);

router.get('/low-trust-users',
  authenticateToken,
  generalLimiter,
  getLowTrustUsers
);

router.get('/shadowbanned-users',
  authenticateToken,
  generalLimiter,
  getShadowbannedUsers
);

router.get('/trust-score-statistics',
  authenticateToken,
  generalLimiter,
  getTrustScoreStatistics
);

router.get('/trust-score-summary',
  authenticateToken,
  generalLimiter,
  getTrustScoreSummary
);

router.get('/moderation-logs',
  authenticateToken,
  generalLimiter,
  getModerationLogsByUser
);

router.get('/pending-moderation-logs',
  authenticateToken,
  generalLimiter,
  getPendingModerationLogs
);

router.get('/moderation-statistics',
  authenticateToken,
  generalLimiter,
  getModerationStatistics
);

router.get('/device-fingerprints',
  authenticateToken,
  generalLimiter,
  getDeviceFingerprintsByUser
);

router.get('/suspicious-devices',
  authenticateToken,
  generalLimiter,
  getSuspiciousDevices
);

router.get('/multi-account-devices',
  authenticateToken,
  generalLimiter,
  getMultiAccountDevices
);

router.get('/device-fingerprint-statistics',
  authenticateToken,
  generalLimiter,
  getDeviceFingerprintStatistics
);

router.get('/options',
  authenticateToken,
  generalLimiter,
  getFraudDetectionOptions
);

router.post('/test',
  authenticateToken,
  generalLimiter,
  testFraudDetectionValidation,
  validateRequest,
  testFraudDetection
);

// Admin routes (moderator authentication required)
router.get('/admin/fraud-detections',
  authenticateToken, // Add admin middleware later
  generalLimiter,
  getPendingFraudDetections
);

router.get('/admin/trust-scores',
  authenticateToken, // Add admin middleware later
  generalLimiter,
  getLowTrustUsers
);

router.get('/admin/moderation-logs',
  authenticateToken, // Add admin middleware later
  generalLimiter,
  getPendingModerationLogs
);

router.get('/admin/device-fingerprints',
  authenticateToken, // Add admin middleware later
  generalLimiter,
  getSuspiciousDevices
);

router.post('/admin/trust-score/update',
  authenticateToken, // Add admin middleware later
  generalLimiter,
  updateTrustScoreValidation,
  validateRequest,
  updateTrustScore
);

router.post('/admin/trust-score/shadowban',
  authenticateToken, // Add admin middleware later
  generalLimiter,
  shadowbanUserValidation,
  validateRequest,
  shadowbanUser
);

router.post('/admin/trust-score/lift-shadowban',
  authenticateToken, // Add admin middleware later
  generalLimiter,
  shadowbanUserValidation,
  validateRequest,
  liftShadowban
);

router.post('/admin/trust-score/temporary-ban',
  authenticateToken, // Add admin middleware later
  generalLimiter,
  temporaryBanUserValidation,
  validateRequest,
  temporaryBanUser
);

router.post('/admin/trust-score/permanent-ban',
  authenticateToken, // Add admin middleware later
  generalLimiter,
  permanentBanUserValidation,
  validateRequest,
  permanentBanUser
);

module.exports = router;
