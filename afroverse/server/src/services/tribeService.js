const Tribe = require('../models/Tribe');
const TribePointEvent = require('../models/TribePointEvent');
const User = require('../models/User');
const { redisClient } = require('../config/redis');
const socketService = require('../sockets/socketService');
const { logger } = require('../utils/logger');

class TribeService {
  constructor() {
    this.dailyVoteCap = 20;
    this.points = {
      battle_win: 100,
      battle_loss: 25,
      vote: 1,
      login_bonus: 10,
      streak_bonus: 5,
      daily_participation: 10
    };
  }

  // Award points to a tribe
  async awardPoints({ tribeId, userId, reason, points, ref = {} }) {
    try {
      if (!tribeId || !userId || !reason) {
        throw new Error('Missing required parameters for awardPoints');
      }

      // Record the event
      await TribePointEvent.create({
        tribeId,
        userId,
        reason,
        points,
        ref,
        createdAt: new Date()
      });

      // Atomically increment tribe stats
      const tribe = await Tribe.findByIdAndUpdate(
        tribeId,
        { 
          $inc: { 
            'stats.weeklyPoints': points, 
            'stats.totalPoints': points 
          } 
        },
        { new: true, projection: { 'stats.weeklyPoints': 1 } }
      ).lean();

      if (!tribe) {
        throw new Error('Tribe not found');
      }

      // Update Redis delta for socket broadcasting
      await redisClient.incrby(`tribe:delta:${tribeId}`, points);

      // Emit socket event
      socketService.emitTribeUpdate(tribeId, {
        type: 'points_delta',
        delta: points,
        weeklyPoints: tribe.stats.weeklyPoints
      });

      logger.info(`Awarded ${points} points to tribe ${tribeId} for reason: ${reason}`);

      return {
        success: true,
        tribeId,
        points,
        newWeeklyPoints: tribe.stats.weeklyPoints
      };
    } catch (error) {
      logger.error('Error awarding tribe points:', error);
      throw error;
    }
  }

  // Check and enforce voting cap
  async checkVoteCap(userId) {
    try {
      const now = new Date();
      const day = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
      const key = `tribe:voteCap:${userId}:${day}`;

      const currentCount = await redisClient.get(key);
      const count = parseInt(currentCount) || 0;

      if (count >= this.dailyVoteCap) {
        return {
          allowed: false,
          remaining: 0,
          total: this.dailyVoteCap
        };
      }

      // Increment counter
      await redisClient.incr(key);
      await redisClient.expire(key, 86400); // 24 hours

      return {
        allowed: true,
        remaining: this.dailyVoteCap - count - 1,
        total: this.dailyVoteCap
      };
    } catch (error) {
      logger.error('Error checking vote cap:', error);
      throw error;
    }
  }

  // Award battle win points
  async awardBattleWin({ tribeId, userId, battleId }) {
    return this.awardPoints({
      tribeId,
      userId,
      reason: 'battle_win',
      points: this.points.battle_win,
      ref: { battleId }
    });
  }

  // Award battle loss points
  async awardBattleLoss({ tribeId, userId, battleId }) {
    return this.awardPoints({
      tribeId,
      userId,
      reason: 'battle_loss',
      points: this.points.battle_loss,
      ref: { battleId }
    });
  }

  // Award vote points
  async awardVotePoints({ tribeId, userId }) {
    const capCheck = await this.checkVoteCap(userId);
    
    if (!capCheck.allowed) {
      return {
        success: false,
        message: 'Daily vote cap reached'
      };
    }

    return this.awardPoints({
      tribeId,
      userId,
      reason: 'vote',
      points: this.points.vote,
      ref: {}
    });
  }

  // Award login bonus
  async awardLoginBonus({ tribeId, userId }) {
    try {
      const now = new Date();
      const day = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
      const idempotencyKey = `tribe:loginBonus:${userId}:${day}`;

      // Check if already awarded today
      const alreadyAwarded = await redisClient.get(idempotencyKey);
      if (alreadyAwarded) {
        return {
          success: false,
          message: 'Already awarded today'
        };
      }

      // Award points
      const result = await this.awardPoints({
        tribeId,
        userId,
        reason: 'login_bonus',
        points: this.points.login_bonus,
        ref: {}
      });

      // Set idempotency key
      await redisClient.setEx(idempotencyKey, 86400, '1'); // 24 hours

      return result;
    } catch (error) {
      logger.error('Error awarding login bonus:', error);
      throw error;
    }
  }

  // Award streak bonus
  async awardStreakBonus({ tribeId, userId, streakDays }) {
    const points = this.points.streak_bonus * streakDays;
    return this.awardPoints({
      tribeId,
      userId,
      reason: 'streak_bonus',
      points,
      ref: {}
    });
  }

