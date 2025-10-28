const Video = require('../models/Video');
const FeedImpression = require('../models/FeedImpression');
const RankScore = require('../models/RankScore');
const User = require('../models/User');
const Follow = require('../models/Follow');
const Battle = require('../models/Battle');
const { redisClient } = require('../config/redis');
const { logger } = require('../utils/logger');

class FeedService {
  constructor() {
    this.rankingWeights = {
      videoCompletionRate: 0.30,
      avgWatchTime: 0.20,
      replayRate: 0.10,
      shareRate: 0.15,
      voteRate: 0.10,
      followRate: 0.05,
      creatorQualityScore: 0.05,
      freshnessScore: 0.05,
    };
    
    this.diversityRules = {
      maxSameCreator: 2,
      maxSameCreatorWindow: 10,
      tribeItemFrequency: 5,
      explorationRatio: 0.20,
    };
  }

  /**
   * Generate personalized feed for user
   * @param {string} userId - User ID
   * @param {string} tab - Feed tab (foryou, following, tribe, battles)
   * @param {string} cursor - Pagination cursor
   * @param {number} limit - Number of videos to return
   * @param {string} region - User region
   * @returns {Promise<Object>} Feed data
   */
  async generateFeed(userId, tab = 'foryou', cursor = null, limit = 10, region = 'ZA') {
    try {
      const cacheKey = `feed:${userId}:${tab}:${cursor || 'initial'}`;
      
      // Check cache first
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      let videos = [];
      
      switch (tab) {
        case 'foryou':
          videos = await this.generateForYouFeed(userId, cursor, limit, region);
          break;
        case 'following':
          videos = await this.generateFollowingFeed(userId, cursor, limit, region);
          break;
        case 'tribe':
          videos = await this.generateTribeFeed(userId, cursor, limit, region);
          break;
        case 'battles':
          videos = await this.generateBattlesFeed(userId, cursor, limit, region);
          break;
        default:
          throw new Error(`Invalid feed tab: ${tab}`);
      }

      // Apply diversity rules
      videos = await this.applyDiversityRules(videos, userId, tab);

      // Generate next cursor
      const nextCursor = videos.length === limit ? 
        `${videos[videos.length - 1]._id}:${videos[videos.length - 1].ranking[`${tab}Score`]}` : 
        null;

      const feedData = {
        videos: videos.map(video => this.formatVideoForFeed(video)),
        nextCursor,
        tab,
        region,
        generatedAt: new Date().toISOString(),
      };

      // Cache for 2-5 minutes
      await redisClient.setEx(cacheKey, 300, JSON.stringify(feedData));

      return feedData;
    } catch (error) {
      logger.error('Error generating feed:', error);
      throw error;
    }
  }

  /**
   * Generate For You feed with personalized ranking
   */
  async generateForYouFeed(userId, cursor, limit, region) {
    const user = await User.findById(userId).select('tribe region preferences');
    if (!user) throw new Error('User not found');

    // Get candidate pools
    const [freshVideos, trendingVideos, tribeVideos, explorationVideos] = await Promise.all([
      this.getFreshVideos(region, Math.ceil(limit * 0.3)),
      this.getTrendingVideos(region, Math.ceil(limit * 0.3)),
      this.getTribeVideos(user.tribe.id, region, Math.ceil(limit * 0.2)),
      this.getExplorationVideos(userId, region, Math.ceil(limit * 0.2)),
    ]);

    // Combine and deduplicate
    const allVideos = [...freshVideos, ...trendingVideos, ...tribeVideos, ...explorationVideos];
    const uniqueVideos = this.deduplicateVideos(allVideos);

    // Rank videos
    const rankedVideos = await this.rankVideos(uniqueVideos, userId, 'foryou');

    // Apply cursor pagination
    if (cursor) {
      const [cursorId, cursorScore] = cursor.split(':');
      const cursorIndex = rankedVideos.findIndex(video => 
        video._id.toString() === cursorId && video.ranking.foryouScore <= parseFloat(cursorScore)
      );
      if (cursorIndex !== -1) {
        rankedVideos.splice(0, cursorIndex + 1);
      }
    }

    return rankedVideos.slice(0, limit);
  }

