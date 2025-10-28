const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { check } = require('express-validator');
const challengeController = require('../controllers/challengeController');

// All routes require authentication
router.use(authenticateToken);

// GET /api/challenge/daily - Get today's daily challenge
router.get('/daily', challengeController.getDailyChallenge);

// GET /api/challenge/weekly - Get this week's weekly challenge
router.get('/weekly', challengeController.getWeeklyChallenge);

// POST /api/challenge/progress - Update challenge progress
router.post(
  '/progress',
  [
    check('activityType', 'Activity type is required').notEmpty(),
    check('value', 'Value must be a positive number').optional().isInt({ min: 1 }),
  ],
  challengeController.updateProgress
);

// POST /api/challenge/complete - Manually complete a challenge
router.post(
  '/complete',
  [
    check('userChallengeId', 'User challenge ID is required').isMongoId(),
    check('challengeType', 'Challenge type is required').isIn(['daily', 'weekly']),
  ],
  challengeController.completeChallenge
);

// GET /api/challenge/stats - Get user's challenge statistics
router.get('/stats', challengeController.getChallengeStats);

// GET /api/challenge/history - Get user's challenge completion history
router.get('/history', challengeController.getChallengeHistory);

// GET /api/challenge/leaderboard - Get challenge completion leaderboard
router.get('/leaderboard', challengeController.getChallengeLeaderboard);

// GET /api/challenge/tribe-weekly - Get tribe weekly challenge status
router.get('/tribe-weekly', challengeController.getTribeWeeklyChallenge);

module.exports = router;
