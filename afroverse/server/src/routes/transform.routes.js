const express = require('express');
const router = express.Router();
const {
  createTransformation,
  getTransformationStatus,
  getTransformationHistory,
  getPublicTransformation,
  getAvailableStyles
} = require('../controllers/transformController');
const { authenticateToken } = require('../middleware/auth');
const { uploadImageMiddleware, cleanupTempFiles } = require('../middleware/imageUpload');
const { generalLimiter } = require('../middleware/rateLimiter');

// Public routes
router.get('/public/:shareCode', getPublicTransformation);

// Protected routes
router.get('/styles', authenticateToken, getAvailableStyles);
router.post('/create', 
  authenticateToken, 
  generalLimiter,
  uploadImageMiddleware, 
  cleanupTempFiles,
  createTransformation
);
router.get('/status/:jobId', authenticateToken, getTransformationStatus);
router.get('/history', authenticateToken, getTransformationHistory);

module.exports = router;
