const Comment = require('../models/Comment');
const CommentLike = require('../models/CommentLike');
const Video = require('../models/Video');
const Battle = require('../models/Battle');
const User = require('../models/User');
const { redisClient } = require('../config/redis');
const { logger } = require('../utils/logger');
const { io } = require('../sockets/socketService');

class CommentService {
  constructor() {
    this.moderationRules = {
      blockList: [
        // Hate speech
        'hate', 'kill', 'die', 'stupid', 'idiot', 'moron',
        // Scam/spam
        'click here', 'free money', 'winner', 'congratulations', 'claim now',
        // NSFW
        'porn', 'sex', 'nude', 'nsfw',
        // Contact info
        /[\d]{3}-[\d]{3}-[\d]{4}/, // Phone numbers
        /@\w+\.(com|net|org)/, // Email patterns
      ],
      maxLength: 200,
      maxCommentsPerHour: 5,
      toxicThreshold: 3,
      autoHideThreshold: 10,
    };
  }

  /**
   * Get comments for a video
   * @param {string} videoId - Video ID
   * @param {string} sort - Sort type (top, newest)
   * @param {number} limit - Number of comments to return
   * @param {number} skip - Number of comments to skip
   * @returns {Promise<Object>} Comments data
   */
  async getComments(videoId, sort = 'top', limit = 20, skip = 0) {
    try {
      const cacheKey = `comments:${videoId}:${sort}:${skip}:${limit}`;
      
      // Check cache
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const [comments, totalCount, pinnedComment] = await Promise.all([
        Comment.getCommentsByVideo(videoId, sort, limit, skip),
        Comment.getTotalCommentCount(videoId),
        Comment.getPinnedComment(videoId),
      ]);

      // Format comments
      const formattedComments = await Promise.all(
        comments.map(comment => this.formatComment(comment))
      );

      const result = {
        comments: formattedComments,
        pinnedComment: pinnedComment ? await this.formatComment(pinnedComment) : null,
        totalCount,
        hasMore: skip + comments.length < totalCount,
      };

      // Cache for 1 minute
      await redisClient.setEx(cacheKey, 60, JSON.stringify(result));

      return result;
    } catch (error) {
      logger.error('Error getting comments:', error);
      throw error;
    }
  }

  /**
   * Get replies for a comment
   * @param {string} commentId - Comment ID
   * @param {number} limit - Number of replies to return
   * @returns {Promise<Array>} Replies
   */
  async getReplies(commentId, limit = 10) {
    try {
      const replies = await Comment.getRepliesForComment(commentId, limit);
      
      return Promise.all(
        replies.map(reply => this.formatComment(reply))
      );
    } catch (error) {
      logger.error('Error getting replies:', error);
      throw error;
    }
  }

  /**
   * Create a new comment
   * @param {string} userId - User ID
   * @param {string} videoId - Video ID
   * @param {string} text - Comment text
   * @param {string} parentId - Parent comment ID (optional)
   * @returns {Promise<Object>} Created comment
   */
  async createComment(userId, videoId, text, parentId = null) {
    try {
      // Validate user rate limit
      await this.validateRateLimit(userId, videoId);

      // Check moderation rules
      const moderationResult = this.checkModeration(text);
      if (!moderationResult.passed) {
        throw new Error(moderationResult.reason);
      }

      // Get video info
      const video = await Video.findById(videoId).select('battleId ownerId tribe type');
      if (!video) {
        throw new Error('Video not found');
      }

      // Extract mentions and hashtags
      const mentions = this.extractMentions(text);
      const hashtags = this.extractHashtags(text);
      const emojis = this.extractEmojis(text);
      
      // Determine if tribe war comment
      const isTribeWar = await this.checkTribeWar(video, text);

      // Create comment
      const comment = new Comment({
        videoId,
        battleId: video.battleId || null,
        parentId,
        userId,
        text: text.trim(),
        metadata: {
          mentions,
          hashtags,
          emojis,
          isTribeWar,
          tribe: video.tribe,
        },
        flags: {
          moderationStatus: moderationResult.needsReview ? 'pending' : 'approved',
        },
      });

      await comment.save();

      // Update parent comment reply count if this is a reply
      if (parentId) {
        const parentComment = await Comment.findById(parentId);
        if (parentComment) {
          await parentComment.incrementReplyCount();
        }
      }

      // Format and return
      const formattedComment = await this.formatComment(comment);

      // Broadcast new comment
      io.emit('comments:new', { comment: formattedComment, videoId });

      return formattedComment;
    } catch (error) {
      logger.error('Error creating comment:', error);
      throw error;
    }
  }