  /**
   * Generate Following feed
   */
  async generateFollowingFeed(userId, cursor, limit, region) {
    const following = await Follow.find({ followerId: userId })
      .select('followingId')
      .limit(100);

    if (following.length === 0) {
      return this.getFallbackVideos(region, limit);
    }

    const followingIds = following.map(f => f.followingId);
    
    const videos = await Video.find({
      ownerId: { $in: followingIds },
      'safety.moderation': 'approved',
      'metadata.isPublic': true,
      region,
    })
      .sort({ createdAt: -1 })
      .limit(limit * 2)
      .populate('ownerId', 'username displayName avatar tribe')
      .populate('sourceTransformId', 'style')
      .populate('battleId', 'shortCode status');

    // Rank by following score
    const rankedVideos = await this.rankVideos(videos, userId, 'following');

    // Apply cursor pagination
    if (cursor) {
      const [cursorId, cursorScore] = cursor.split(':');
      const cursorIndex = rankedVideos.findIndex(video => 
        video._id.toString() === cursorId && video.ranking.followingScore <= parseFloat(cursorScore)
      );
      if (cursorIndex !== -1) {
        rankedVideos.splice(0, cursorIndex + 1);
      }
    }

    return rankedVideos.slice(0, limit);
  }

  /**
   * Generate Tribe feed
   */
  async generateTribeFeed(userId, cursor, limit, region) {
    const user = await User.findById(userId).select('tribe');
    if (!user) throw new Error('User not found');

    const videos = await Video.find({
      tribe: user.tribe.id,
      'safety.moderation': 'approved',
      'metadata.isPublic': true,
      region,
    })
      .sort({ createdAt: -1 })
      .limit(limit * 2)
      .populate('ownerId', 'username displayName avatar tribe')
      .populate('sourceTransformId', 'style')
      .populate('battleId', 'shortCode status');

    // Rank by tribe score
    const rankedVideos = await this.rankVideos(videos, userId, 'tribe');

    // Apply cursor pagination
    if (cursor) {
      const [cursorId, cursorScore] = cursor.split(':');
      const cursorIndex = rankedVideos.findIndex(video => 
        video._id.toString() === cursorId && video.ranking.tribeScore <= parseFloat(cursorScore)
      );
      if (cursorIndex !== -1) {
        rankedVideos.splice(0, cursorIndex + 1);
      }
    }

    return rankedVideos.slice(0, limit);
  }

  /**
   * Generate Battles feed
   */
  async generateBattlesFeed(userId, cursor, limit, region) {
    const videos = await Video.find({
      type: 'battle_clip',
      'safety.moderation': 'approved',
      'metadata.isPublic': true,
      region,
    })
      .sort({ createdAt: -1 })
      .limit(limit * 2)
      .populate('ownerId', 'username displayName avatar tribe')
      .populate('sourceTransformId', 'style')
      .populate('battleId', 'shortCode status');

    // Filter for active battles only
    const activeBattleVideos = videos.filter(video => 
      video.battleId && video.battleId.status.current === 'active'
    );

    // Rank by battles score
    const rankedVideos = await this.rankVideos(activeBattleVideos, userId, 'battles');

    // Apply cursor pagination
    if (cursor) {
      const [cursorId, cursorScore] = cursor.split(':');
      const cursorIndex = rankedVideos.findIndex(video => 
        video._id.toString() === cursorId && video.ranking.battlesScore <= parseFloat(cursorScore)
      );
      if (cursorIndex !== -1) {
        rankedVideos.splice(0, cursorIndex + 1);
      }
    }

    return rankedVideos.slice(0, limit);
  }

  /**
   * Rank videos using TikTok-style algorithm
   */
  async rankVideos(videos, userId, tab) {
    const user = await User.findById(userId).select('tribe region preferences');
    
    for (const video of videos) {
      const score = await this.calculateVideoScore(video, user, tab);
      video.ranking[`${tab}Score`] = score;
    }

    // Sort by score
    videos.sort((a, b) => b.ranking[`${tab}Score`] - a.ranking[`${tab}Score`]);

    return videos;
  }

  /**
   * Calculate video ranking score
   */
  async calculateVideoScore(video, user, tab) {
    const factors = await this.calculateRankingFactors(video, user, tab);
    
    let score = 0;
    for (const [factor, weight] of Object.entries(this.rankingWeights)) {
      score += factors[factor] * weight;
    }

    // Apply tab-specific adjustments
    switch (tab) {
      case 'tribe':
        if (video.tribe === user.tribe.id) {
          score *= 1.2; // Boost same tribe content
        }
        break;
      case 'following':
        score *= 1.1; // Boost followed creators
        break;
      case 'battles':
        if (video.type === 'battle_clip') {
          score *= 1.3; // Boost battle content
        }
        break;
    }

    // Apply freshness boost
    const ageHours = (Date.now() - video.createdAt.getTime()) / (1000 * 60 * 60);
    const freshnessBoost = Math.max(0, 1 - (ageHours / 48)); // Decay over 48 hours
    score += freshnessBoost * 0.1;

    return Math.max(0, Math.min(1, score)); // Clamp between 0 and 1
  }

