const express = require('express');
const router = express.Router();
const {
  startAuth,
  verifyAuth,
  refreshToken,
  getMe,
  logout
} = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { authStartLimiter, authVerifyLimiter } = require('../middleware/rateLimiter');
const { validateAuthStart, validateAuthVerify } = require('../middleware/validation');

// Public routes
router.post('/start', authStartLimiter, validateAuthStart, startAuth);
router.post('/verify', authVerifyLimiter, validateAuthVerify, verifyAuth);
router.post('/refresh', refreshToken);

// Protected routes
router.get('/me', authenticateToken, getMe);
router.post('/logout', authenticateToken, logout);

module.exports = router;
