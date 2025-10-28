const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { check } = require('express-validator');
const eventController = require('../controllers/eventController');

// All routes require authentication
router.use(authenticateToken);

// GET /api/events/current - Get current active event
router.get('/current', eventController.getCurrentEvent);

// GET /api/events/upcoming - Get upcoming event
router.get('/upcoming', eventController.getUpcomingEvent);

// GET /api/events/war/standings - Get clan war standings
router.get('/war/standings', eventController.getClanWarStandings);

// GET /api/events/power-hour - Get power hour status
router.get('/power-hour', eventController.getPowerHourStatus);

// POST /api/events/war/score - Update clan war score
router.post(
  '/war/score',
  [
    check('activityType', 'Activity type is required').notEmpty(),
    check('value', 'Value must be a positive number').optional().isInt({ min: 1 }),
  ],
  eventController.updateClanWarScore
);

// GET /api/events/stats - Get user's event participation statistics
router.get('/stats', eventController.getUserEventStats);

// GET /api/events/history - Get user's event participation history
router.get('/history', eventController.getUserEventHistory);

// GET /api/events/leaderboard - Get event participation leaderboard
router.get('/leaderboard', eventController.getEventLeaderboard);

// GET /api/events/tribe-war - Get user's tribe war status
router.get('/tribe-war', eventController.getTribeWarStatus);

module.exports = router;
