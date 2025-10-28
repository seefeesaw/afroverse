const feedService = require('../services/feedService');
const Video = require('../models/Video');
const FeedImpression = require('../models/FeedImpression');
const { validationResult } = require('express-validator');
const { logger } = require('../utils/logger');

const feedController = {
  /**
   * GET /api/feed/:tab
   * Get feed for specific tab
   */
  async getFeed(req, res) {
    try {
      const { tab } = req.params;
      const { cursor, limit = 10, region = 'ZA' } = req.query;
      const userId = req.user.id;

      // Validate tab
      const validTabs = ['foryou', 'following', 'tribe', 'battles'];
      if (!validTabs.includes(tab)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid feed tab'
        });
      }

      const feed = await feedService.generateFeed(userId, tab, cursor, parseInt(limit), region);

      res.status(200).json({
        success: true,
        ...feed
      });

    } catch (error) {
      logger.error('Error getting feed:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get feed'
      });
    }
  },

  /**
   * POST /api/video/:videoId/like
   * Like/unlike a video
   */
  async likeVideo(req, res) {
    try {
      const { videoId } = req.params;
      const { on } = req.body;
      const userId = req.user.id;

      const video = await Video.findById(videoId);
      if (!video) {
        return res.status(404).json({
          success: false,
          message: 'Video not found'
        });
      }

      if (on) {
        await video.incrementLike();
      } else {
        // Decrement like (if implemented)
        video.stats.likes = Math.max(0, video.stats.likes - 1);
        await video.save();
      }

      // Track impression action
      await FeedImpression.findOneAndUpdate(
        { userId, videoId },
        { $set: { 'actions.like': on } }
      );

      res.status(200).json({
        success: true,
        likes: video.stats.likes
      });

    } catch (error) {
      logger.error('Error liking video:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to like video'
      });
    }
  },

  /**
   * POST /api/video/:videoId/share
   * Share a video
   */
  async shareVideo(req, res) {
    try {
      const { videoId } = req.params;
      const { channel } = req.body;
      const userId = req.user.id;

      const video = await Video.findById(videoId);
      if (!video) {
        return res.status(404).json({
          success: false,
          message: 'Video not found'
        });
      }

      await video.incrementShare();

      // Track impression action
      await FeedImpression.findOneAndUpdate(
        { userId, videoId },
        { $set: { 'actions.share': true } }
      );

      // Generate share URL
      const shareUrl = `${process.env.CLIENT_URL}/v/${videoId}?ref=${req.user.username}`;

      res.status(200).json({
        success: true,
        shareUrl,
        shares: video.stats.shares
      });

    } catch (error) {
      logger.error('Error sharing video:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to share video'
      });
    }
  },

  /**
   * POST /api/video/:videoId/view
   * Track video view
   */
  async trackView(req, res) {
    try {
      const { videoId } = req.params;
      const { watchedMs, completed, replayed, sessionId, tab, position } = req.body;
      const userId = req.user.id;

      const video = await Video.findById(videoId);
      if (!video) {
        return res.status(404).json({
          success: false,
          message: 'Video not found'
        });
      }

      // Update or create impression
      let impression = await FeedImpression.findOne({ userId, videoId });
      
      if (impression) {
        impression.watchedMs = Math.max(impression.watchedMs, watchedMs);
        if (completed) impression.completed = true;
        if (replayed) impression.replayed += 1;
        await impression.save();
      } else {
        // Create new impression
        impression = await feedService.trackImpression(
          userId,
          videoId,
          sessionId,
          tab,
          position,
          {
            userAgent: req.get('User-Agent'),
            ipHash: req.ip,
            deviceType: 'mobile', // Could be detected from user agent
            connectionType: '4g', // Could be detected from headers
          }
        );
      }

      // Update video stats
      const stats = {
        avgWatchTime: watchedMs,
        completionRate: completed ? 1 : 0,
      };

      await feedService.updateVideoStats(videoId, stats);

      res.status(200).json({
        success: true,
        impression: impression._id
      });

    } catch (error) {
      logger.error('Error tracking view:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to track view'
      });
    }
  },

  /**
   * POST /api/video/:videoId/report
   * Report a video
   */
  async reportVideo(req, res) {
    try {
      const { videoId } = req.params;
      const { reason } = req.body;
      const userId = req.user.id;

      const video = await Video.findById(videoId);
      if (!video) {
        return res.status(404).json({
          success: false,
          message: 'Video not found'
        });
      }

      // Increment report count
      video.safety.reportCount += 1;
      await video.save();

      // Track impression action
      await FeedImpression.findOneAndUpdate(
        { userId, videoId },
        { $set: { 'actions.report': reason } }
      );

      // If report count exceeds threshold, flag for moderation
      if (video.safety.reportCount >= 5) {
        video.safety.moderation = 'flagged';
        await video.save();
      }

      res.status(200).json({
        success: true,
        message: 'Video reported successfully'
      });

    } catch (error) {
      logger.error('Error reporting video:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to report video'
      });
    }
  },

  /**
   * POST /api/battles/:battleId/vote
   * Vote on a battle video
   */
  async voteOnBattle(req, res) {
    try {
      const { battleId } = req.params;
      const { side } = req.body;
      const userId = req.user.id;

      // Validate vote choice
      if (!['challenger', 'defender'].includes(side)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid vote choice'
        });
      }

      // Find battle video
      const video = await Video.findOne({ battleId });
      if (!video) {
        return res.status(404).json({
          success: false,
          message: 'Battle video not found'
        });
      }

      await video.incrementVote();

      // Track impression action
      await FeedImpression.findOneAndUpdate(
        { userId, videoId: video._id },
        { $set: { 'actions.vote': side } }
      );

      // Update battle vote counts (this would integrate with existing battle system)
      const Battle = require('../models/Battle');
      const battle = await Battle.findById(battleId);
      if (battle) {
        battle.votes[side] += 1;
        battle.votes.total += 1;
        await battle.save();
      }

      res.status(200).json({
        success: true,
        votes: video.stats.votesCast
      });

    } catch (error) {
      logger.error('Error voting on battle:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to vote on battle'
      });
    }
  },

  /**
   * POST /api/video/:videoId/follow
   * Follow creator after viewing video
   */
  async followCreator(req, res) {
    try {
      const { videoId } = req.params;
      const userId = req.user.id;

      const video = await Video.findById(videoId).populate('ownerId');
      if (!video) {
        return res.status(404).json({
          success: false,
          message: 'Video not found'
        });
      }

      const creatorId = video.ownerId._id;

      // Check if already following
      const Follow = require('../models/Follow');
      const existingFollow = await Follow.findOne({ followerId: userId, followingId: creatorId });
      
      if (existingFollow) {
        return res.status(400).json({
          success: false,
          message: 'Already following this creator'
        });
      }

      // Create follow relationship
      const follow = new Follow({
        followerId: userId,
        followingId: creatorId,
      });

      await follow.save();

      // Update creator stats
      await video.ownerId.incrementFollowersCount();
      await req.user.incrementFollowingCount();

      // Track impression action
      await FeedImpression.findOneAndUpdate(
        { userId, videoId },
        { $set: { 'actions.follow': true } }
      );

      await video.incrementFollowAfterView();

      res.status(200).json({
        success: true,
        message: 'Creator followed successfully',
        followersCount: video.ownerId.followersCount
      });

    } catch (error) {
      logger.error('Error following creator:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to follow creator'
      });
    }
  },

  /**
   * POST /api/video/:videoId/challenge
   * Start challenge from video
   */
  async startChallenge(req, res) {
    try {
      const { videoId } = req.params;
      const { opponentId } = req.body;
      const userId = req.user.id;

      const video = await Video.findById(videoId);
      if (!video) {
        return res.status(404).json({
          success: false,
          message: 'Video not found'
        });
      }

      // Track impression action
      await FeedImpression.findOneAndUpdate(
        { userId, videoId },
        { $set: { 'actions.challenge': true } }
      );

      // Create battle (this would integrate with existing battle system)
      const Battle = require('../models/Battle');
      const Transformation = require('../models/Transformation');

      // Get user's latest transformation
      const userTransform = await Transformation.findOne({
        userId,
        status: 'completed'
      }).sort({ createdAt: -1 });

      if (!userTransform) {
        return res.status(400).json({
          success: false,
          message: 'No completed transformation found'
        });
      }

      // Create battle
      const battle = new Battle({
        challenger: {
          userId,
          transformId: userTransform._id,
          transformUrl: userTransform.result.url,
          username: req.user.username,
          tribe: req.user.tribe.id,
        },
        defender: {
          userId: opponentId,
          transformId: video.sourceTransformId,
          transformUrl: video.cdn.mp4Url,
          username: video.ownerId.username,
          tribe: video.tribe,
        },
        style: video.style,
        shortCode: await Battle.generateShortCode(),
      });

      await battle.save();

      res.status(200).json({
        success: true,
        battle: {
          id: battle._id,
          shortCode: battle.shortCode,
          shareUrl: `${process.env.CLIENT_URL}/battle/${battle.shortCode}`
        }
      });

    } catch (error) {
      logger.error('Error starting challenge:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to start challenge'
      });
    }
  },

  /**
   * GET /api/feed/analytics
   * Get feed analytics for user
   */
  async getFeedAnalytics(req, res) {
    try {
      const { tab, days = 7 } = req.query;
      const userId = req.user.id;

      const analytics = await feedService.getFeedAnalytics(userId, tab, parseInt(days));

      res.status(200).json({
        success: true,
        analytics
      });

    } catch (error) {
      logger.error('Error getting feed analytics:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get feed analytics'
      });
    }
  },

  /**
   * GET /api/video/:videoId
   * Get video details
   */
  async getVideo(req, res) {
    try {
      const { videoId } = req.params;

      const video = await Video.findById(videoId)
        .populate('ownerId', 'username displayName avatar tribe')
        .populate('sourceTransformId', 'style')
        .populate('battleId', 'shortCode status');

      if (!video) {
        return res.status(404).json({
          success: false,
          message: 'Video not found'
        });
      }

      res.status(200).json({
        success: true,
        video: feedService.formatVideoForFeed(video)
      });

    } catch (error) {
      logger.error('Error getting video:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get video'
      });
    }
  },

  /**
   * GET /api/feed/public/:videoId
   * Get video for public sharing (no auth required)
   */
  async getPublicVideo(req, res) {
    try {
      const { videoId } = req.params;

      const video = await Video.findOne({
        _id: videoId,
        'safety.moderation': 'approved',
        'metadata.isPublic': true
      })
        .populate('ownerId', 'username displayName avatar tribe')
        .populate('sourceTransformId', 'style')
        .populate('battleId', 'shortCode status');

      if (!video) {
        return res.status(404).json({
          success: false,
          message: 'Video not found or not public'
        });
      }

      res.status(200).json({
        success: true,
        video: feedService.formatVideoForFeed(video)
      });

    } catch (error) {
      logger.error('Error getting public video:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get video'
      });
    }
  },
};

module.exports = feedController;