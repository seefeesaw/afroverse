const User = require('../models/User');
const progressionService = require('./progressionService');
const socketService = require('../sockets/socketService');
const { logger } = require('../utils/logger');

class StreakService {
  constructor() {
    this.qualifyingActions = {
      transform: 'transform_created',
      vote_bundle: 'vote_bundle',
      battle_action: 'battle_action'
    };
  }

  // Mark qualifying action
  async markQualifyingAction(userId, action) {
    try {
      if (!userId || !action) {
        throw new Error('Missing required parameters for markQualifyingAction');
      }

      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check and reset daily counters
      await user.checkDailyReset();

      const nowUTC = new Date();
      const tz = user.streak.timezone || 'Africa/Johannesburg';
      const todayLocal = user.toLocalDateString(nowUTC, tz);
      const lastLocal = user.streak.lastCheckedDateLocal;

      // If we already qualified today, just return
      if (lastLocal === todayLocal) {
        return {
          success: true,
          alreadyQualified: true,
          current: user.streak.current || 0
        };
      }

      // Determine gap
      const gap = lastLocal ? user.dayDiffLocal(lastLocal, todayLocal, tz) : 1;

      if (gap === 1 || lastLocal === null) {
        // Normal increment
        const newCurrent = (user.streak.current || 0) + 1;
        const longest = Math.max(user.streak.longest || 0, newCurrent);

        await User.findByIdAndUpdate(userId, {
          $set: {
            'streak.current': newCurrent,
            'streak.longest': longest,
            'streak.lastQualifiedAt': nowUTC,
            'streak.lastCheckedDateLocal': todayLocal
          }
        });

        // Track achievement progress for streak days
        try {
          const achievementService = require('./achievementService');
          await achievementService.checkAchievements(userId, 'streak_days', newCurrent);
        } catch (error) {
          logger.error('Error tracking streak achievement:', error);
        }

        // Check for milestone badges
        await this.checkMilestoneBadges(userId, newCurrent);

        // Emit socket event
        socketService.emitUserNotification(userId, {
          type: 'streak_update',
          current: newCurrent,
          safeToday: true,
          timeToMidnightSec: user.getTimeUntilMidnight()
        });

        logger.info(`User ${userId} qualified for streak: ${newCurrent} days`);

        return {
          success: true,
          newCurrent,
          longest,
          safeToday: true
        };
      }

      if (gap > 1) {
        // Streak broken (allow freeze)
        await User.findByIdAndUpdate(userId, {
          $set: { 'streak.lastCheckedDateLocal': todayLocal }
        });

        logger.info(`User ${userId} streak broken: ${gap} day gap`);

        return {
          success: false,
          broken: true,
          canFreeze: (user.streak.freeze?.available || 0) > 0,
          gap
        };
      }

      return {
        success: false,
        message: 'Invalid date gap'
      };
    } catch (error) {
      logger.error('Error marking qualifying action:', error);
      throw error;
    }
  }

  // Check milestone badges
  async checkMilestoneBadges(userId, streakCount) {
    try {
      const milestones = {
        streak_3: 3,
        streak_7: 7,
        streak_30: 30,
        streak_100: 100,
        streak_365: 365
      };

      for (const [milestoneId, threshold] of Object.entries(milestones)) {
        if (streakCount === threshold) {
          await progressionService.grantMilestoneBadge(userId, milestoneId);
        }
      }
    } catch (error) {
      logger.error('Error checking milestone badges:', error);
    }
  }