  /**
   * Like/unlike a comment
   * @param {string} userId - User ID
   * @param {string} commentId - Comment ID
   * @returns {Promise<Object>} Like result
   */
  async toggleLike(userId, commentId) {
    try {
      const existingLike = await CommentLike.findOne({ commentId, userId });

      if (existingLike) {
        // Unlike
        await CommentLike.deleteOne({ _id: existingLike._id });
        const comment = await Comment.findById(commentId);
        if (comment) {
          await comment.decrementLike();
        }

        io.emit('comments:like', { commentId, liked: false, likes: comment.likes - 1 });

        return { liked: false, likes: comment.likes - 1 };
      } else {
        // Like
        const like = new CommentLike({ commentId, userId });
        await like.save();

        const comment = await Comment.findById(commentId);
        if (comment) {
          await comment.incrementLike();
        }

        io.emit('comments:like', { commentId, liked: true, likes: comment.likes });

        return { liked: true, likes: comment.likes };
      }
    } catch (error) {
      logger.error('Error toggling like:', error);
      throw error;
    }
  }

  /**
   * Report a comment
   * @param {string} userId - User ID
   * @param {string} commentId - Comment ID
   * @param {string} reason - Report reason
   * @returns {Promise<Object>} Report result
   */
  async reportComment(userId, commentId, reason) {
    try {
      const comment = await Comment.findById(commentId);
      if (!comment) {
        throw new Error('Comment not found');
      }

      await comment.reportComment();

      // Check if comment should be auto-hidden
      if (comment.flags.reportCount >= this.moderationRules.autoHideThreshold) {
        comment.flags.moderationStatus = 'hidden';
        await comment.save();

        // Notify moderators
        io.emit('comments:moderation', { commentId, action: 'hidden' });
      }

      // Check if comment needs review (3 reports)
      if (comment.flags.reportCount >= this.moderationRules.toxicThreshold) {
        comment.flags.moderationStatus = 'pending';
        await comment.save();

        // Notify moderators
        io.emit('comments:moderation', { commentId, action: 'review_needed' });
      }

      return { success: true, reportCount: comment.flags.reportCount };
    } catch (error) {
      logger.error('Error reporting comment:', error);
      throw error;
    }
  }

  /**
   * Delete a comment
   * @param {string} userId - User ID
   * @param {string} commentId - Comment ID
   * @returns {Promise<Object>} Delete result
   */
  async deleteComment(userId, commentId) {
    try {
      const comment = await Comment.findById(commentId);
      if (!comment) {
        throw new Error('Comment not found');
      }

      // Check if user is owner or admin
      if (comment.userId.toString() !== userId.toString()) {
        throw new Error('Unauthorized to delete this comment');
      }

      // Update parent comment reply count if this is a reply
      if (comment.parentId) {
        const parentComment = await Comment.findById(comment.parentId);
        if (parentComment) {
          await parentComment.decrementReplyCount();
        }
      }

      // Delete comment
      await Comment.deleteOne({ _id: commentId });

      // Delete associated likes
      await CommentLike.deleteMany({ commentId });

      // Broadcast deletion
      io.emit('comments:delete', { commentId });

      return { success: true };
    } catch (error) {
      logger.error('Error deleting comment:', error);
      throw error;
    }
  }

