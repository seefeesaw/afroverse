const User = require('../models/User');
const { redisClient } = require('../config/redis');
const socketService = require('../sockets/socketService');
const { logger } = require('../utils/logger');

class ProgressionService {
  constructor() {
    this.xpRewards = {
      transform_created: 10,
      battle_win: 50,
      battle_loss: 20,
      vote: 2,
      daily_login: 5
    };
    
    this.dailyXpCaps = {
      vote: 40, // 20 votes * 2 XP each
      total: 100 // Total daily XP cap
    };
    
    this.levelCurve = this.generateLevelCurve();
    this.milestones = this.generateMilestones();
  }

  // Generate level curve (exponential-ish)
  generateLevelCurve() {
    const curve = {};
    let xp = 0;
    
    for (let level = 1; level <= 100; level++) {
      curve[level] = xp;
      if (level === 1) {
        xp = 100;
      } else {
        xp = Math.floor(xp * 1.5 + 50);
      }
    }
    
    return curve;
  }

  // Generate milestones
  generateMilestones() {
    return {
      streak_3: { name: '3-Day Bronze', type: 'badge', threshold: 3 },
      streak_7: { name: '7-Day Silver', type: 'badge', threshold: 7, reward: 'premium_style_pass_1' },
      streak_30: { name: '30-Day Gold', type: 'badge', threshold: 30, reward: 'xp_boost_24h' },
      streak_100: { name: '100-Day Diamond', type: 'badge', threshold: 100, reward: 'diamond_title' },
      streak_365: { name: '365-Day Mythic', type: 'badge', threshold: 365, reward: 'mythic_frame' }
    };
  }

  // Get XP required for next level
  getNextLevelXp(currentLevel) {
    return this.levelCurve[currentLevel + 1] || this.levelCurve[currentLevel];
  }

  // Calculate level from XP
  calculateLevel(xp) {
    let level = 1;
    for (let l = 1; l <= 100; l++) {
      if (xp >= this.levelCurve[l]) {
        level = l;
      } else {
        break;
      }
    }
    return level;
  }

  // Check if user leveled up
  checkLevelUp(oldLevel, newLevel) {
    return newLevel > oldLevel;
  }

  // Get rewards for level up
  getLevelUpRewards(newLevel) {
    const rewards = [];
    
    // Check milestone rewards
    Object.entries(this.milestones).forEach(([id, milestone]) => {
      if (milestone.threshold === newLevel && milestone.reward) {
        rewards.push({
          id: milestone.reward,
          type: this.getRewardType(milestone.reward),
          grantedAt: new Date()
        });
      }
    });
    
    return rewards;
  }

  // Get reward type
  getRewardType(rewardId) {
    if (rewardId.includes('premium_style_pass')) return 'voucher';
    if (rewardId.includes('xp_boost')) return 'boost';
    if (rewardId.includes('title') || rewardId.includes('frame')) return 'cosmetic';
    return 'voucher';
  }

  // Enforce daily XP cap
  async enforceDailyXpCap(userId, amount, reason) {
    try {
      const now = new Date();
      const day = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
      
      // Check specific reason cap
      if (reason === 'vote') {
        const voteKey = `xp:vote:${userId}:${day}`;
        const currentVoteXp = await redisClient.get(voteKey) || 0;
        const remainingVoteXp = this.dailyXpCaps.vote - parseInt(currentVoteXp);
        
        if (remainingVoteXp <= 0) {
          return 0;
        }
        
        const cappedAmount = Math.min(amount, remainingVoteXp);
        await redisClient.incrby(voteKey, cappedAmount);
        await redisClient.expire(voteKey, 86400); // 24 hours
        
        return cappedAmount;
      }
      
      // Check total daily cap
      const totalKey = `xp:total:${userId}:${day}`;
      const currentTotalXp = await redisClient.get(totalKey) || 0;
      const remainingTotalXp = this.dailyXpCaps.total - parseInt(currentTotalXp);
      
      if (remainingTotalXp <= 0) {
        return 0;
      }
      
      const cappedAmount = Math.min(amount, remainingTotalXp);
      await redisClient.incrby(totalKey, cappedAmount);
      await redisClient.expire(totalKey, 86400); // 24 hours
      
      return cappedAmount;
    } catch (error) {
      logger.error('Error enforcing daily XP cap:', error);
      return amount; // Fallback to full amount
    }
  }