  // Join tribe
  async joinTribe(tribeId, userId) {
    try {
      // Get user
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check if user already has a tribe
      if (user.tribe && user.tribe.id) {
        const canSwitchAt = user.tribe.canSwitchAt;
        if (canSwitchAt && new Date() < canSwitchAt) {
          throw new Error('Cannot switch tribe yet');
        }
      }

      // Get tribe
      const tribe = await Tribe.findById(tribeId);
      if (!tribe) {
        throw new Error('Tribe not found');
      }

      // Leave old tribe if exists
      if (user.tribe && user.tribe.id) {
        await this.leaveTribe(user.tribe.id);
      }

      // Join new tribe
      await tribe.incrementMembers();

      // Update user
      const canSwitchAt = new Date();
      canSwitchAt.setDate(canSwitchAt.getDate() + 30); // 30 days from now

      user.tribe = {
        id: tribe._id,
        name: tribe.name,
        joinedAt: new Date(),
        canSwitchAt
      };

      await user.save();

      // Emit analytics event
      logger.info(`User ${userId} joined tribe ${tribeId}`);

      return {
        success: true,
        tribe: user.tribe
      };
    } catch (error) {
      logger.error('Error joining tribe:', error);
      throw error;
    }
  }

  // Leave tribe
  async leaveTribe(tribeId) {
    try {
      const tribe = await Tribe.findById(tribeId);
      if (!tribe) {
        return;
      }

      await tribe.decrementMembers();

      logger.info(`Tribe ${tribeId} member count decremented`);
    } catch (error) {
      logger.error('Error leaving tribe:', error);
      throw error;
    }
  }

  // Switch tribe
  async switchTribe(tribeId, userId) {
    try {
      // This is essentially the same as join, but with additional checks
      return this.joinTribe(tribeId, userId);
    } catch (error) {
      logger.error('Error switching tribe:', error);
      throw error;
    }
  }

  // Get user's tribe snapshot
  async getUserTribeSnapshot(userId) {
    try {
      const user = await User.findById(userId).populate('tribe.id');
      if (!user || !user.tribe || !user.tribe.id) {
        return null;
      }

      const tribe = user.tribe.id;

      return {
        tribe: {
          id: tribe._id,
          name: tribe.name,
          displayName: tribe.displayName,
          weeklyRank: tribe.rankings.weeklyRank,
          weeklyPoints: tribe.stats.weeklyPoints,
          members: tribe.stats.members
        },
        nudge: this.generateNudge(tribe)
      };
    } catch (error) {
      logger.error('Error getting user tribe snapshot:', error);
      return null;
    }
  }

  // Generate motivational nudge
  generateNudge(tribe) {
    const rank = tribe.rankings.weeklyRank;
    const points = tribe.stats.weeklyPoints;

    if (!rank) {
      return `${tribe.displayName} needs you! Win your first battle to earn 100 points.`;
    }

    if (rank === 1) {
      return `🏆 ${tribe.displayName} is #1! Keep winning to maintain the crown.`;
    }

    return `Win one battle today to push ${tribe.displayName} closer to #${rank - 1}.`;
  }

  // Weekly reset
  async weeklyReset() {
    try {
      logger.info('Starting weekly tribe reset');

      // Get all tribes
      const tribes = await Tribe.find().lean();

      // Reset weekly points for all tribes
      for (const tribe of tribes) {
        await Tribe.findByIdAndUpdate(tribe._id, {
          'stats.weeklyPoints': 0,
          'rankings.weeklyRank': null,
          'rankings.lastResetAt': new Date()
        });
      }

      // Emit socket event
      socketService.emitWeeklyReset({
        lastResetAt: new Date().toISOString()
      });

      logger.info('Weekly tribe reset completed');

      return {
        success: true,
        resetAt: new Date(),
        tribesReset: tribes.length
      };
    } catch (error) {
      logger.error('Error in weekly reset:', error);
      throw error;
    }
  }

  // Get leaderboard
  async getLeaderboard(period = 'week', limit = 50) {
    try {
      if (period === 'week') {
        return Tribe.getWeeklyLeaderboard(limit);
      } else {
        return Tribe.getAllTimeLeaderboard(limit);
      }
    } catch (error) {
      logger.error('Error getting leaderboard:', error);
      throw error;
    }
  }

  // Seed initial tribes
  async seedTribes() {
    try {
      await Tribe.seedTribes();
      logger.info('Tribes seeded successfully');
    } catch (error) {
      logger.error('Error seeding tribes:', error);
      throw error;
    }
  }
}

// Create singleton instance
const tribeService = new TribeService();

module.exports = tribeService;