  /**
   * Pin a comment (for creators/admins)
   * @param {string} userId - User ID
   * @param {string} commentId - Comment ID
   * @returns {Promise<Object>} Pin result
   */
  async pinComment(userId, commentId) {
    try {
      const comment = await Comment.findById(commentId);
      if (!comment) {
        throw new Error('Comment not found');
      }

      // Get video owner
      const video = await Video.findById(comment.videoId).select('ownerId');
      if (!video) {
        throw new Error('Video not found');
      }

      // Check if user is video owner or admin
      if (video.ownerId.toString() !== userId.toString()) {
        // Check if user is admin (you would implement this check)
        throw new Error('Unauthorized to pin this comment');
      }

      await comment.pinComment();

      // Broadcast pin
      io.emit('comments:pin', { commentId, pinned: true });

      return { success: true, pinned: true };
    } catch (error) {
      logger.error('Error pinning comment:', error);
      throw error;
    }
  }

  /**
   * Format comment for response
   * @param {Object} comment - Comment object
   * @returns {Promise<Object>} Formatted comment
   */
  async formatComment(comment) {
    const user = await User.findById(comment.userId).select('username displayName avatar tribe');
    
    return {
      id: comment._id,
      videoId: comment.videoId,
      battleId: comment.battleId,
      parentId: comment.parentId,
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName || user.username,
        avatar: user.avatar,
        tribe: user.tribe.name || user.tribe.id,
      },
      text: comment.text,
      likes: comment.likes,
      replies: comment.replies.count,
      isPinned: comment.flags.isPinned,
      isEdited: comment.flags.isEdited,
      metadata: comment.metadata,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
  }

  /**
   * Validate rate limit for comments
   * @param {string} userId - User ID
   * @param {string} videoId - Video ID
   * @returns {Promise<void>}
   */
  async validateRateLimit(userId, videoId) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentComments = await Comment.countDocuments({
      userId,
      videoId,
      createdAt: { $gte: oneHourAgo },
    });

    if (recentComments >= this.moderationRules.maxCommentsPerHour) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
  }

  /**
   * Check moderation rules for text
   * @param {string} text - Comment text
   * @returns {Object} Moderation result
   */
  checkModeration(text) {
    // Check length
    if (text.length > this.moderationRules.maxLength) {
      return { passed: false, reason: 'Comment too long' };
    }

    // Check for blocked words
    const lowerText = text.toLowerCase();
    for (const pattern of this.moderationRules.blockList) {
      if (pattern instanceof RegExp) {
        if (pattern.test(text)) {
          return { passed: false, reason: 'Invalid content detected' };
        }
      } else if (lowerText.includes(pattern.toLowerCase())) {
        return { passed: false, reason: 'Invalid content detected' };
      }
    }

    // Check for links
    if (/https?:\/\//.test(text)) {
      return { passed: false, reason: 'Links not allowed' };
    }

    return { passed: true, needsReview: false };
  }

  /**
   * Extract mentions from text
   * @param {string} text - Comment text
   * @returns {Array} Mentions
   */
  extractMentions(text) {
    const mentionRegex = /@(\w+)/g;
    const matches = text.match(mentionRegex);
    return matches ? matches.map(m => m.substring(1)) : [];
  }

  /**
   * Extract hashtags from text
   * @param {string} text - Comment text
   * @returns {Array} Hashtags
   */
  extractHashtags(text) {
    const hashtagRegex = /#(\w+)/g;
    const matches = text.match(hashtagRegex);
    return matches ? matches.map(h => h.substring(1)) : [];
  }

  /**
   * Extract emojis from text
   * @param {string} text - Comment text
   * @returns {Array} Emojis
   */
  extractEmojis(text) {
    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
    const matches = text.match(emojiRegex);
    return matches || [];
  }

  /**
   * Check if comment is tribe war related
   * @param {Object} video - Video object
   * @param {string} text - Comment text
   * @returns {Promise<boolean>} Is tribe war
   */
  async checkTribeWar(video, text) {
    if (!video.battleId) return false;

    const battle = await Battle.findById(video.battleId).select('challenger defender');
    if (!battle) return false;

    const textLower = text.toLowerCase();
    const challengerTribe = battle.challenger.tribe.toLowerCase();
    const defenderTribe = battle.defender.tribe.toLowerCase();

    return textLower.includes(challengerTribe) || textLower.includes(defenderTribe);
  }
}

module.exports = new CommentService();
