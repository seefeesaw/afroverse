const Achievement = require('../models/Achievement');
const UserAchievement = require('../models/UserAchievement');
const User = require('../models/User');
const { logger } = require('../utils/logger');
const { io } = require('../sockets/socketService');
const notificationService = require('./notificationService');

const achievementService = {
  /**
   * Initialize default achievements
   */
  async initializeAchievements() {
    try {
      const defaultAchievements = [
        {
          _id: 'spark',
          name: 'Spark',
          description: 'Create your first transformation',
          category: 'milestone',
          rarity: 'common',
          icon: '✨',
          color: '#FFD700',
          target: 1,
          metric: 'transformations',
          xpReward: 10,
          sortOrder: 1,
        },
        {
          _id: 'apprentice',
          name: 'Apprentice',
          description: 'Create 10 transformations',
          category: 'milestone',
          rarity: 'common',
          icon: '🎨',
          color: '#4CAF50',
          target: 10,
          metric: 'transformations',
          reward: {
            type: 'free_transform',
            value: 1,
            description: '+1 free transformation'
          },
          xpReward: 50,
          sortOrder: 2,
        },
        {
          _id: 'artisan',
          name: 'Artisan',
          description: 'Create 50 transformations',
          category: 'milestone',
          rarity: 'rare',
          icon: '🏆',
          color: '#FF9800',
          target: 50,
          metric: 'transformations',
          reward: {
            type: 'free_transform',
            value: 3,
            description: '+3 free transformations'
          },
          xpReward: 200,
          sortOrder: 3,
        },
        {
          _id: 'champion',
          name: 'Champion',
          description: 'Win 10 battles',
          category: 'battle',
          rarity: 'rare',
          icon: '⚔️',
          color: '#9C27B0',
          target: 10,
          metric: 'battles_won',
          reward: {
            type: 'streak_freeze',
            value: 1,
            description: '+1 streak freeze'
          },
          xpReward: 150,
          sortOrder: 4,
        },
        {
          _id: 'conqueror',
          name: 'Conqueror',
          description: 'Win 50 battles',
          category: 'battle',
          rarity: 'epic',
          icon: '👑',
          color: '#E91E63',
          target: 50,
          metric: 'battles_won',
          reward: {
            type: 'tribe_points_multiplier',
            value: 1.05,
            description: '+5% tribe points'
          },
          xpReward: 500,
          sortOrder: 5,
        },
        {
          _id: 'rising_flame',
          name: 'Rising Flame',
          description: 'Maintain a 3-day streak',
          category: 'streak',
          rarity: 'common',
          icon: '🔥',
          color: '#FF5722',
          target: 3,
          metric: 'streak_days',
          xpReward: 30,
          sortOrder: 6,
        },
        {
          _id: 'inferno',
          name: 'Inferno',
          description: 'Maintain a 7-day streak',
          category: 'streak',
          rarity: 'rare',
          icon: '🌋',
          color: '#FF1744',
          target: 7,
          metric: 'streak_days',
          reward: {
            type: 'premium_style',
            value: 1,
            description: '+1 premium style trial'
          },
          xpReward: 100,
          sortOrder: 7,
        },
        {
          _id: 'unbreakable',
          name: 'Unbreakable',
          description: 'Maintain a 30-day streak',
          category: 'streak',
          rarity: 'legendary',
          icon: '💎',
          color: '#673AB7',
          target: 30,
          metric: 'streak_days',
          reward: {
            type: 'profile_title',
            value: 1,
            description: 'Unique "Unbreakable" title'
          },
          xpReward: 1000,
          sortOrder: 8,
        },
        {
          _id: 'voice_of_tribe',
          name: 'Voice of the Tribe',
          description: 'Cast 100 votes',
          category: 'tribe',
          rarity: 'rare',
          icon: '🗳️',
          color: '#2196F3',
          target: 100,
          metric: 'votes_cast',
          xpReward: 120,
          sortOrder: 9,
        },
        {
          _id: 'tribe_pillar',
          name: 'Tribe Pillar',
          description: 'Earn 1000 tribe points',
          category: 'tribe',
          rarity: 'epic',
          icon: '🏛️',
          color: '#795548',
          target: 1000,
          metric: 'tribe_points',
          reward: {
            type: 'profile_title',
            value: 1,
            description: 'Unique "Tribe Pillar" title'
          },
          xpReward: 300,
          sortOrder: 10,
        },
        {
          _id: 'herald',
          name: 'Herald',
          description: 'Share content 5 times',
          category: 'social',
          rarity: 'common',
          icon: '📢',
          color: '#607D8B',
          target: 5,
          metric: 'shares',
          xpReward: 25,
          sortOrder: 11,
        },
        {
          _id: 'social_butterfly',
          name: 'Social Butterfly',
          description: 'Gain 10 followers',
          category: 'social',
          rarity: 'rare',
          icon: '🦋',
          color: '#E91E63',
          target: 10,
          metric: 'followers',
          xpReward: 80,
          sortOrder: 12,
        },
      ];

      for (const achievement of defaultAchievements) {
        await Achievement.findOneAndUpdate(
          { _id: achievement._id },
          achievement,
          { upsert: true, new: true }
        );
      }

      logger.info('Achievements initialized successfully');
    } catch (error) {
      logger.error('Error initializing achievements:', error);
      throw error;
    }
  },

  /**
   * Get all achievements
   * @param {string} category - Filter by category (optional)
   * @param {string} rarity - Filter by rarity (optional)
   * @returns {Promise<Array>} List of achievements
   */
  async getAllAchievements(category = null, rarity = null) {
    try {
      const query = { isActive: true };
      if (category) query.category = category;
      if (rarity) query.rarity = rarity;

      const achievements = await Achievement.find(query)
        .sort({ sortOrder: 1, rarity: 1 });

      return achievements;
    } catch (error) {
      logger.error('Error getting achievements:', error);
      throw error;
    }
  },

  /**
   * Get user's achievements and progress
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User achievements data
   */
  async getUserAchievements(userId) {
    try {
      const user = await User.findById(userId).select('achievements achievementProgress');
      if (!user) {
        throw new Error('User not found');
      }

      const allAchievements = await this.getAllAchievements();
      const userAchievements = user.achievements.unlocked.map(ua => ua.achievementId);

      const achievementsWithProgress = allAchievements.map(achievement => {
        const isUnlocked = userAchievements.includes(achievement._id);
        const userAchievement = user.achievements.unlocked.find(
          ua => ua.achievementId === achievement._id
        );
        const progress = user.achievementProgress[achievement.metric] || 0;
        const progressPercentage = Math.min((progress / achievement.target) * 100, 100);

        return {
          ...achievement.toObject(),
          isUnlocked,
          progress,
          progressPercentage,
          unlockedAt: userAchievement?.unlockedAt,
          rewardClaimed: userAchievement?.rewardClaimed || false,
        };
      });

      // Calculate stats
      const unlockedCount = achievementsWithProgress.filter(a => a.isUnlocked).length;
      const totalCount = achievementsWithProgress.length;
      const rarityBreakdown = this.calculateRarityBreakdown(achievementsWithProgress);

      return {
        achievements: achievementsWithProgress,
        stats: {
          unlockedCount,
          totalCount,
          totalXp: user.achievements.totalXp,
          rarityBreakdown,
        },
      };
    } catch (error) {
      logger.error('Error getting user achievements:', error);
      throw error;
    }
  },

  /**
   * Check and unlock achievements for a user
   * @param {string} userId - User ID
   * @param {string} metric - Metric that was updated
   * @param {number} value - Value added
   * @returns {Promise<Array>} Newly unlocked achievements
   */
  async checkAchievements(userId, metric, value) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Update progress
      await user.updateAchievementProgress(metric, value);

      // Get achievements for this metric
      const achievements = await Achievement.find({
        metric,
        isActive: true,
      });

      const newlyUnlocked = [];

      for (const achievement of achievements) {
        const currentProgress = user.achievementProgress[metric] || 0;
        
        // Check if achievement should be unlocked
        if (currentProgress >= achievement.target && !user.hasAchievement(achievement._id)) {
          await user.unlockAchievement(achievement._id);
          await user.addAchievementXp(achievement.xpReward);

          // Apply reward if any
          if (achievement.reward) {
            await this.applyReward(user, achievement);
          }

          // Send notification
          await notificationService.createNotification(userId, {
            type: 'achievement_unlocked',
            title: 'Achievement Unlocked!',
            message: `You earned the "${achievement.name}" achievement!`,
            deeplink: `/app/profile/${user.username}#achievements`,
          });

          // Broadcast achievement unlock
          io.to(`user:${userId}`).emit('achievement_unlocked', {
            achievement: {
              _id: achievement._id,
              name: achievement.name,
              description: achievement.description,
              icon: achievement.icon,
              color: achievement.color,
              rarity: achievement.rarity,
              reward: achievement.reward,
              xpReward: achievement.xpReward,
            },
            totalXp: user.achievements.totalXp,
          });

          newlyUnlocked.push(achievement);
          logger.info(`User ${userId} unlocked achievement: ${achievement.name}`);
        }
      }

      return newlyUnlocked;
    } catch (error) {
      logger.error('Error checking achievements:', error);
      throw error;
    }
  },

  /**
   * Apply achievement reward to user
   * @param {Object} user - User object
   * @param {Object} achievement - Achievement object
   * @returns {Promise<void>}
   */
  async applyReward(user, achievement) {
    try {
      const reward = achievement.reward;
      if (!reward) return;

      switch (reward.type) {
        case 'free_transform':
          // Add free transformations to user's entitlements
          if (!user.entitlements.freeTransforms) {
            user.entitlements.freeTransforms = 0;
          }
          user.entitlements.freeTransforms += reward.value;
          break;

        case 'streak_freeze':
          // Add streak freezes
          if (!user.streak.freezes) {
            user.streak.freezes = 0;
          }
          user.streak.freezes += reward.value;
          break;

        case 'tribe_points_multiplier':
          // Add tribe points multiplier
          if (!user.entitlements.tribePointsMultiplier) {
            user.entitlements.tribePointsMultiplier = 1;
          }
          user.entitlements.tribePointsMultiplier *= reward.value;
          break;

        case 'premium_style':
          // Add premium style access
          if (!user.entitlements.premiumStyles) {
            user.entitlements.premiumStyles = [];
          }
          // This would be handled by the style system
          break;

        case 'profile_title':
          // Add profile title
          if (!user.profileTitles) {
            user.profileTitles = [];
          }
          user.profileTitles.push(achievement.name);
          break;

        case 'xp_boost':
          // Add XP boost
          if (!user.entitlements.xpBoost) {
            user.entitlements.xpBoost = 1;
          }
          user.entitlements.xpBoost += reward.value;
          break;
      }

      await user.save();
    } catch (error) {
      logger.error('Error applying reward:', error);
      throw error;
    }
  },

  /**
   * Claim achievement reward
   * @param {string} userId - User ID
   * @param {string} achievementId - Achievement ID
   * @returns {Promise<Object>} Claim result
   */
  async claimReward(userId, achievementId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const achievement = await Achievement.findById(achievementId);
      if (!achievement) {
        throw new Error('Achievement not found');
      }

      if (!user.hasAchievement(achievementId)) {
        throw new Error('Achievement not unlocked');
      }

      const userAchievement = user.achievements.unlocked.find(
        a => a.achievementId === achievementId
      );

      if (userAchievement.rewardClaimed) {
        throw new Error('Reward already claimed');
      }

      await user.claimAchievementReward(achievementId);

      return {
        success: true,
        reward: achievement.reward,
        message: 'Reward claimed successfully',
      };
    } catch (error) {
      logger.error('Error claiming reward:', error);
      throw error;
    }
  },

  /**
   * Get achievement leaderboard
   * @param {number} limit - Number of users to return
   * @returns {Promise<Array>} Leaderboard data
   */
  async getAchievementLeaderboard(limit = 10) {
    try {
      const users = await User.find({})
        .select('username displayName avatar achievements')
        .sort({ 'achievements.totalXp': -1 })
        .limit(limit);

      return users.map((user, index) => ({
        rank: index + 1,
        username: user.username,
        displayName: user.displayName || user.username,
        avatar: user.avatar,
        totalXp: user.achievements.totalXp,
        achievementsUnlocked: user.achievements.unlocked.length,
      }));
    } catch (error) {
      logger.error('Error getting achievement leaderboard:', error);
      throw error;
    }
  },

  /**
   * Calculate rarity breakdown
   * @param {Array} achievements - Achievements array
   * @returns {Object} Rarity breakdown
   */
  calculateRarityBreakdown(achievements) {
    const breakdown = {
      common: { unlocked: 0, total: 0 },
      rare: { unlocked: 0, total: 0 },
      epic: { unlocked: 0, total: 0 },
      legendary: { unlocked: 0, total: 0 },
    };

    achievements.forEach(achievement => {
      breakdown[achievement.rarity].total++;
      if (achievement.isUnlocked) {
        breakdown[achievement.rarity].unlocked++;
      }
    });

    return breakdown;
  },

  /**
   * Get achievement statistics
   * @returns {Promise<Object>} Achievement stats
   */
  async getAchievementStats() {
    try {
      const totalAchievements = await Achievement.countDocuments({ isActive: true });
      const totalUsers = await User.countDocuments();
      const usersWithAchievements = await User.countDocuments({
        'achievements.unlocked.0': { $exists: true }
      });

      const rarityStats = await Achievement.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$rarity', count: { $sum: 1 } } }
      ]);

      return {
        totalAchievements,
        totalUsers,
        usersWithAchievements,
        rarityStats,
      };
    } catch (error) {
      logger.error('Error getting achievement stats:', error);
      throw error;
    }
  },

  /**
   * Reset user achievements (admin only)
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  async resetUserAchievements(userId) {
    try {
      await User.findByIdAndUpdate(userId, {
        $set: {
          'achievements.unlocked': [],
          'achievements.totalXp': 0,
          'achievementProgress': {
            transformations: 0,
            battlesWon: 0,
            votesCast: 0,
            tribePointsEarned: 0,
            shares: 0,
            followers: 0,
            following: 0,
          },
        },
      });

      logger.info(`Achievements reset for user ${userId}`);
    } catch (error) {
      logger.error('Error resetting user achievements:', error);
      throw error;
    }
  },
};

module.exports = achievementService;