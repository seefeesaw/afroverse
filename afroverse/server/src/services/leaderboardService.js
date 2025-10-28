const UserAggregate = require('../models/UserAggregate');
const TribeAggregate = require('../models/TribeAggregate');
const WeeklyChampions = require('../models/WeeklyChampions');
const { redisClient } = require('../config/redis');
const socketService = require('../sockets/socketService');
const { logger } = require('../utils/logger');

class LeaderboardService {
  constructor() {
    this.redisKeys = {
      usersWeekly: 'lb:users:weekly',
      usersAllTime: 'lb:users:all',
      tribesWeekly: 'lb:tribes:weekly',
      tribesAllTime: 'lb:tribes:all',
      usersWeeklyCountry: (country) => `lb:users:weekly:country:${country}`,
      usersAllTimeCountry: (country) => `lb:users:all:country:${country}`
    };
    
    this.points = {
      battle_win: 100,
      battle_loss: 25,
      vote: 1,
      login_bonus: 10,
      streak_bonus: 5,
      daily_participation: 10
    };
  }

  // Award points to user leaderboard
  async awardUserPoints({ userId, points, reason, ref = {} }) {
    try {
      if (!userId || !points) {
        throw new Error('Missing required parameters for awardUserPoints');
      }

      // Update Redis ZSETs
      await Promise.all([
        redisClient.zincrby(this.redisKeys.usersWeekly, points, userId),
        redisClient.zincrby(this.redisKeys.usersAllTime, points, userId)
      ]);

      // Update MongoDB aggregate
      const userAgg = await UserAggregate.findById(userId);
      if (userAgg) {
        await userAgg.awardPoints(points, 'weekly');
      }

      // Update country-specific leaderboard if country is available
      if (userAgg && userAgg.country) {
        await redisClient.zincrby(
          this.redisKeys.usersWeeklyCountry(userAgg.country), 
          points, 
          userId
        );
        await redisClient.zincrby(
          this.redisKeys.usersAllTimeCountry(userAgg.country), 
          points, 
          userId
        );
      }

      // Emit socket event for real-time updates
      const newWeeklyPoints = await redisClient.zscore(this.redisKeys.usersWeekly, userId);
      const newAllTimePoints = await redisClient.zscore(this.redisKeys.usersAllTime, userId);

      socketService.emitLeaderboardUpdate('users', 'weekly', {
        userId,
        newPoints: parseFloat(newWeeklyPoints),
        delta: points
      });

      socketService.emitLeaderboardUpdate('users', 'all', {
        userId,
        newPoints: parseFloat(newAllTimePoints),
        delta: points
      });

      logger.info(`Awarded ${points} points to user ${userId} for reason: ${reason}`);

      return {
        success: true,
        userId,
        points,
        newWeeklyPoints: parseFloat(newWeeklyPoints),
        newAllTimePoints: parseFloat(newAllTimePoints)
      };
    } catch (error) {
      logger.error('Error awarding user points:', error);
      throw error;
    }
  }

  // Award points to tribe leaderboard
  async awardTribePoints({ tribeId, points, reason, ref = {} }) {
    try {
      if (!tribeId || !points) {
        throw new Error('Missing required parameters for awardTribePoints');
      }

      // Update Redis ZSETs
      await Promise.all([
        redisClient.zincrby(this.redisKeys.tribesWeekly, points, tribeId),
        redisClient.zincrby(this.redisKeys.tribesAllTime, points, tribeId)
      ]);

      // Update MongoDB aggregate
      const tribeAgg = await TribeAggregate.findById(tribeId);
      if (tribeAgg) {
        await tribeAgg.awardPoints(points, 'weekly');
      }

      // Emit socket event for real-time updates
      const newWeeklyPoints = await redisClient.zscore(this.redisKeys.tribesWeekly, tribeId);
      const newAllTimePoints = await redisClient.zscore(this.redisKeys.tribesAllTime, tribeId);

      socketService.emitLeaderboardUpdate('tribes', 'weekly', {
        tribeId,
        newPoints: parseFloat(newWeeklyPoints),
        delta: points
      });

      socketService.emitLeaderboardUpdate('tribes', 'all', {
        tribeId,
        newPoints: parseFloat(newAllTimePoints),
        delta: points
      });

      logger.info(`Awarded ${points} points to tribe ${tribeId} for reason: ${reason}`);

      return {
        success: true,
        tribeId,
        points,
        newWeeklyPoints: parseFloat(newWeeklyPoints),
        newAllTimePoints: parseFloat(newAllTimePoints)
      };
    } catch (error) {
      logger.error('Error awarding tribe points:', error);
      throw error;
    }
  }

