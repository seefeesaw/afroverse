const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { check } = require('express-validator');
const boostController = require('../controllers/boostController');

// All routes require authentication
router.use(authenticateToken);

// Boost video
router.post('/video', [
  check('videoId', 'Video ID is required').isMongoId(),
  check('tier', 'Boost tier is required').isIn(['bronze', 'silver', 'gold']),
], boostController.boostVideo);

// Boost tribe
router.post('/tribe', [
  check('tribeId', 'Tribe ID is required').isMongoId(),
  check('tier', 'Boost tier is required').isIn(['rally', 'warDrums', 'fullWar']),
], boostController.boostTribe);

// Get video boost info
router.get('/video/:videoId', [
  check('videoId', 'Video ID is required').isMongoId(),
], boostController.getVideoBoost);

// Get tribe boost info
router.get('/tribe/:tribeId', [
  check('tribeId', 'Tribe ID is required').isMongoId(),
], boostController.getTribeBoost);

// Get boost tiers
router.get('/tiers', boostController.getBoostTiers);

module.exports = router;
