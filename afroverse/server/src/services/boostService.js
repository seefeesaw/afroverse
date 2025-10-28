const Boost = require('../models/Boost');
const Video = require('../models/Video');
const Tribe = require('../models/Tribe');
const Wallet = require('../models/Wallet');
const { redisClient } = require('../config/redis');
const { logger } = require('../utils/logger');
const { io } = require('../sockets/socketService');

class BoostService {
  constructor() {
    this.boostTiers = {
      bronze: { multiplier: 2, duration: 60 * 60 * 1000, cost: 20, price: 0.99 },
      silver: { multiplier: 4, duration: 6 * 60 * 60 * 1000, cost: 50, price: 2.49 },
      gold: { multiplier: 8, duration: 24 * 60 * 60 * 1000, cost: 100, price: 4.99 },
    };

    this.tribeBoostTiers = {
      rally: { multiplier: 2, duration: 60 * 60 * 1000, cost: 60, price: 2.99 },
      warDrums: { multiplier: 4, duration: 6 * 60 * 60 * 1000, cost: 150, price: 7.99 },
      fullWar: { multiplier: 6, duration: 24 * 60 * 60 * 1000, cost: 380, price: 18.99 },
    };
  }

  /**
   * Boost a video
   * @param {string} userId - User ID
   * @param {string} videoId - Video ID
   * @param {string} tier - Boost tier (bronze, silver, gold)
   * @returns {Promise<Object>} Boost result
   */
  async boostVideo(userId, videoId, tier) {
    try {
      // Verify video exists and belongs to user
      const video = await Video.findById(videoId);
      if (!video) {
        throw new Error('Video not found');
      }

      if (video.ownerId.toString() !== userId.toString()) {
        throw new Error('Unauthorized to boost this video');
      }

      // Check if user has enough coins
      const wallet = await Wallet.getOrCreate(userId);
      const boostConfig = this.boostTiers[tier];
      
      if (!boostConfig) {
        throw new Error(`Invalid boost tier: ${tier}`);
      }

      if (wallet.balance < boostConfig.cost) {
        throw new Error('Insufficient coins');
      }

      // Check if video already has an active boost
      if (video.boost.status !== 'none' && video.boost.expiresAt > new Date()) {
        throw new Error('Video already has an active boost');
      }

      // Create boost
      const boost = await Boost.createBoost({
        userId,
        videoId,
        type: 'video',
        tier,
      });

      // Deduct coins
      await wallet.spendCoins(boostConfig.cost, `Boost video: ${tier}`);

      // Update video boost status
      video.boost.status = tier;
      video.boost.multiplier = boostConfig.multiplier;
      video.boost.expiresAt = new Date(Date.now() + boostConfig.duration);
      await video.save();

      // Broadcast boost
      io.emit('boost:activated', { videoId, tier, expiresAt: video.boost.expiresAt });

      // Track boost start
      boost.stats.viewsBefore = video.stats.views;
      await boost.save();

      return {
        success: true,
        boost,
        video: video.toObject(),
      };
    } catch (error) {
      logger.error('Error boosting video:', error);
      throw error;
    }
  }

  /**
   * Boost a tribe
   * @param {string} userId - User ID (chief/elder)
   * @param {string} tribeId - Tribe ID
   * @param {string} tier - Boost tier
   * @returns {Promise<Object>} Boost result
   */
  async boostTribe(userId, tribeId, tier) {
    try {
      // Verify user is chief or elder
      const tribe = await Tribe.findById(tribeId);
      if (!tribe) {
        throw new Error('Tribe not found');
      }

      const isChief = tribe.chiefId && tribe.chiefId.toString() === userId.toString();
      const isElder = tribe.elders && tribe.elders.some(e => e.toString() === userId.toString());
      
      if (!isChief && !isElder) {
        throw new Error('Only chiefs and elders can boost tribes');
      }

      // Check if user has enough coins
      const wallet = await Wallet.getOrCreate(userId);
      const boostConfig = this.tribeBoostTiers[tier];
      
      if (!boostConfig) {
        throw new Error(`Invalid tribe boost tier: ${tier}`);
      }

      if (wallet.balance < boostConfig.cost) {
        throw new Error('Insufficient coins');
      }

      // Check if tribe already has an active boost
      if (tribe.boost && tribe.boost.multiplier > 1 && tribe.boost.expiresAt > new Date()) {
        throw new Error('Tribe already has an active boost');
      }

      // Create boost
      const boost = await Boost.createBoost({
        userId,
        tribeId,
        type: 'tribe',
        tier,
      });

      // Deduct coins
      await wallet.spendCoins(boostConfig.cost, `Boost tribe: ${tier}`);

      // Update tribe boost
      if (!tribe.boost) {
        tribe.boost = {
          multiplier: 1,
          expiresAt: null,
        };
      }
      
      tribe.boost.multiplier = boostConfig.multiplier;
      tribe.boost.expiresAt = new Date(Date.now() + boostConfig.duration);
      await tribe.save();

      // Broadcast to tribe
      io.to(`tribe:${tribeId}`).emit('tribe:boosted', {
        tier,
        multiplier: boostConfig.multiplier,
        expiresAt: tribe.boost.expiresAt,
      });

      // Notify tribe members
      const notificationService = require('./notificationService');
      // TODO: Send push notifications to tribe members

      return {
        success: true,
        boost,
        tribe: tribe.toObject(),
      };
    } catch (error) {
      logger.error('Error boosting tribe:', error);
      throw error;
    }
  }

