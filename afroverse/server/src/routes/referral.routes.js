const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { check } = require('express-validator');
const referralController = require('../controllers/referralController');

// Validation middleware
const redeemReferralValidation = [
  check('referralCode', 'Referral code is required').notEmpty().isLength({ min: 6, max: 12 }),
  check('phone', 'Phone number is required').notEmpty().isMobilePhone(),
  check('userId', 'User ID is required').optional().isMongoId(),
];

const shareReferralValidation = [
  check('platform', 'Platform is required').isIn(['whatsapp', 'instagram', 'tiktok', 'sms', 'copy', 'facebook', 'twitter']),
  check('referralCode', 'Referral code is required').notEmpty(),
];

const claimRewardValidation = [
  check('rewardType', 'Reward type is required').isIn([
    'extra_daily_transform',
    'premium_video_unlock',
    'coins',
    'streak_shield',
    'tribe_power_buff',
    'rare_badge',
    'warrior_pass_week'
  ]),
];

// Public routes (no authentication required)
router.get('/invite-link/:code', referralController.getInviteLinkInfo);

// All other routes require authentication
router.use(authenticateToken);

// Referral code management
router.get('/my-code', referralController.getMyReferralCode);
router.post('/generate', referralController.generateReferralCode);

// Referral redemption (can be called during signup)
router.post('/redeem', redeemReferralValidation, referralController.redeemReferralCode);

// Statistics and leaderboards
router.get('/stats', referralController.getReferralStats);
router.get('/leaderboard/recruiters', referralController.getTopRecruiters);
router.get('/leaderboard/tribes', referralController.getTopRecruitingTribes);

// Rewards system
router.get('/rewards', referralController.getReferralRewards);
router.post('/claim-reward', claimRewardValidation, referralController.claimReferralReward);

// Analytics and tracking
router.post('/share', shareReferralValidation, referralController.trackReferralShare);

module.exports = router;