  // Get tribe leaderboard
  async getTribeLeaderboard(period = 'weekly', limit = 50, cursor = null) {
    try {
      const key = period === 'all' ? this.redisKeys.tribesAllTime : this.redisKeys.tribesWeekly;
      const startRank = cursor ? cursor.rank : 0;
      const endRank = startRank + limit - 1;

      // Get tribe IDs and scores from Redis
      const ids = await redisClient.zrevrange(key, startRank, endRank, 'WITHSCORES');
      const pairs = [];
      for (let i = 0; i < ids.length; i += 2) {
        pairs.push({ id: ids[i], points: Number(ids[i + 1]) });
      }

      if (pairs.length === 0) {
        return {
          period,
          items: [],
          nextCursor: null
        };
      }

      // Get tribe details from MongoDB
      const tribeIds = pairs.map(p => p.id);
      const tribes = await TribeAggregate.find({ _id: { $in: tribeIds } })
        .select('name displayName motto emblem members stats')
        .lean();

      const tribeMap = new Map(tribes.map(t => [t._id.toString(), t]));

      const items = pairs.map((pair, idx) => {
        const tribe = tribeMap.get(pair.id);
        return {
          rank: startRank + idx + 1,
          tribeId: pair.id,
          name: tribe?.name,
          displayName: tribe?.displayName,
          motto: tribe?.motto,
          emblem: tribe?.emblem,
          points: pair.points,
          members: tribe?.members || 0,
          stats: tribe?.stats
        };
      });

      const total = await redisClient.zcard(key);
      const nextCursor = endRank + 1 < total ? 
        Buffer.from(JSON.stringify({ rank: endRank + 1 })).toString('base64') : 
        null;

      return {
        period,
        items,
        nextCursor
      };
    } catch (error) {
      logger.error('Error getting tribe leaderboard:', error);
      throw error;
    }
  }

  // Get user leaderboard
  async getUserLeaderboard(period = 'weekly', limit = 50, cursor = null, country = null) {
    try {
      let key;
      if (country) {
        key = period === 'all' ? 
          this.redisKeys.usersAllTimeCountry(country) : 
          this.redisKeys.usersWeeklyCountry(country);
      } else {
        key = period === 'all' ? this.redisKeys.usersAllTime : this.redisKeys.usersWeekly;
      }

      const startRank = cursor ? cursor.rank : 0;
      const endRank = startRank + limit - 1;

      // Get user IDs and scores from Redis
      const ids = await redisClient.zrevrange(key, startRank, endRank, 'WITHSCORES');
      const pairs = [];
      for (let i = 0; i < ids.length; i += 2) {
        pairs.push({ id: ids[i], points: Number(ids[i + 1]) });
      }

      if (pairs.length === 0) {
        return {
          period,
          items: [],
          nextCursor: null
        };
      }

      // Get user details from MongoDB
      const userIds = pairs.map(p => p.id);
      const query = { _id: { $in: userIds } };
      if (country) {
        query.country = country;
      }

      const users = await UserAggregate.find(query)
        .select('username avatar tribe country streak stats')
        .lean();

      const userMap = new Map(users.map(u => [u._id.toString(), u]));

      const items = pairs.map((pair, idx) => {
        const user = userMap.get(pair.id);
        return {
          rank: startRank + idx + 1,
          userId: pair.id,
          username: user?.username,
          avatar: user?.avatar,
          tribe: user?.tribe,
          country: user?.country,
          points: pair.points,
          streak: user?.streak?.current || 0,
          stats: user?.stats
        };
      });

      const total = await redisClient.zcard(key);
      const nextCursor = endRank + 1 < total ? 
        Buffer.from(JSON.stringify({ rank: endRank + 1 })).toString('base64') : 
        null;

      return {
        period,
        items,
        nextCursor
      };
    } catch (error) {
      logger.error('Error getting user leaderboard:', error);
      throw error;
    }
  }

