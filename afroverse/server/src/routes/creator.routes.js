const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { check } = require('express-validator');
const creatorController = require('../controllers/creatorController');

// Public routes (no authentication required)
router.get('/public/profile/:username', creatorController.getPublicSharePage);

// Protected routes (authentication required)
router.use(authenticateToken);

// Profile routes
router.get('/profile/:username', creatorController.getCreatorProfile);
router.get('/profile/:username/feed', [
  check('cursor', 'Invalid cursor').optional().isMongoId(),
  check('limit', 'Invalid limit').optional().isInt({ min: 1, max: 50 }),
], creatorController.getCreatorFeed);
router.get('/profile/:username/stats', creatorController.getCreatorStats);
router.get('/profile/:username/follow-status', creatorController.getFollowStatus);

router.put('/profile', [
  check('bio', 'Bio must be less than 160 characters').optional().isLength({ max: 160 }),
  check('bannerUrl', 'Invalid banner URL').optional().isURL(),
], creatorController.updateCreatorProfile);

// Follow routes
router.post('/follow/:userId', [
  check('userId', 'Invalid user ID').isMongoId(),
], creatorController.followCreator);

router.delete('/follow/:userId', [
  check('userId', 'Invalid user ID').isMongoId(),
], creatorController.unfollowCreator);

// Followers/Following routes
router.get('/followers/:userId', [
  check('userId', 'Invalid user ID').isMongoId(),
  check('cursor', 'Invalid cursor').optional().isMongoId(),
  check('limit', 'Invalid limit').optional().isInt({ min: 1, max: 50 }),
], creatorController.getFollowers);

router.get('/following/:userId', [
  check('userId', 'Invalid user ID').isMongoId(),
  check('cursor', 'Invalid cursor').optional().isMongoId(),
  check('limit', 'Invalid limit').optional().isInt({ min: 1, max: 50 }),
], creatorController.getFollowing);

// Discovery routes
router.get('/creators/top', [
  check('cursor', 'Invalid cursor').optional().isMongoId(),
  check('limit', 'Invalid limit').optional().isInt({ min: 1, max: 50 }),
  check('tribeId', 'Invalid tribe ID').optional().isMongoId(),
], creatorController.getTopCreators);

// Admin routes
router.post('/profile/promote-to-creator', [
  check('userId', 'User ID is required').isMongoId(),
], creatorController.promoteToCreator);

module.exports = router;