  // Grant XP to user
  async grantXp(userId, amount, reason, context = {}) {
    try {
      if (!userId || !amount || !reason) {
        throw new Error('Missing required parameters for grantXp');
      }

      // Get user
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Enforce daily cap
      const cappedAmount = await this.enforceDailyXpCap(userId, amount, reason);
      if (cappedAmount <= 0) {
        return {
          success: false,
          message: 'Daily XP cap reached'
        };
      }

      // Calculate new XP and level
      const oldLevel = user.progression.level || 1;
      const newXp = (user.progression.xp || 0) + cappedAmount;
      const newLevel = this.calculateLevel(newXp);
      const nextLevelXp = this.getNextLevelXp(newLevel);
      const levelUp = this.checkLevelUp(oldLevel, newLevel);

      // Get rewards for level up
      const rewards = levelUp ? this.getLevelUpRewards(newLevel) : [];

      // Update user
      const updateData = {
        'progression.xp': newXp,
        'progression.level': newLevel,
        'progression.nextLevelXp': nextLevelXp
      };

      if (rewards.length > 0) {
        updateData.$push = {
          'progression.rewards': { $each: rewards }
        };
      }

      await User.findByIdAndUpdate(userId, updateData);

      // Emit socket events
      socketService.emitUserNotification(userId, {
        type: 'xp_gain',
        amount: cappedAmount,
        newXp,
        levelUp,
        newLevel,
        reason
      });

      if (levelUp) {
        socketService.emitUserNotification(userId, {
          type: 'level_up',
          newLevel,
          rewards: rewards.map(r => r.id)
        });
      }

      logger.info(`Granted ${cappedAmount} XP to user ${userId} for reason: ${reason}`);

      return {
        success: true,
        amount: cappedAmount,
        newXp,
        levelUp,
        newLevel,
        nextLevelXp,
        rewards: rewards.map(r => r.id)
      };
    } catch (error) {
      logger.error('Error granting XP:', error);
      throw error;
    }
  }

  // Get user progression summary
  async getUserProgression(userId) {
    try {
      const user = await User.findById(userId).lean();
      if (!user) {
        throw new Error('User not found');
      }

      const progression = user.progression || {};
      const streak = user.streak || {};
      const daily = user.daily || {};

      // Check if user has qualified today
      const now = new Date();
      const tz = streak.timezone || 'Africa/Johannesburg';
      const todayLocal = User.toLocalDateString(now, tz);
      const safeToday = streak.lastCheckedDateLocal === todayLocal;

      // Get time until midnight
      const timeToMidnightSec = user.getTimeUntilMidnight ? user.getTimeUntilMidnight() : 0;

      // Get unlocked milestones
      const unlockedMilestones = [];
      const lockedMilestones = [];

      Object.entries(this.milestones).forEach(([id, milestone]) => {
        const isUnlocked = (streak.current || 0) >= milestone.threshold;
        const milestoneData = {
          id,
          name: milestone.name,
          threshold: milestone.threshold,
          unlocked: isUnlocked
        };

        if (isUnlocked) {
          const badge = progression.badges?.find(b => b.id === id);
          milestoneData.unlockedAt = badge?.unlockedAt;
          unlockedMilestones.push(milestoneData);
        } else {
          lockedMilestones.push(milestoneData);
        }
      });

      return {
        streak: {
          current: streak.current || 0,
          longest: streak.longest || 0,
          safeToday,
          timeToMidnightSec,
          freeze: {
            available: streak.freeze?.available || 0
          }
        },
        xp: {
          value: progression.xp || 0,
          level: progression.level || 1,
          nextLevelXp: progression.nextLevelXp || 100
        },
        milestones: [...unlockedMilestones, ...lockedMilestones],
        today: {
          voted: daily.voteCount || 0,
          votesNeededForStreak: Math.max(0, 5 - (daily.voteCount || 0)),
          didTransform: false, // This would be checked from transform history
          didBattleAction: false // This would be checked from battle history
        }
      };
    } catch (error) {
      logger.error('Error getting user progression:', error);
      throw error;
    }
  }

  // Grant milestone badge
  async grantMilestoneBadge(userId, milestoneId) {
    try {
      const milestone = this.milestones[milestoneId];
      if (!milestone) {
        throw new Error('Invalid milestone ID');
      }

      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check if already unlocked
      const existingBadge = user.progression.badges?.find(b => b.id === milestoneId);
      if (existingBadge) {
        return {
          success: false,
          message: 'Badge already unlocked'
        };
      }

      // Add badge
      const badge = {
        id: milestoneId,
        unlockedAt: new Date()
      };

      await User.findByIdAndUpdate(userId, {
        $push: { 'progression.badges': badge }
      });

      // Grant reward if applicable
      if (milestone.reward) {
        const reward = {
          id: milestone.reward,
          type: this.getRewardType(milestone.reward),
          grantedAt: new Date()
        };

        await User.findByIdAndUpdate(userId, {
          $push: { 'progression.rewards': reward }
        });

        // Emit reward granted event
        socketService.emitUserNotification(userId, {
          type: 'reward_granted',
          rewardId: milestone.reward,
          type: reward.type
        });
      }

      logger.info(`Granted milestone badge ${milestoneId} to user ${userId}`);

      return {
        success: true,
        badge,
        reward: milestone.reward ? {
          id: milestone.reward,
          type: this.getRewardType(milestone.reward)
        } : null
      };
    } catch (error) {
      logger.error('Error granting milestone badge:', error);
      throw error;
    }
  }

  // Claim reward
  async claimReward(userId, rewardId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const reward = user.progression.rewards?.find(r => r.id === rewardId && !r.claimed);
      if (!reward) {
        throw new Error('Reward not found or already claimed');
      }

      // Mark as claimed
      await User.updateOne(
        { _id: userId, 'progression.rewards.id': rewardId },
        {
          $set: {
            'progression.rewards.$.claimed': true,
            'progression.rewards.$.consumedAt': new Date()
          }
        }
      );

      logger.info(`User ${userId} claimed reward ${rewardId}`);

      return {
        success: true,
        rewardId,
        type: reward.type
      };
    } catch (error) {
      logger.error('Error claiming reward:', error);
      throw error;
    }
  }
}

// Create singleton instance
const progressionService = new ProgressionService();

module.exports = progressionService;
