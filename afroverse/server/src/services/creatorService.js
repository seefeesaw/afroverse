const User = require('../models/User');
const Follow = require('../models/Follow');
const Battle = require('../models/Battle');
const Transformation = require('../models/Transformation');
const { logger } = require('../utils/logger');
const { io } = require('../sockets/socketService');
const notificationService = require('./notificationService');

// Rate limiting for follow actions
const followRateLimit = new Map(); // userId -> { count, resetTime }
const FOLLOW_RATE_LIMIT_WINDOW = 24 * 60 * 60 * 1000; // 24 hours
const FOLLOW_RATE_LIMIT_MAX = 40; // Max 40 follows per day

const creatorService = {
  /**
   * Get creator profile by username
   * @param {string} username - Username to get profile for
   * @param {string} viewerId - ID of user viewing the profile (optional)
   * @returns {Promise<Object>} Creator profile data
   */
  async getCreatorProfile(username, viewerId = null) {
    try {
      const creator = await User.findOne({ username })
        .populate('tribe.id', 'displayName emblem')
        .select('-phone -__v');

      if (!creator) {
        throw new Error('Creator not found');
      }

      // Increment profile views if viewer is different from creator
      if (viewerId && viewerId !== creator._id.toString()) {
        await creator.incrementProfileViews();
      }

      // Check if viewer follows this creator
      let isFollowing = false;
      if (viewerId) {
        const follow = await Follow.findOne({
          followerId: viewerId,
          followingId: creator._id
        });
        isFollowing = !!follow;
      }

      // Get creator stats
      const stats = await this.getCreatorStats(creator._id);

      return {
        _id: creator._id,
        username: creator.username,
        displayName: creator.displayName || creator.username,
        avatar: creator.avatar,
        bio: creator.bio,
        bannerUrl: creator.bannerUrl,
        isCreator: creator.isCreator,
        followersCount: creator.followersCount,
        followingCount: creator.followingCount,
        tribe: creator.tribe,
        creatorStats: creator.creatorStats,
        profileViews: creator.profileViews,
        createdAt: creator.createdAt,
        isFollowing,
        rankTier: creator.getCreatorRankTier(),
        creatorScore: creator.getCreatorScore(),
        ...stats
      };

    } catch (error) {
      logger.error('Error getting creator profile:', error);
      throw error;
    }
  },

  /**
   * Get creator's content feed (battles and transformations)
   * @param {string} userId - Creator's user ID
   * @param {string} cursor - Pagination cursor
   * @param {number} limit - Number of items to fetch
   * @returns {Promise<Object>} Feed data
   */
  async getCreatorFeed(userId, cursor = null, limit = 20) {
    try {
      const query = {
        $or: [
          { challengerId: userId },
          { defenderId: userId },
          { creatorId: userId }
        ],
        status: { $in: ['completed', 'active'] }
      };

      if (cursor) {
        const lastItem = await Battle.findById(cursor);
        if (lastItem) {
          query.createdAt = { $lt: lastItem.createdAt };
        }
      }

      // Get battles
      const battles = await Battle.find(query)
        .populate('challengerId', 'username displayName avatar')
        .populate('defenderId', 'username displayName avatar')
        .populate('challengerTransform', 'imageUrl style')
        .populate('defenderTransform', 'imageUrl style')
        .sort({ createdAt: -1 })
        .limit(limit);

      // Get transformations
      const transformations = await Transformation.find({
        creatorId: userId,
        status: 'completed'
      })
        .populate('creatorId', 'username displayName avatar')
        .sort({ createdAt: -1 })
        .limit(limit);

      // Combine and sort by date
      const feedItems = [
        ...battles.map(battle => ({
          type: 'battle',
          _id: battle._id,
          createdAt: battle.createdAt,
          data: battle
        })),
        ...transformations.map(transform => ({
          type: 'transformation',
          _id: transform._id,
          createdAt: transform.createdAt,
          data: transform
        }))
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return {
        items: feedItems.slice(0, limit),
        hasMore: feedItems.length === limit,
        nextCursor: feedItems.length > 0 ? feedItems[feedItems.length - 1]._id : null
      };

    } catch (error) {
      logger.error('Error getting creator feed:', error);
      throw error;
    }
  },

  /**
   * Follow a creator
   * @param {string} followerId - ID of user following
   * @param {string} followingId - ID of creator being followed
   * @returns {Promise<Object>} Follow result
   */
  async followCreator(followerId, followingId) {
    try {
      // Check rate limit
      if (!this.checkFollowRateLimit(followerId)) {
        throw new Error('Follow rate limit exceeded. Maximum 40 follows per day.');
      }

      // Prevent self-follow
      if (followerId === followingId) {
        throw new Error('Cannot follow yourself');
      }

      // Check if already following
      const existingFollow = await Follow.findOne({
        followerId,
        followingId
      });

      if (existingFollow) {
        throw new Error('Already following this creator');
      }

      // Create follow relationship
      const follow = await Follow.create({
        followerId,
        followingId
      });

      // Update follower counts
      const follower = await User.findById(followerId);
      const following = await User.findById(followingId);

      if (follower && following) {
        await follower.incrementFollowingCount();
        await following.incrementFollowersCount();

        // Track achievement progress for followers
        try {
          const achievementService = require('./achievementService');
          await achievementService.checkAchievements(followingId, 'followers', 1);
        } catch (error) {
          logger.error('Error tracking follower achievement:', error);
        }

        // Promote to creator if they have enough followers
        if (following.followersCount >= 10 && !following.isCreator) {
          await following.promoteToCreator();
        }

        // Send notification to creator
        await notificationService.createNotification(followingId, {
          type: 'new_follower',
          title: 'New Follower!',
          message: `${follower.displayName || follower.username} started following you`,
          deeplink: `/app/profile/${follower.username}`,
        });

        // Broadcast follow event
        io.to(`user:${followingId}`).emit('new_follower', {
          follower: {
            _id: follower._id,
            username: follower.username,
            displayName: follower.displayName,
            avatar: follower.avatar
          },
          followersCount: following.followersCount
        });

        logger.info(`User ${followerId} followed ${followingId}`);
      }

      return {
        success: true,
        followersCount: following.followersCount,
        followingCount: follower.followingCount
      };

    } catch (error) {
      logger.error('Error following creator:', error);
      throw error;
    }
  },

  /**
   * Unfollow a creator
   * @param {string} followerId - ID of user unfollowing
   * @param {string} followingId - ID of creator being unfollowed
   * @returns {Promise<Object>} Unfollow result
   */
  async unfollowCreator(followerId, followingId) {
    try {
      // Find and remove follow relationship
      const follow = await Follow.findOneAndDelete({
        followerId,
        followingId
      });

      if (!follow) {
        throw new Error('Not following this creator');
      }

      // Update follower counts
      const follower = await User.findById(followerId);
      const following = await User.findById(followingId);

      if (follower && following) {
        await follower.decrementFollowingCount();
        await following.decrementFollowersCount();

        // Broadcast unfollow event
        io.to(`user:${followingId}`).emit('unfollowed', {
          followerId,
          followersCount: following.followersCount
        });

        logger.info(`User ${followerId} unfollowed ${followingId}`);
      }

      return {
        success: true,
        followersCount: following.followersCount,
        followingCount: follower.followingCount
      };

    } catch (error) {
      logger.error('Error unfollowing creator:', error);
      throw error;
    }
  },

  /**
   * Get list of followers for a creator
   * @param {string} userId - Creator's user ID
   * @param {string} cursor - Pagination cursor
   * @param {number} limit - Number of followers to fetch
   * @returns {Promise<Object>} Followers list
   */
  async getFollowers(userId, cursor = null, limit = 20) {
    try {
      const query = { followingId: userId };
      
      if (cursor) {
        const lastFollow = await Follow.findById(cursor);
        if (lastFollow) {
          query.createdAt = { $lt: lastFollow.createdAt };
        }
      }

      const follows = await Follow.find(query)
        .populate('followerId', 'username displayName avatar followersCount')
        .sort({ createdAt: -1 })
        .limit(limit);

      const followers = follows.map(follow => ({
        _id: follow.followerId._id,
        username: follow.followerId.username,
        displayName: follow.followerId.displayName,
        avatar: follow.followerId.avatar,
        followersCount: follow.followerId.followersCount,
        followedAt: follow.createdAt
      }));

      return {
        followers,
        hasMore: follows.length === limit,
        nextCursor: follows.length > 0 ? follows[follows.length - 1]._id : null
      };

    } catch (error) {
      logger.error('Error getting followers:', error);
      throw error;
    }
  },

  /**
   * Get list of users that a creator is following
   * @param {string} userId - Creator's user ID
   * @param {string} cursor - Pagination cursor
   * @param {number} limit - Number of following to fetch
   * @returns {Promise<Object>} Following list
   */
  async getFollowing(userId, cursor = null, limit = 20) {
    try {
      const query = { followerId: userId };
      
      if (cursor) {
        const lastFollow = await Follow.findById(cursor);
        if (lastFollow) {
          query.createdAt = { $lt: lastFollow.createdAt };
        }
      }

      const follows = await Follow.find(query)
        .populate('followingId', 'username displayName avatar followersCount')
        .sort({ createdAt: -1 })
        .limit(limit);

      const following = follows.map(follow => ({
        _id: follow.followingId._id,
        username: follow.followingId.username,
        displayName: follow.followingId.displayName,
        avatar: follow.followingId.avatar,
        followersCount: follow.followingId.followersCount,
        followedAt: follow.createdAt
      }));

      return {
        following,
        hasMore: follows.length === limit,
        nextCursor: follows.length > 0 ? follows[follows.length - 1]._id : null
      };

    } catch (error) {
      logger.error('Error getting following:', error);
      throw error;
    }
  },

  /**
   * Update creator profile
   * @param {string} userId - User ID
   * @param {Object} updates - Profile updates
   * @returns {Promise<Object>} Updated profile
   */
  async updateCreatorProfile(userId, updates) {
    try {
      const allowedUpdates = ['bio', 'bannerUrl'];
      const updateData = {};

      for (const field of allowedUpdates) {
        if (updates[field] !== undefined) {
          updateData[field] = updates[field];
        }
      }

      const user = await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
      ).select('-phone -__v');

      if (!user) {
        throw new Error('User not found');
      }

      return {
        _id: user._id,
        username: user.username,
        displayName: user.displayName || user.username,
        avatar: user.avatar,
        bio: user.bio,
        bannerUrl: user.bannerUrl,
        isCreator: user.isCreator,
        followersCount: user.followersCount,
        followingCount: user.followingCount
      };

    } catch (error) {
      logger.error('Error updating creator profile:', error);
      throw error;
    }
  },

  /**
   * Get creator stats
   * @param {string} userId - Creator's user ID
   * @returns {Promise<Object>} Creator stats
   */
  async getCreatorStats(userId) {
    try {
      // Get battle stats
      const battleStats = await Battle.aggregate([
        {
          $match: {
            $or: [
              { challengerId: userId },
              { defenderId: userId }
            ],
            status: 'completed'
          }
        },
        {
          $group: {
            _id: null,
            totalBattles: { $sum: 1 },
            wins: {
              $sum: {
                $cond: [
                  { $eq: ['$winnerId', userId] },
                  1,
                  0
                ]
              }
            },
            totalVotes: { $sum: '$totalVotes' }
          }
        }
      ]);

      // Get transformation stats
      const transformStats = await Transformation.aggregate([
        {
          $match: {
            creatorId: userId,
            status: 'completed'
          }
        },
        {
          $group: {
            _id: null,
            totalTransformations: { $sum: 1 },
            totalViews: { $sum: '$views' },
            totalShares: { $sum: '$shares' }
          }
        }
      ]);

      const battleData = battleStats[0] || { totalBattles: 0, wins: 0, totalVotes: 0 };
      const transformData = transformStats[0] || { totalTransformations: 0, totalViews: 0, totalShares: 0 };

      const winRate = battleData.totalBattles > 0 
        ? (battleData.wins / battleData.totalBattles) * 100 
        : 0;

      return {
        totalBattles: battleData.totalBattles,
        battleWins: battleData.wins,
        winRate: Math.round(winRate * 100) / 100,
        totalVotes: battleData.totalVotes,
        totalTransformations: transformData.totalTransformations,
        totalViews: transformData.totalViews,
        totalShares: transformData.totalShares
      };

    } catch (error) {
      logger.error('Error getting creator stats:', error);
      throw error;
    }
  },

  /**
   * Get top creators (for discovery)
   * @param {string} cursor - Pagination cursor
   * @param {number} limit - Number of creators to fetch
   * @param {string} tribeId - Filter by tribe (optional)
   * @returns {Promise<Object>} Top creators list
   */
  async getTopCreators(cursor = null, limit = 20, tribeId = null) {
    try {
      const query = { isCreator: true };
      
      if (tribeId) {
        query['tribe.id'] = tribeId;
      }

      if (cursor) {
        const lastCreator = await User.findById(cursor);
        if (lastCreator) {
          query.followersCount = { $lt: lastCreator.followersCount };
        }
      }

      const creators = await User.find(query)
        .populate('tribe.id', 'displayName emblem')
        .select('username displayName avatar bio followersCount creatorStats tribe')
        .sort({ followersCount: -1, 'creatorStats.creatorRank': 1 })
        .limit(limit);

      const formattedCreators = creators.map(creator => ({
        _id: creator._id,
        username: creator.username,
        displayName: creator.displayName || creator.username,
        avatar: creator.avatar,
        bio: creator.bio,
        followersCount: creator.followersCount,
        tribe: creator.tribe,
        rankTier: creator.getCreatorRankTier(),
        creatorScore: creator.getCreatorScore()
      }));

      return {
        creators: formattedCreators,
        hasMore: creators.length === limit,
        nextCursor: creators.length > 0 ? creators[creators.length - 1]._id : null
      };

    } catch (error) {
      logger.error('Error getting top creators:', error);
      throw error;
    }
  },

  /**
   * Update creator stats when content is viewed/voted/shared
   * @param {string} userId - Creator's user ID
   * @param {Object} stats - Stats to update
   * @returns {Promise<void>}
   */
  async updateCreatorStats(userId, stats) {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      await user.updateCreatorStats(stats);

      // Recalculate creator rank if needed
      if (stats.views || stats.votes || stats.shares) {
        await this.recalculateCreatorRank(userId);
      }

    } catch (error) {
      logger.error('Error updating creator stats:', error);
    }
  },

  /**
   * Recalculate creator rank based on current stats
   * @param {string} userId - Creator's user ID
   * @returns {Promise<void>}
   */
  async recalculateCreatorRank(userId) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.isCreator) return;

      const creatorScore = user.getCreatorScore();
      
      // Get all creators sorted by score
      const allCreators = await User.find({ isCreator: true })
        .select('_id creatorStats')
        .sort({ 'creatorStats.creatorRank': 1 });

      // Find user's rank
      let rank = 1;
      for (const creator of allCreators) {
        if (creator._id.toString() === userId) {
          break;
        }
        if (creator.getCreatorScore() > creatorScore) {
          rank++;
        }
      }

      await user.updateCreatorRank(rank);

    } catch (error) {
      logger.error('Error recalculating creator rank:', error);
    }
  },

  /**
   * Check follow rate limit
   * @param {string} userId - User ID
   * @returns {boolean} Whether user can follow
   */
  checkFollowRateLimit(userId) {
    const now = Date.now();
    const userLimit = followRateLimit.get(userId);

    if (!userLimit || now > userLimit.resetTime) {
      followRateLimit.set(userId, {
        count: 1,
        resetTime: now + FOLLOW_RATE_LIMIT_WINDOW,
      });
      return true;
    }

    if (userLimit.count >= FOLLOW_RATE_LIMIT_MAX) {
      return false;
    }

    userLimit.count += 1;
    return true;
  },

  /**
   * Get public share page data (no authentication required)
   * @param {string} username - Creator's username
   * @returns {Promise<Object>} Public profile data
   */
  async getPublicSharePage(username) {
    try {
      const creator = await User.findOne({ username })
        .populate('tribe.id', 'displayName emblem')
        .select('username displayName avatar bio bannerUrl followersCount tribe createdAt');

      if (!creator) {
        throw new Error('Creator not found');
      }

      // Get top transformations for public view
      const topTransformations = await Transformation.find({
        creatorId: creator._id,
        status: 'completed'
      })
        .select('imageUrl style createdAt')
        .sort({ views: -1 })
        .limit(6);

      return {
        _id: creator._id,
        username: creator.username,
        displayName: creator.displayName || creator.username,
        avatar: creator.avatar,
        bio: creator.bio,
        bannerUrl: creator.bannerUrl,
        followersCount: creator.followersCount,
        tribe: creator.tribe,
        createdAt: creator.createdAt,
        topTransformations: topTransformations.map(t => ({
          _id: t._id,
          imageUrl: t.imageUrl,
          style: t.style,
          createdAt: t.createdAt
        }))
      };

    } catch (error) {
      logger.error('Error getting public share page:', error);
      throw error;
    }
  },
};

module.exports = creatorService;
