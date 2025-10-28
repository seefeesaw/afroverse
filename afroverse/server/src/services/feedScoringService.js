const { redisClient } = require('../config/redis');
const Battle = require('../models/Battle');
const { logger } = require('../utils/logger');

class FeedScoringService {
  constructor() {
    this.weights = {
      recency: 0.45,
      velocity: 0.35,
      boost: 0.15,
      tribeAffinity: 0.05,
      freshnessPenalty: -0.05
    };
    
    this.regions = ['global', 'za', 'ng', 'ke', 'gh']; // Add more as needed
  }

  // Calculate recency score (0..1)
  calculateRecency(startedAt) {
    const now = Date.now();
    const hours = Math.max((now - startedAt.getTime()) / (1000 * 60 * 60), 0.01);
    return 1 / (1 + hours);
  }

  // Get velocity score from Redis
  async getVelocity(battleId) {
    try {
      const velocity = await redisClient.get(`vel:${battleId}`);
      return parseFloat(velocity) || 0;
    } catch (error) {
      logger.error('Error getting velocity:', error);
      return 0;
    }
  }

  // Get boost score from Redis
  async getBoost(battleId, region) {
    try {
      const boost = await redisClient.zscore(`boosts:${region}`, battleId);
      return boost ? 0.6 : 0; // Boost adds 0.6 to score
    } catch (error) {
      logger.error('Error getting boost:', error);
      return 0;
    }
  }

  // Calculate tribe affinity (optional MVP)
  calculateTribeAffinity(battle, userTribe) {
    if (!userTribe) return 0;
    
    const challengerTribe = battle.challenger?.tribe;
    const defenderTribe = battle.defender?.tribe;
    
    if (challengerTribe === userTribe || defenderTribe === userTribe) {
      return 0.1;
    }
    
    return 0;
  }

  // Calculate freshness penalty
  calculateFreshnessPenalty(startedAt) {
    const now = Date.now();
    const hours = (now - startedAt.getTime()) / (1000 * 60 * 60);
    return hours > 18 ? -0.1 : 0;
  }

  // Calculate total score for a battle
  async calculateScore(battle, region, userTribe = null) {
    try {
      const recency = this.calculateRecency(battle.status.timeline.started);
      const velocity = await this.getVelocity(battle._id);
      const boost = await this.getBoost(battle._id, region);
      const tribeAffinity = this.calculateTribeAffinity(battle, userTribe);
      const freshnessPenalty = this.calculateFreshnessPenalty(battle.status.timeline.started);

      const score = 
        this.weights.recency * recency +
        this.weights.velocity * velocity +
        this.weights.boost * boost +
        this.weights.tribeAffinity * tribeAffinity +
        this.weights.freshnessPenalty * freshnessPenalty;

      return Math.max(0, score); // Ensure non-negative scores
    } catch (error) {
      logger.error('Error calculating score:', error);
      return 0;
    }
  }

  // Update velocity for a battle (called on each vote)
  async updateVelocity(battleId) {
    try {
      const key = `vel:${battleId}`;
      const currentVelocity = await redisClient.get(key) || 0;
      
      // Simple EMA: new_velocity = 0.8 * old_velocity + 0.2 * current_votes_per_minute
      const currentMinuteVotes = 1; // This vote
      const newVelocity = 0.8 * parseFloat(currentVelocity) + 0.2 * currentMinuteVotes;
      
      await redisClient.setEx(key, 3600, newVelocity.toString()); // 1 hour TTL
      
      return newVelocity;
    } catch (error) {
      logger.error('Error updating velocity:', error);
      return 0;
    }
  }

  // Recompute scores for top battles in a region
  async recomputeScores(region = 'global', limit = 2000) {
    try {
      logger.info(`Recomputing scores for region: ${region}`);
      
      // Get active battles from MongoDB
      const activeBattles = await Battle.find({
        'status.current': 'active',
        'status.timeline.started': { $exists: true }
      })
      .select('_id challenger defender status.timeline.started')
      .limit(limit)
      .lean();

      const scores = [];
      
      for (const battle of activeBattles) {
        const score = await this.calculateScore(battle, region);
        scores.push({ battleId: battle._id.toString(), score });
      }

      // Update Redis ZSET
      const key = `feed:active:${region}`;
      
      if (scores.length > 0) {
        const args = [];
        scores.forEach(({ battleId, score }) => {
          args.push(score, battleId);
        });
        
        await redisClient.zadd(key, ...args);
        
        // Keep only top 1000 battles in the set
        await redisClient.zremrangebyrank(key, 0, -1001);
      }

      logger.info(`Updated ${scores.length} battle scores for region: ${region}`);
      
      return {
        success: true,
        updated: scores.length,
        region
      };
    } catch (error) {
      logger.error('Error recomputing scores:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get ranked battles from Redis
  async getRankedBattles(region = 'global', start = 0, limit = 10) {
    try {
      const key = `feed:active:${region}`;
      const battleIds = await redisClient.zrevrange(key, start, start + limit - 1);
      
      if (battleIds.length === 0) {
        return [];
      }

      // Get battle details from MongoDB
      const battles = await Battle.find({
        _id: { $in: battleIds }
      })
      .select('shortCode status votes challenger defender share engagement')
      .lean();

      // Sort by Redis order
      const orderedBattles = battleIds.map(id => 
        battles.find(battle => battle._id.toString() === id)
      ).filter(Boolean);

      return orderedBattles;
    } catch (error) {
      logger.error('Error getting ranked battles:', error);
      return [];
    }
  }

  // Add boost to a battle
  async addBoost(battleId, region, durationHours = 2) {
    try {
      const key = `boosts:${region}`;
      const expiresAt = Date.now() + (durationHours * 60 * 60 * 1000);
      
      await redisClient.zadd(key, expiresAt, battleId);
      
      // Set TTL for the boost
      await redisClient.expire(key, durationHours * 60 * 60);
      
      logger.info(`Added boost for battle ${battleId} in region ${region}`);
      
      return {
        success: true,
        expiresAt: new Date(expiresAt)
      };
    } catch (error) {
      logger.error('Error adding boost:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Remove expired boosts
  async removeExpiredBoosts(region = 'global') {
    try {
      const key = `boosts:${region}`;
      const now = Date.now();
      
      // Remove boosts that have expired
      await redisClient.zremrangebyscore(key, 0, now);
      
      logger.info(`Removed expired boosts for region: ${region}`);
      
      return {
        success: true,
        region
      };
    } catch (error) {
      logger.error('Error removing expired boosts:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get battle score
  async getBattleScore(battleId, region = 'global') {
    try {
      const key = `feed:active:${region}`;
      const score = await redisClient.zscore(key, battleId);
      return score ? parseFloat(score) : 0;
    } catch (error) {
      logger.error('Error getting battle score:', error);
      return 0;
    }
  }

  // Get battle rank
  async getBattleRank(battleId, region = 'global') {
    try {
      const key = `feed:active:${region}`;
      const rank = await redisClient.zrevrank(key, battleId);
      return rank !== null ? rank + 1 : null; // Convert to 1-based ranking
    } catch (error) {
      logger.error('Error getting battle rank:', error);
      return null;
    }
  }
}

// Create singleton instance
const feedScoringService = new FeedScoringService();

module.exports = feedScoringService;
