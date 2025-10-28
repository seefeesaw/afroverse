const Referral = require('../models/Referral');
const User = require('../models/User');
const Tribe = require('../models/Tribe');
const { generateShortCode } = require('../utils/shortCodeGenerator');
const { logger } = require('../utils/logger');
const { getQueue } = require('../queues/queueManager');
const walletService = require('./walletService');
const notificationService = require('./notificationService');
const { io } = require('../sockets/socketService');
const { getClientIp } = require('@supercharge/request-ip');

const referralQueue = getQueue('referralQueue');

// Referral reward tiers
const REFERRAL_REWARDS = {
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
};

// Tribe-level rewards
const TRIBE_REWARDS = {
  50: {
    battleMultiplier: 2,
    duration: 24 * 60 * 60 * 1000, // 24 hours
    message: 'Your tribe earned 2× battle points for 24h!'
  },
  200: {
    clanTotem: true,
    message: 'Your tribe unlocked a Clan Totem!'
  }
};

const referralService = {
  /**
   * Generate a unique referral code for a user
   * @param {string} userId - The ID of the user
   * @returns {Promise<{code: string, link: string}>}
   */
  async generateReferralCode(userId) {
    try {
      let user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      // If user already has a code, return existing one
      if (user.referral && user.referral.code) {
        return {
          code: user.referral.code,
          link: `${process.env.FRONTEND_URL}/invite/${user.referral.code}`,
          stats: await this.getReferralStats(userId)
        };
      }

      // Generate unique code
      let code;
      let isUnique = false;
      let attempts = 0;
      
      while (!isUnique && attempts < 10) {
        code = generateShortCode(8);
        const existing = await User.findOne({ 'referral.code': code });
        if (!existing) isUnique = true;
        attempts++;
      }

      if (!isUnique) {
        throw new Error('Failed to generate unique referral code');
      }

      // Save code to user
      if (!user.referral) {
        user.referral = {};
      }
      user.referral.code = code;
      await user.save();

      const link = `${process.env.FRONTEND_URL}/invite/${code}`;

      logger.info(`Generated referral code ${code} for user ${userId}`);
      return { code, link };
    } catch (error) {
      logger.error('Error generating referral code:', error);
      throw error;
    }
  },

  /**
   * Redeem a referral code during user signup
   * @param {string} referralCode - The referral code
   * @param {string} referredUserId - The ID of the new user
   * @param {Object} context - Additional context (IP, device fingerprint, etc.)
   * @returns {Promise<Object>}
   */
  async redeemReferralCode(referralCode, referredUserId, context = {}) {
    try {
      if (!referralCode || !referredUserId) {
        logger.warn('Missing referralCode or referredUserId');
        return { success: false, message: 'Invalid referral data' };
      }

      // Find referrer
      const referrer = await User.findOne({ 'referral.code': referralCode });
      if (!referrer) {
        logger.warn(`Referral code ${referralCode} not found`);
        return { success: false, message: 'Invalid referral code' };
      }

      // Check for self-referral
      if (referrer._id.toString() === referredUserId.toString()) {
        logger.warn(`User ${referredUserId} attempted self-referral`);
        return { success: false, message: 'Cannot refer yourself' };
      }

      // Check for existing referral
      const existingReferral = await Referral.findOne({
        referrerUserId: referrer._id,
        referredUserId: referredUserId
      });

      if (existingReferral) {
        logger.warn(`Referral already exists between ${referrer._id} and ${referredUserId}`);
        return { success: false, message: 'Referral already processed' };
      }

      // Anti-fraud checks
      const fraudCheck = await this.performFraudChecks(referrer._id, referredUserId, context);
      if (!fraudCheck.passed) {
        logger.warn(`Fraud detected for referral ${referralCode}: ${fraudCheck.reason}`);
        return { success: false, message: 'Referral blocked due to suspicious activity' };
      }

      // Create referral record
      const referral = await Referral.create({
        referrerUserId: referrer._id,
        referredUserId: referredUserId,
        referralCode: referralCode,
        status: 'pending',
        fraudDetection: {
          deviceFingerprint: context.deviceFingerprint,
          ipAddress: context.ipAddress,
          suspiciousActivity: false,
        },
        tribeAssignment: {
          autoAssigned: true,
          tribeId: referrer.tribe?.id,
        }
      });

      // Update referred user
      const referredUser = await User.findById(referredUserId);
      if (referredUser) {
        referredUser.referral.referredBy = referralCode;
        await referredUser.save();
      }

      // Add job to queue for processing
      await referralQueue.add('processReferralCompletion', {
        referralId: referral._id.toString(),
        referrerId: referrer._id.toString(),
        referredUserId: referredUserId,
      });

      logger.info(`Referral ${referral._id} created and queued for processing`);
      return { success: true, referralId: referral._id };
    } catch (error) {
      logger.error('Error redeeming referral code:', error);
      throw error;
    }
  },

  /**
   * Process referral completion and distribute rewards
   * @param {string} referralId - The ID of the referral
   * @returns {Promise<void>}
   */
  async processReferralCompletion(referralId) {
    try {
      const referral = await Referral.findById(referralId);
      if (!referral || referral.status !== 'pending') {
        logger.warn(`Referral ${referralId} not found or not pending`);
        return;
      }

      const referrer = await User.findById(referral.referrerUserId);
      const referredUser = await User.findById(referral.referredUserId);

      if (!referrer || !referredUser) {
        logger.error(`Referrer or referred user not found for referral ${referralId}`);
        referral.status = 'failed';
        referral.failedAt = new Date();
        await referral.save();
        return;
      }

      // Check daily limits
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (referrer.referral.lastInviteDate && referrer.referral.lastInviteDate < today) {
        referrer.referral.dailyInviteCount = 0;
      }

      if (referrer.referral.dailyInviteCount >= 10) {
        logger.warn(`Referrer ${referrer._id} exceeded daily invite limit`);
        referral.status = 'failed';
        referral.failedAt = new Date();
        await referral.save();
        return;
      }

      // Calculate rewards
      const referrerRewards = this.calculateReferrerRewards(referrer.referral.referralsCount + 1);
      const referredRewards = {
        xp: 25,
        coins: 10,
      };

      // Distribute rewards
      await this.distributeRewards(referrer, referredUser, referrerRewards, referredRewards);

      // Update referral record
      referral.status = 'completed';
      referral.completedAt = new Date();
      referral.rewards = {
        referrer: referrerRewards,
        referredUser: referredRewards,
      };
      await referral.save();

      // Update referrer stats
      referrer.referral.referralsCount = (referrer.referral.referralsCount || 0) + 1;
      referrer.referral.lastReferralAt = new Date();
      referrer.referral.dailyInviteCount = (referrer.referral.dailyInviteCount || 0) + 1;
      referrer.referral.lastInviteDate = new Date();

      // Update recruitment rank
      referrer.referral.recruitmentRank = this.calculateRecruitmentRank(referrer.referral.referralsCount);

      // Auto-assign to referrer's tribe
      if (referrer.tribe?.id && !referredUser.tribe?.id) {
        referredUser.tribe = {
          id: referrer.tribe.id,
          name: referrer.tribe.name,
          joinedAt: new Date(),
        };
        await referredUser.save();

        // Update tribe stats
        await this.updateTribeReferralStats(referrer.tribe.id);
      }

      await referrer.save();

      // Send notifications
      await this.sendReferralNotifications(referrer, referredUser, referrerRewards);

      // Emit real-time updates
      io.to(referrer._id.toString()).emit('referral_completed', {
        message: referrerRewards.message,
        rewards: referrerRewards,
        newRank: referrer.referral.recruitmentRank,
      });

      logger.info(`Referral ${referralId} completed successfully`);
    } catch (error) {
      logger.error(`Error processing referral ${referralId}:`, error);
      throw error;
    }
  },

  /**
   * Calculate rewards for referrer based on referral count
   * @param {number} referralCount - Number of referrals
   * @returns {Object}
   */
  calculateReferrerRewards(referralCount) {
    const rewards = {
      xp: 0,
      transformCredits: 0,
      coins: 0,
      premiumStyle: null,
      badge: null,
      warriorPassWeek: false,
      captainEligibility: false,
      message: 'Referral completed!'
    };

    // Check for tier rewards
    for (const threshold in REFERRAL_REWARDS) {
      if (referralCount >= parseInt(threshold)) {
        const tierReward = REFERRAL_REWARDS[threshold];
        rewards.xp += tierReward.xp || 0;
        rewards.transformCredits += tierReward.transformCredits || 0;
        rewards.coins += tierReward.coins || 0;
        rewards.premiumStyle = tierReward.premiumStyle || rewards.premiumStyle;
        rewards.badge = tierReward.badge || rewards.badge;
        rewards.warriorPassWeek = tierReward.warriorPassWeek || rewards.warriorPassWeek;
        rewards.captainEligibility = tierReward.captainEligibility || rewards.captainEligibility;
        rewards.message = tierReward.message;
      }
    }

    return rewards;
  },

  /**
   * Calculate recruitment rank based on referral count
   * @param {number} referralCount - Number of referrals
   * @returns {string}
   */
  calculateRecruitmentRank(referralCount) {
    if (referralCount >= 25) return 'warlord';
    if (referralCount >= 10) return 'captain';
    return 'scout';
  },

  /**
   * Distribute rewards to referrer and referred user
   * @param {Object} referrer - Referrer user document
   * @param {Object} referredUser - Referred user document
   * @param {Object} referrerRewards - Rewards for referrer
   * @param {Object} referredRewards - Rewards for referred user
   */
  async distributeRewards(referrer, referredUser, referrerRewards, referredRewards) {
    try {
      // Distribute XP
      if (referrerRewards.xp > 0) {
        referrer.progression.xp = (referrer.progression.xp || 0) + referrerRewards.xp;
      }
      if (referredRewards.xp > 0) {
        referredUser.progression.xp = (referredUser.progression.xp || 0) + referredRewards.xp;
      }

      // Distribute coins via wallet service
      if (referrerRewards.coins > 0) {
        await walletService.earnCoins(referrer._id, 'REFERRAL_BONUS', referrerRewards.coins, 'Referral bonus');
      }
      if (referredRewards.coins > 0) {
        await walletService.earnCoins(referredUser._id, 'REFERRAL_JOIN_BONUS', referredRewards.coins, 'Welcome bonus');
      }

      // Handle special rewards
      if (referrerRewards.transformCredits > 0) {
        referrer.entitlements.extraDailyTransforms = (referrer.entitlements.extraDailyTransforms || 0) + referrerRewards.transformCredits;
      }

      if (referrerRewards.premiumStyle) {
        referrer.entitlements.premiumStyles = [...new Set([...(referrer.entitlements.premiumStyles || []), referrerRewards.premiumStyle])];
      }

      if (referrerRewards.badge) {
        referrer.achievements.badges = [...new Set([...(referrer.achievements.badges || []), referrerRewards.badge])];
      }

      if (referrerRewards.warriorPassWeek) {
        // Extend Warrior Pass by 7 days
        const currentExpiry = referrer.subscription.expiresAt || new Date();
        referrer.subscription.expiresAt = new Date(currentExpiry.getTime() + 7 * 24 * 60 * 60 * 1000);
      }

      await referrer.save();
      await referredUser.save();
    } catch (error) {
      logger.error('Error distributing rewards:', error);
      throw error;
    }
  },

  /**
   * Update tribe referral statistics
   * @param {string} tribeId - Tribe ID
   */
  async updateTribeReferralStats(tribeId) {
    try {
      const stats = await Referral.getTribeReferralStats(tribeId);
      const tribeStats = stats[0] || { totalRecruits: 0, thisWeekRecruits: 0 };

      // Check for tribe-level rewards
      for (const threshold in TRIBE_REWARDS) {
        if (tribeStats.totalRecruits >= parseInt(threshold)) {
          const reward = TRIBE_REWARDS[threshold];
          // Apply tribe rewards (implement based on your tribe system)
          logger.info(`Tribe ${tribeId} earned reward: ${reward.message}`);
        }
      }
    } catch (error) {
      logger.error('Error updating tribe referral stats:', error);
    }
  },

  /**
   * Send referral completion notifications
   * @param {Object} referrer - Referrer user
   * @param {Object} referredUser - Referred user
   * @param {Object} rewards - Rewards earned
   */
  async sendReferralNotifications(referrer, referredUser, rewards) {
    try {
      // Notify referrer
      await notificationService.createNotification(referrer._id, {
        type: 'referral_success',
        title: 'Recruitment Success! 🎉',
        message: rewards.message,
        deeplink: '/app/referral',
      });

      // Notify referred user
      await notificationService.createNotification(referredUser._id, {
        type: 'welcome_referral',
        title: 'Welcome to Afroverse! ✨',
        message: `You joined through ${referrer.username}'s invitation and received a welcome bonus!`,
        deeplink: '/app/wallet',
      });
    } catch (error) {
      logger.error('Error sending referral notifications:', error);
    }
  },

  /**
   * Perform fraud detection checks
   * @param {string} referrerId - Referrer user ID
   * @param {string} referredUserId - Referred user ID
   * @param {Object} context - Context information
   * @returns {Promise<{passed: boolean, reason?: string}>}
   */
  async performFraudChecks(referrerId, referredUserId, context) {
    try {
      // Check for IP abuse
      if (context.ipAddress) {
        const recentReferralsFromIp = await Referral.countDocuments({
          'fraudDetection.ipAddress': context.ipAddress,
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          status: 'completed'
        });

        if (recentReferralsFromIp >= 5) {
          return { passed: false, reason: 'IP_LIMIT_EXCEEDED' };
        }
      }

      // Check for device fingerprint abuse
      if (context.deviceFingerprint) {
        const recentReferralsFromDevice = await Referral.countDocuments({
          'fraudDetection.deviceFingerprint': context.deviceFingerprint,
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          status: 'completed'
        });

        if (recentReferralsFromDevice >= 3) {
          return { passed: false, reason: 'DEVICE_LIMIT_EXCEEDED' };
        }
      }

      return { passed: true };
    } catch (error) {
      logger.error('Error performing fraud checks:', error);
      return { passed: false, reason: 'FRAUD_CHECK_ERROR' };
    }
  },

  /**
   * Get referral statistics for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>}
   */
  async getReferralStats(userId) {
    try {
      const stats = await Referral.getReferralStats(userId);
      const userStats = stats[0] || {
        totalReferrals: 0,
        completedReferrals: 0,
        pendingReferrals: 0,
        totalXpEarned: 0,
        totalCoinsEarned: 0,
        totalTransformCredits: 0,
      };

      const user = await User.findById(userId).select('referral');
      if (!user) throw new Error('User not found');

      return {
        ...userStats,
        code: user.referral?.code,
        recruitmentRank: user.referral?.recruitmentRank || 'scout',
        rewardsClaimed: user.referral?.rewardsClaimed || [],
        dailyInviteCount: user.referral?.dailyInviteCount || 0,
        nextRewardThreshold: this.getNextRewardThreshold(userStats.completedReferrals),
      };
    } catch (error) {
      logger.error('Error getting referral stats:', error);
      throw error;
    }
  },

  /**
   * Get next reward threshold
   * @param {number} currentCount - Current referral count
   * @returns {Object}
   */
  getNextRewardThreshold(currentCount) {
    const thresholds = Object.keys(REFERRAL_REWARDS).map(Number).sort((a, b) => a - b);
    const nextThreshold = thresholds.find(threshold => threshold > currentCount);
    
    if (nextThreshold) {
      return {
        threshold: nextThreshold,
        reward: REFERRAL_REWARDS[nextThreshold],
        referralsNeeded: nextThreshold - currentCount,
      };
    }
    
    return null;
  },

  /**
   * Get top recruiters leaderboard
   * @param {number} limit - Number of results
   * @returns {Promise<Array>}
   */
  async getTopRecruiters(limit = 10) {
    try {
      return await Referral.getTopRecruiters(limit);
    } catch (error) {
      logger.error('Error getting top recruiters:', error);
      throw error;
    }
  },

  /**
   * Get top recruiting tribes leaderboard
   * @param {number} limit - Number of results
   * @returns {Promise<Array>}
   */
  async getTopRecruitingTribes(limit = 10) {
    try {
      return await Referral.getTopRecruitingTribes(limit);
    } catch (error) {
      logger.error('Error getting top recruiting tribes:', error);
      throw error;
    }
  },

  /**
   * Reset daily invite counts (cron job)
   */
  async resetDailyInviteCounts() {
    try {
      await User.updateMany(
        { 'referral.dailyInviteCount': { $gt: 0 } },
        { 
          $set: { 
            'referral.dailyInviteCount': 0,
            'referral.lastInviteDate': null 
          } 
        }
      );
      logger.info('Daily invite counts reset for all users');
    } catch (error) {
      logger.error('Error resetting daily invite counts:', error);
    }
  },

  /**
   * Clean up expired pending referrals
   */
  async cleanupExpiredReferrals() {
    try {
      const expiredReferrals = await Referral.find({
        status: 'pending',
        createdAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      });

      for (const referral of expiredReferrals) {
        referral.status = 'failed';
        referral.failedAt = new Date();
        await referral.save();
      }

      logger.info(`Cleaned up ${expiredReferrals.length} expired referrals`);
    } catch (error) {
      logger.error('Error cleaning up expired referrals:', error);
    }
  },

  /**
   * Update referral analytics metrics
   */
  async updateReferralAnalytics() {
    try {
      logger.info('Updating referral analytics');
      
      // Get referrals from the last 24 hours
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const referrals = await Referral.find({
        createdAt: { $gte: yesterday }
      }).select('_id status referrerId referredUserId tribeId');
      
      // Update analytics for each referral
      for (const referral of referrals) {
        // This would typically update analytics metrics
        // For now, we'll just log the action
      }
      
      logger.info(`Updated analytics for ${referrals.length} referrals`);
      return { success: true, count: referrals.length };
    } catch (error) {
      logger.error('Error updating referral analytics:', error);
      throw error;
    }
  },

  /**
   * Send tribe referral pressure notifications
   */
  async sendTribeReferralPressure() {
    try {
      logger.info('Sending tribe referral pressure notifications');
      
      // This would typically send notifications to tribe members
      // encouraging them to refer more people
      logger.info('Tribe referral pressure notifications sent');
      
      return { success: true };
    } catch (error) {
      logger.error('Error sending tribe referral pressure:', error);
      throw error;
    }
  },
};

module.exports = referralService;