  /**
   * Calculate ranking factors for a video
   */
  async calculateRankingFactors(video, user, tab) {
    const stats = video.stats;
    const duration = video.durationSec;

    return {
      videoCompletionRate: stats.completionRate || 0,
      avgWatchTime: duration > 0 ? (stats.avgWatchTime / (duration * 1000)) : 0,
      replayRate: stats.replays / Math.max(1, stats.views),
      shareRate: stats.shareRate || 0,
      voteRate: stats.voteRate || 0,
      followRate: stats.followRate || 0,
      creatorQualityScore: await this.getCreatorQualityScore(video.ownerId),
      freshnessScore: this.calculateFreshnessScore(video.createdAt),
      tribeAffinityScore: video.tribe === user.tribe.id ? 1 : 0,
      regionAffinityScore: video.region === user.region ? 1 : 0,
    };
  }

  /**
   * Get creator quality score
   */
  async getCreatorQualityScore(ownerId) {
    const user = await User.findById(ownerId).select('creatorStats battleStats');
    if (!user) return 0;

    const stats = user.creatorStats;
    const battleStats = user.battleStats;

    // Calculate win rate
    const totalBattles = (battleStats?.wins || 0) + (battleStats?.losses || 0);
    const winRate = totalBattles > 0 ? (battleStats.wins / totalBattles) : 0;

    // Calculate consistency score
    const consistencyScore = stats.consistencyScore || 0;

    // Combine factors
    return (winRate * 0.4) + (consistencyScore * 0.3) + (Math.min(stats.totalViews / 1000, 1) * 0.3);
  }

  /**
   * Calculate freshness score
   */
  calculateFreshnessScore(createdAt) {
    const ageHours = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
    return Math.max(0, 1 - (ageHours / 168)); // Decay over 1 week
  }

  /**
   * Apply diversity rules to prevent echo chambers
   */
  async applyDiversityRules(videos, userId, tab) {
    const userImpressions = await FeedImpression.find({ userId })
      .sort({ shownAt: -1 })
      .limit(50)
      .select('videoId');

    const recentVideoIds = userImpressions.map(imp => imp.videoId.toString());
    const creatorCounts = {};
    const filteredVideos = [];

    for (const video of videos) {
      const creatorId = video.ownerId._id.toString();
      const creatorCount = creatorCounts[creatorId] || 0;

      // Apply creator diversity rule
      if (creatorCount >= this.diversityRules.maxSameCreator) {
        continue;
      }

      // Apply recency diversity rule
      if (recentVideoIds.includes(video._id.toString())) {
        continue;
      }

      creatorCounts[creatorId] = creatorCount + 1;
      filteredVideos.push(video);

      if (filteredVideos.length >= videos.length) {
        break;
      }
    }

    return filteredVideos;
  }

  /**
   * Get fresh videos (last 48 hours)
   */
  async getFreshVideos(region, limit) {
    return Video.getFreshVideos(limit, region);
  }

  /**
   * Get trending videos (last 7 days)
   */
  async getTrendingVideos(region, limit) {
    return Video.getTrendingVideos(limit, region);
  }

