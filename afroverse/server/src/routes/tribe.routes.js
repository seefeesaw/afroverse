const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { check } = require('express-validator');
const tribeController = require('../controllers/tribeController');

// Public routes (no authentication required)
router.get('/', tribeController.getAllTribes);

// Protected routes (authentication required)
router.use(authenticateToken);

// Get tribe leaderboard
router.get('/leaderboard', tribeController.getLeaderboard);

// Get user's tribe (must come before /:tribeId)
router.get('/my-tribe', tribeController.getMyTribe);

// Join a tribe
router.post('/join', [
  check('tribeId', 'Tribe ID is required').isMongoId(),
], tribeController.joinTribe);

// Award points to tribe (internal use)
router.post('/points/award', [
  check('reason', 'Reason is required').isString().notEmpty(),
  check('points', 'Points must be a positive number').isInt({ min: 1 }),
], tribeController.awardPoints);

// Get specific tribe (must come last)
router.get('/:tribeId', [
  check('tribeId', 'Invalid tribe ID').isMongoId(),
], tribeController.getTribe);

module.exports = router;