  /**
   * Get active boost for video
   * @param {string} videoId - Video ID
   * @returns {Promise<Object>} Active boost or null
   */
  async getVideoBoost(videoId) {
    try {
      const boosts = await Boost.getActiveVideoBoosts(videoId);
      return boosts.length > 0 ? boosts[0] : null;
    } catch (error) {
      logger.error('Error getting video boost:', error);
      throw error;
    }
  }

  /**
   * Get active boost for tribe
   * @param {string} tribeId - Tribe ID
   * @returns {Promise<Object>} Active boost or null
   */
  async getTribeBoost(tribeId) {
    try {
      const boosts = await Boost.getActiveTribeBoosts(tribeId);
      return boosts.length > 0 ? boosts[0] : null;
    } catch (error) {
      logger.error('Error getting tribe boost:', error);
      throw error;
    }
  }

  /**
   * Get boost multiplier for video (including tribe boost)
   * @param {string} videoId - Video ID
   * @returns {Promise<number>} Total multiplier
   */
  async getVideoMultiplier(videoId) {
    try {
      const video = await Video.findById(videoId).select('boost tribe');
      if (!video) return 1;

      let multiplier = video.boost.status !== 'none' ? video.boost.multiplier : 1;

      // Add tribe boost if active
      if (video.tribe) {
        const tribe = await Tribe.findById(video.tribe).select('boost');
        if (tribe && tribe.boost && tribe.boost.expiresAt > new Date()) {
          multiplier *= tribe.boost.multiplier;
        }
      }

      return multiplier;
    } catch (error) {
      logger.error('Error getting video multiplier:', error);
      return 1;
    }
  }

  /**
   * Update boost stats when video views increase
   * @param {string} videoId - Video ID
   * @param {number} newViews - New view count
   * @returns {Promise<void>}
   */
  async updateBoostStats(videoId, newViews) {
    try {
      const boosts = await Boost.find({
        videoId,
        isActive: true,
        type: 'video',
      });

      for (const boost of boosts) {
        if (boost.stats.viewsAfter < newViews) {
          boost.stats.viewsAfter = newViews;
          boost.stats.viewsIncrease = newViews - boost.stats.viewsBefore;
          await boost.save();
        }
      }
    } catch (error) {
      logger.error('Error updating boost stats:', error);
    }
  }

  /**
   * Process expired boosts
   * @returns {Promise<number>} Number of boosts deactivated
   */
  async processExpiredBoosts() {
    try {
      const expiredBoosts = await Boost.find({
        isActive: true,
        expiresAt: { $lte: new Date() },
      });

      let count = 0;
      for (const boost of expiredBoosts) {
        await boost.deactivate();

        // Update video/tribe
        if (boost.type === 'video' && boost.videoId) {
          const video = await Video.findById(boost.videoId);
          if (video) {
            video.boost.status = 'none';
            video.boost.multiplier = 1;
            video.boost.expiresAt = null;
            await video.save();
          }
        } else if (boost.type === 'tribe' && boost.tribeId) {
          const tribe = await Tribe.findById(boost.tribeId);
          if (tribe && tribe.boost) {
            tribe.boost.multiplier = 1;
            tribe.boost.expiresAt = null;
            await tribe.save();
          }
        }

        count++;
      }

      logger.info(`Processed ${count} expired boosts`);
      return count;
    } catch (error) {
      logger.error('Error processing expired boosts:', error);
      throw error;
    }
  }

  /**
   * Get boost tiers
   * @returns {Object} Boost tiers
   */
  getBoostTiers() {
    return this.boostTiers;
  }

  /**
   * Get tribe boost tiers
   * @returns {Object} Tribe boost tiers
   */
  getTribeBoostTiers() {
    return this.tribeBoostTiers;
  }
}

module.exports = new BoostService();
