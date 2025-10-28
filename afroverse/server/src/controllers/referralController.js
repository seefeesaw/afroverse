const referralService = require('../services/referralService');
const { validationResult } = require('express-validator');
const { logger } = require('../utils/logger');
const { addReferralJob } = require('../workers/referralWorker');

const referralController = {
  /**
   * GET /api/referral/my-code
   * Get user's referral code and statistics
   */
  async getMyReferralCode(req, res) {
    try {
      const userId = req.user.id;
      const result = await referralService.generateReferralCode(userId);
      
      res.json({
        success: true,
        code: result.code,
        link: result.link,
        stats: result.stats,
      });
    } catch (error) {
      logger.error('Error getting referral code:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get referral code',
        error: error.message,
      });
    }
  },

  /**
   * POST /api/referral/generate
   * Generate a new referral code for user (if they don't have one)
   */
  async generateReferralCode(req, res) {
    try {
      const userId = req.user.id;
      const result = await referralService.generateReferralCode(userId);
      
      res.json({
        success: true,
        code: result.code,
        link: result.link,
        message: 'Referral code generated successfully',
      });
    } catch (error) {
      logger.error('Error generating referral code:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate referral code',
        error: error.message,
      });
    }
  },

  /**
   * POST /api/referral/redeem
   * Redeem a referral code during signup
   */
  async redeemReferralCode(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    try {
      const { phone, referralCode } = req.body;
      const context = {
        ipAddress: req.ip,
        deviceFingerprint: req.headers['x-device-id'],
        userAgent: req.headers['user-agent'],
      };

      // This would typically be called during signup flow
      // For now, we'll assume the user ID is passed in the request
      const referredUserId = req.body.userId || req.user?.id;
      
      if (!referredUserId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required for referral redemption',
        });
      }

      const result = await referralService.redeemReferralCode(
        referralCode,
        referredUserId,
        context
      );

      if (result.success) {
        // Add job to queue for processing
        await addReferralJob(
          result.referralId,
          null, // Will be populated by the service
          referredUserId
        );

        res.json({
          success: true,
          message: 'Referral code redeemed successfully',
          referralId: result.referralId,
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error) {
      logger.error('Error redeeming referral code:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to redeem referral code',
        error: error.message,
      });
    }
  },

  /**
   * GET /api/referral/stats
   * Get user's referral statistics and progress
   */
  async getReferralStats(req, res) {
    try {
      const userId = req.user.id;
      const stats = await referralService.getReferralStats(userId);
      
      res.json({
        success: true,
        stats,
      });
    } catch (error) {
      logger.error('Error getting referral stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get referral statistics',
        error: error.message,
      });
    }
  },

  /**
   * GET /api/referral/leaderboard/recruiters
   * Get top recruiters leaderboard
   */
  async getTopRecruiters(req, res) {
    try {
      const { limit = 10 } = req.query;
      const recruiters = await referralService.getTopRecruiters(parseInt(limit));
      
      res.json({
        success: true,
        recruiters,
      });
    } catch (error) {
      logger.error('Error getting top recruiters:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get top recruiters',
        error: error.message,
      });
    }
  },

  /**
   * GET /api/referral/leaderboard/tribes
   * Get top recruiting tribes leaderboard
   */
  async getTopRecruitingTribes(req, res) {
    try {
      const { limit = 10 } = req.query;
      const tribes = await referralService.getTopRecruitingTribes(parseInt(limit));
      
      res.json({
        success: true,
        tribes,
      });
    } catch (error) {
      logger.error('Error getting top recruiting tribes:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get top recruiting tribes',
        error: error.message,
      });
    }
  },

  /**
   * POST /api/referral/share
   * Track referral link sharing
   */
  async trackReferralShare(req, res) {
    try {
      const { platform, referralCode } = req.body;
      const userId = req.user.id;

      // Track analytics
      logger.info(`User ${userId} shared referral code ${referralCode} on ${platform}`);

      // You could add analytics tracking here
      // analyticsService.track('referral_shared', {
      //   userId,
      //   platform,
      //   referralCode,
      //   timestamp: new Date(),
      // });

      res.json({
        success: true,
        message: 'Referral share tracked successfully',
      });
    } catch (error) {
      logger.error('Error tracking referral share:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to track referral share',
        error: error.message,
      });
    }
  },

  /**
   * GET /api/referral/rewards
   * Get available referral rewards and tiers
   */
  async getReferralRewards(req, res) {
    try {
      const rewards = {
        tiers: {
          1: {
            xp: 50,
            transformCredits: 1,
            coins: 25,
            message: 'You recruited a warrior! +1 Transformation, +50 XP, +25 Coins'
          },
          3: {
            xp: 150,
            coins: 75,
            premiumStyle: 'unlock_24h',
            message: 'Recruitment Master! Unlocked Premium Style for 24h'
          },
          5: {
            xp: 300,
            coins: 150,
            badge: 'rare_badge',
            message: 'Elite Recruiter! Earned Rare Badge + 300 XP'
          },
          10: {
            xp: 500,
            coins: 300,
            warriorPassWeek: true,
            message: 'Legendary Recruiter! Free Week of Warrior Pass!'
          },
          25: {
            xp: 1000,
            coins: 500,
            captainEligibility: true,
            message: 'Tribe Captain Eligible! You can now lead your clan!'
          }
        },
        tribeRewards: {
          50: {
            battleMultiplier: 2,
            duration: '24h',
            message: 'Your tribe earned 2× battle points for 24h!'
          },
          200: {
            clanTotem: true,
            message: 'Your tribe unlocked a Clan Totem!'
          }
        },
        ranks: {
          scout: { minReferrals: 0, maxReferrals: 9, title: 'Scout' },
          captain: { minReferrals: 10, maxReferrals: 24, title: 'Captain' },
          warlord: { minReferrals: 25, maxReferrals: Infinity, title: 'Warlord' },
        }
      };

      res.json({
        success: true,
        rewards,
      });
    } catch (error) {
      logger.error('Error getting referral rewards:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get referral rewards',
        error: error.message,
      });
    }
  },

  /**
   * POST /api/referral/claim-reward
   * Claim a specific referral reward
   */
  async claimReferralReward(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    try {
      const { rewardType } = req.body;
      const userId = req.user.id;

      // This would be implemented based on your reward claiming logic
      // For now, we'll just return success
      logger.info(`User ${userId} claimed reward: ${rewardType}`);

      res.json({
        success: true,
        message: `${rewardType} reward claimed successfully!`,
      });
    } catch (error) {
      logger.error('Error claiming referral reward:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to claim reward',
        error: error.message,
      });
    }
  },

  /**
   * GET /api/referral/invite-link/:code
   * Get invite link information (public endpoint)
   */
  async getInviteLinkInfo(req, res) {
    try {
      const { code } = req.params;
      
      // Find the referrer by code
      const User = require('../models/User');
      const referrer = await User.findOne({ 'referral.code': code })
        .select('username displayName tribe referral')
        .lean();

      if (!referrer) {
        return res.status(404).json({
          success: false,
          message: 'Invalid referral code',
        });
      }

      res.json({
        success: true,
        referrer: {
          username: referrer.username,
          displayName: referrer.displayName,
          tribe: referrer.tribe,
          recruitmentRank: referrer.referral?.recruitmentRank || 'scout',
        },
        message: `Join ${referrer.displayName || referrer.username} on Afroverse!`,
      });
    } catch (error) {
      logger.error('Error getting invite link info:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get invite link information',
        error: error.message,
      });
    }
  },
};

module.exports = referralController;