  // Use freeze
  async useFreeze(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if ((user.streak.freeze?.available || 0) <= 0) {
        throw new Error('No freezes available');
      }

      // Check if user can use freeze (must have missed yesterday)
      const nowUTC = new Date();
      const tz = user.streak.timezone || 'Africa/Johannesburg';
      const todayLocal = user.toLocalDateString(nowUTC, tz);
      const lastLocal = user.streak.lastCheckedDateLocal;

      if (!lastLocal) {
        throw new Error('No streak to restore');
      }

      const gap = user.dayDiffLocal(lastLocal, todayLocal, tz);
      if (gap !== 1) {
        throw new Error('Freeze can only be used the day after a missed day');
      }

      // Restore streak
      const restoredStreak = (user.streak.current || 0) + 1;
      const longest = Math.max(user.streak.longest || 0, restoredStreak);

      await User.findByIdAndUpdate(userId, {
        $set: {
          'streak.current': restoredStreak,
          'streak.longest': longest,
          'streak.lastQualifiedAt': nowUTC,
          'streak.lastCheckedDateLocal': todayLocal
        },
        $inc: {
          'streak.freeze.available': -1
        }
      });

      // Emit socket event
      socketService.emitUserNotification(userId, {
        type: 'streak_freeze_used',
        restoredStreak,
        freezesRemaining: (user.streak.freeze?.available || 0) - 1
      });

      logger.info(`User ${userId} used freeze, restored streak to ${restoredStreak}`);

      return {
        success: true,
        streakRestoredTo: restoredStreak,
        freezeRemaining: (user.streak.freeze?.available || 0) - 1
      };
    } catch (error) {
      logger.error('Error using freeze:', error);
      throw error;
    }
  }

  // Grant freeze
  async grantFreeze(userId, count = 1, source = 'admin') {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      await User.findByIdAndUpdate(userId, {
        $inc: {
          'streak.freeze.available': count
        },
        $set: {
          'streak.freeze.lastGrantedAt': new Date()
        }
      });

      logger.info(`Granted ${count} freeze(s) to user ${userId} from ${source}`);

      return {
        success: true,
        count,
        source
      };
    } catch (error) {
      logger.error('Error granting freeze:', error);
      throw error;
    }
  }

  // Get streak status
  async getStreakStatus(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const nowUTC = new Date();
      const tz = user.streak.timezone || 'Africa/Johannesburg';
      const todayLocal = user.toLocalDateString(nowUTC, tz);
      const safeToday = user.streak.lastCheckedDateLocal === todayLocal;
      const timeToMidnightSec = user.getTimeUntilMidnight();

      return {
        current: user.streak.current || 0,
        longest: user.streak.longest || 0,
        safeToday,
        timeToMidnightSec,
        freeze: {
          available: user.streak.freeze?.available || 0
        },
        lastQualifiedAt: user.streak.lastQualifiedAt,
        timezone: tz
      };
    } catch (error) {
      logger.error('Error getting streak status:', error);
      throw error;
    }
  }

  // Check if user needs to qualify today
  async needsQualificationToday(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return false;
      }

      const nowUTC = new Date();
      const tz = user.streak.timezone || 'Africa/Johannesburg';
      const todayLocal = user.toLocalDateString(nowUTC, tz);

      return user.streak.lastCheckedDateLocal !== todayLocal;
    } catch (error) {
      logger.error('Error checking qualification need:', error);
      return false;
    }
  }

  // Get qualifying actions status
  async getQualifyingActionsStatus(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const daily = user.daily || {};
      const voteCount = daily.voteCount || 0;
      const votesNeeded = Math.max(0, 5 - voteCount);

      return {
        transform: false, // This would be checked from transform history
        voteBundle: voteCount >= 5,
        battleAction: false, // This would be checked from battle history
        votesNeeded,
        voteCount
      };
    } catch (error) {
      logger.error('Error getting qualifying actions status:', error);
      throw error;
    }
  }

  // Handle vote count increment
  async handleVoteIncrement(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check and reset daily counters
      await user.checkDailyReset();

      // Increment vote count
      await user.incrementVoteCount();

      // Check if vote bundle qualifies
      const updatedUser = await User.findById(userId);
      const voteCount = updatedUser.daily.voteCount || 0;

      if (voteCount >= 5) {
        // Grant XP for vote bundle
        await progressionService.grantXp(userId, 10, 'vote_bundle');

        // Mark as qualifying action
        return await this.markQualifyingAction(userId, 'vote_bundle');
      }

      return {
        success: true,
        voteCount,
        needsMore: 5 - voteCount
      };
    } catch (error) {
      logger.error('Error handling vote increment:', error);
      throw error;
    }
  }

  // Handle transform creation
  async handleTransformCreation(userId) {
    try {
      // Grant XP
      await progressionService.grantXp(userId, 10, 'transform_created');

      // Mark as qualifying action
      return await this.markQualifyingAction(userId, 'transform');
    } catch (error) {
      logger.error('Error handling transform creation:', error);
      throw error;
    }
  }

  // Handle battle action
  async handleBattleAction(userId, action) {
    try {
      // Grant XP based on action
      const xpAmount = action === 'win' ? 50 : 20;
      const reason = action === 'win' ? 'battle_win' : 'battle_loss';
      
      await progressionService.grantXp(userId, xpAmount, reason);

      // Mark as qualifying action
      return await this.markQualifyingAction(userId, 'battle_action');
    } catch (error) {
      logger.error('Error handling battle action:', error);
      throw error;
    }
  }

  // Handle daily login
  async handleDailyLogin(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check and reset daily counters
      await user.checkDailyReset();

      // Check if already checked in today
      if (user.daily.loginChecked) {
        return {
          success: false,
          message: 'Already checked in today'
        };
      }

      // Mark as checked in
      await User.findByIdAndUpdate(userId, {
        $set: { 'daily.loginChecked': true }
      });

      // Grant XP
      await progressionService.grantXp(userId, 5, 'daily_login');

      return {
        success: true,
        message: 'Daily login bonus awarded'
      };
    } catch (error) {
      logger.error('Error handling daily login:', error);
      throw error;
    }
  }
}

// Create singleton instance
const streakService = new StreakService();

module.exports = streakService;