  /**
   * Get tribe videos
   */
  async getTribeVideos(tribeId, region, limit) {
    return Video.find({
      tribe: tribeId,
      'safety.moderation': 'approved',
      'metadata.isPublic': true,
      region,
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('ownerId', 'username displayName avatar tribe')
      .populate('sourceTransformId', 'style')
      .populate('battleId', 'shortCode status');
  }

  /**
   * Get exploration videos (long-tail creators)
   */
  async getExplorationVideos(userId, region, limit) {
    const following = await Follow.find({ followerId: userId }).select('followingId');
    const followingIds = following.map(f => f.followingId);

    return Video.find({
      ownerId: { $nin: followingIds },
      'safety.moderation': 'approved',
      'metadata.isPublic': true,
      region,
      'stats.views': { $lt: 1000 }, // Long-tail creators
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('ownerId', 'username displayName avatar tribe')
      .populate('sourceTransformId', 'style')
      .populate('battleId', 'shortCode status');
  }

  /**
   * Get fallback videos when no personalized content available
   */
  async getFallbackVideos(region, limit) {
    return Video.find({
      'safety.moderation': 'approved',
      'metadata.isPublic': true,
      region,
    })
      .sort({ 'stats.views': -1, createdAt: -1 })
      .limit(limit)
      .populate('ownerId', 'username displayName avatar tribe')
      .populate('sourceTransformId', 'style')
      .populate('battleId', 'shortCode status');
  }

  /**
   * Deduplicate videos array
   */
  deduplicateVideos(videos) {
    const seen = new Set();
    return videos.filter(video => {
      const id = video._id.toString();
      if (seen.has(id)) {
        return false;
      }
      seen.add(id);
      return true;
    });
  }

  /**
   * Format video for feed response
   */
  formatVideoForFeed(video) {
    return {
      id: video._id,
      type: video.type,
      style: video.style,
      tribe: video.tribe,
      duration: video.durationSec,
      cdn: video.cdn,
      stats: video.stats,
      metadata: video.metadata,
      owner: {
        id: video.ownerId._id,
        username: video.ownerId.username,
        displayName: video.ownerId.displayName || video.ownerId.username,
        avatar: video.ownerId.avatar,
        tribe: video.ownerId.tribe,
      },
      sourceTransform: video.sourceTransformId ? {
        id: video.sourceTransformId._id,
        style: video.sourceTransformId.style,
      } : null,
      battle: video.battleId ? {
        id: video.battleId._id,
        shortCode: video.battleId.shortCode,
        status: video.battleId.status,
      } : null,
      createdAt: video.createdAt,
      ranking: video.ranking,
    };
  }

  /**
   * Track video impression
   */
  async trackImpression(userId, videoId, sessionId, tab, position, metadata = {}) {
    try {
      const impression = new FeedImpression({
        userId,
        videoId,
        sessionId,
        tab,
        position,
        metadata,
      });

      await impression.save();

      // Update video view count
      await Video.findByIdAndUpdate(videoId, { $inc: { 'stats.views': 1 } });

      return impression;
    } catch (error) {
      logger.error('Error tracking impression:', error);
      throw error;
    }
  }

  /**
   * Update video engagement stats
   */
  async updateVideoStats(videoId, stats) {
    try {
      const video = await Video.findById(videoId);
      if (!video) throw new Error('Video not found');

      await video.updateStats(stats);

      // Trigger re-ranking for this video
      await this.recalculateVideoRanking(videoId);

      return video;
    } catch (error) {
      logger.error('Error updating video stats:', error);
      throw error;
    }
  }

  /**
   * Recalculate video ranking scores
   */
  async recalculateVideoRanking(videoId) {
    try {
      const video = await Video.findById(videoId);
      if (!video) return;

      // Calculate scores for all tabs
      const tabs = ['foryou', 'tribe', 'following', 'battles'];
      const scores = {};

      for (const tab of tabs) {
        const score = await this.calculateVideoScore(video, null, tab);
        scores[`${tab}Score`] = score;
      }

      await video.updateRanking(scores);

      // Update rank score cache
      await RankScore.findOneAndUpdate(
        { videoId },
        {
          $set: {
            scores,
            'metadata.lastCalculatedAt': new Date(),
          },
        },
        { upsert: true }
      );

    } catch (error) {
      logger.error('Error recalculating video ranking:', error);
    }
  }

  /**
   * Get feed analytics
   */
  async getFeedAnalytics(userId, tab = null, days = 7) {
    try {
      const query = { userId };
      if (tab) query.tab = tab;

      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      query.shownAt = { $gte: startDate };

      const impressions = await FeedImpression.find(query);
      
      const analytics = {
        totalImpressions: impressions.length,
        totalWatchTime: impressions.reduce((sum, imp) => sum + imp.watchedMs, 0),
        completions: impressions.filter(imp => imp.completed).length,
        likes: impressions.filter(imp => imp.actions.like).length,
        shares: impressions.filter(imp => imp.actions.share).length,
        votes: impressions.filter(imp => imp.actions.vote).length,
        follows: impressions.filter(imp => imp.actions.follow).length,
        challenges: impressions.filter(imp => imp.actions.challenge).length,
        avgWatchTime: impressions.length > 0 ? 
          impressions.reduce((sum, imp) => sum + imp.watchedMs, 0) / impressions.length : 0,
        completionRate: impressions.length > 0 ? 
          impressions.filter(imp => imp.completed).length / impressions.length : 0,
        shareRate: impressions.length > 0 ? 
          impressions.filter(imp => imp.actions.share).length / impressions.length : 0,
        voteRate: impressions.length > 0 ? 
          impressions.filter(imp => imp.actions.vote).length / impressions.length : 0,
        followRate: impressions.length > 0 ? 
          impressions.filter(imp => imp.actions.follow).length / impressions.length : 0,
      };

      return analytics;
    } catch (error) {
      logger.error('Error getting feed analytics:', error);
      throw error;
    }
  }
}

module.exports = new FeedService();