  // Get user's rank
  async getUserRank(userId, period = 'weekly', country = null) {
    try {
      let key;
      if (country) {
        key = period === 'all' ? 
          this.redisKeys.usersAllTimeCountry(country) : 
          this.redisKeys.usersWeeklyCountry(country);
      } else {
        key = period === 'all' ? this.redisKeys.usersAllTime : this.redisKeys.usersWeekly;
      }

      const rank = await redisClient.zrevrank(key, userId);
      const points = await redisClient.zscore(key, userId);

      if (rank === null || points === null) {
        return null;
      }

      return {
        rank: rank + 1,
        points: parseFloat(points),
        total: parseFloat(points)
      };
    } catch (error) {
      logger.error('Error getting user rank:', error);
      throw error;
    }
  }

  // Get tribe's rank
  async getTribeRank(tribeId, period = 'weekly') {
    try {
      const key = period === 'all' ? this.redisKeys.tribesAllTime : this.redisKeys.tribesWeekly;

      const rank = await redisClient.zrevrank(key, tribeId);
      const points = await redisClient.zscore(key, tribeId);

      if (rank === null || points === null) {
        return null;
      }

      return {
        rank: rank + 1,
        points: parseFloat(points),
        total: parseFloat(points)
      };
    } catch (error) {
      logger.error('Error getting tribe rank:', error);
      throw error;
    }
  }

  // Weekly reset
  async weeklyReset() {
    try {
      logger.info('Starting weekly leaderboard reset');

      // Create snapshot before reset
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      await WeeklyChampions.createSnapshot(weekStart, weekEnd);

      // Reset weekly Redis ZSETs
      await Promise.all([
        redisClient.del(this.redisKeys.usersWeekly),
        redisClient.del(this.redisKeys.tribesWeekly)
      ]);

      // Reset weekly points in MongoDB aggregates
      await Promise.all([
        UserAggregate.updateMany({}, { 
          $set: { 
            'weekly.points': 0, 
            'weekly.rank': null, 
            'weekly.updatedAt': new Date() 
          } 
        }),
        TribeAggregate.updateMany({}, { 
          $set: { 
            'weekly.points': 0, 
            'weekly.rank': null, 
            'weekly.updatedAt': new Date() 
          } 
        })
      ]);

      // Emit socket event
      socketService.emit('lb_reset', {
        lastResetAt: new Date().toISOString()
      });

      logger.info('Weekly leaderboard reset completed');

      return {
        success: true,
        resetAt: new Date(),
        weekStart,
        weekEnd
      };
    } catch (error) {
      logger.error('Error in weekly reset:', error);
      throw error;
    }
  }

  // Reconciliation job
  async reconcile() {
    try {
      logger.info('Starting leaderboard reconciliation');

      // This would typically reconcile from event logs
      // For now, we'll just log that reconciliation ran
      logger.info('Leaderboard reconciliation completed');

      return {
        success: true,
        reconciledAt: new Date()
      };
    } catch (error) {
      logger.error('Error in reconciliation:', error);
      throw error;
    }
  }

  // Get weekly champions
  async getWeeklyChampions(weekStart) {
    try {
      return await WeeklyChampions.getWeeklyChampions(weekStart);
    } catch (error) {
      logger.error('Error getting weekly champions:', error);
      throw error;
    }
  }

  // Get recent champions
  async getRecentChampions(limit = 4) {
    try {
      return await WeeklyChampions.getRecentChampions(limit);
    } catch (error) {
      logger.error('Error getting recent champions:', error);
      throw error;
    }
  }

  // Create or update user aggregate
  async createOrUpdateUserAggregate(userId, userData) {
    try {
      return await UserAggregate.createOrUpdate(userId, userData);
    } catch (error) {
      logger.error('Error creating/updating user aggregate:', error);
      throw error;
    }
  }

  // Create or update tribe aggregate
  async createOrUpdateTribeAggregate(tribeId, tribeData) {
    try {
      return await TribeAggregate.createOrUpdate(tribeId, tribeData);
    } catch (error) {
      logger.error('Error creating/updating tribe aggregate:', error);
      throw error;
    }
  }
}

// Create singleton instance
const leaderboardService = new LeaderboardService();

module.exports = leaderboardService;
