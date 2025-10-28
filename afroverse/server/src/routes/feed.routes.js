const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { check } = require('express-validator');
const feedController = require('../controllers/feedController');

// Public routes (no authentication required)
router.get('/public/:videoId', [
  check('videoId', 'Video ID is required').isMongoId(),
], feedController.getPublicVideo);

// Protected routes (authentication required)
router.use(authenticateToken);

// Feed routes
router.get('/:tab', [
  check('tab', 'Invalid feed tab').isIn(['foryou', 'following', 'tribe', 'battles']),
  check('cursor', 'Invalid cursor').optional().isString(),
  check('limit', 'Invalid limit').optional().isInt({ min: 1, max: 50 }),
  check('region', 'Invalid region').optional().isString(),
], feedController.getFeed);

// Video interaction routes
router.post('/video/:videoId/like', [
  check('videoId', 'Video ID is required').isMongoId(),
  check('on', 'Like status is required').isBoolean(),
], feedController.likeVideo);

router.post('/video/:videoId/share', [
  check('videoId', 'Video ID is required').isMongoId(),
  check('channel', 'Share channel is required').isIn(['wa', 'ig', 'tt', 'copy']),
], feedController.shareVideo);

router.post('/video/:videoId/view', [
  check('videoId', 'Video ID is required').isMongoId(),
  check('watchedMs', 'Watch time is required').isInt({ min: 0 }),
  check('completed', 'Completion status is required').isBoolean(),
  check('replayed', 'Replay count is required').isInt({ min: 0 }),
  check('sessionId', 'Session ID is required').isString(),
  check('tab', 'Feed tab is required').isIn(['foryou', 'following', 'tribe', 'battles']),
  check('position', 'Position is required').isInt({ min: 0 }),
], feedController.trackView);

router.post('/video/:videoId/report', [
  check('videoId', 'Video ID is required').isMongoId(),
  check('reason', 'Report reason is required').isString(),
], feedController.reportVideo);

router.post('/video/:videoId/follow', [
  check('videoId', 'Video ID is required').isMongoId(),
], feedController.followCreator);

router.post('/video/:videoId/challenge', [
  check('videoId', 'Video ID is required').isMongoId(),
  check('opponentId', 'Opponent ID is required').isMongoId(),
], feedController.startChallenge);

// Battle voting route
router.post('/battles/:battleId/vote', [
  check('battleId', 'Battle ID is required').isMongoId(),
  check('side', 'Vote side is required').isIn(['challenger', 'defender']),
], feedController.voteOnBattle);

// Analytics route
router.get('/analytics', [
  check('tab', 'Invalid tab').optional().isIn(['foryou', 'following', 'tribe', 'battles']),
  check('days', 'Invalid days').optional().isInt({ min: 1, max: 30 }),
], feedController.getFeedAnalytics);

// Video details route
router.get('/video/:videoId', [
  check('videoId', 'Video ID is required').isMongoId(),
], feedController.getVideo);

module.exports = router;