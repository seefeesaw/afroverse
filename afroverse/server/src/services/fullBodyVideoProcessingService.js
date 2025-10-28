const Transformation = require('../models/Transformation');
const Video = require('../models/Video');
const MotionPack = require('../models/MotionPack');
const User = require('../models/User');
const fullBodyVideoGenerationService = require('./fullBodyVideoGenerationService');
const { uploadFileToS3 } = require('../config/s3');
const { logger } = require('../utils/logger');
const socketService = require('../sockets/socketService');
const { getQueue } = require('../queues/queueManager');
const { MODERATION_ACTIONS, MODERATION_REASONS } = require('../utils/constants');
const moderationService = require('./moderationService');
const fs = require('fs').promises;
const path = require('path');

const fullBodyVideoProcessingService = {
  /**
   * Create a full-body video generation job
   * @param {string} userId - User ID
   * @param {Object} options - Video generation options
   * @returns {Promise<Object>} - Job creation result
   */
  async createFullBodyVideoJob(userId, options) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Validate motion pack
      const motionPack = await MotionPack.findOne({ 
        id: options.motionPack,
        isActive: true 
      });
      
      if (!motionPack) {
        throw new Error('Invalid or inactive motion pack');
      }

      // Check user entitlements and limits
      if (!this.checkUserFullBodyVideoEligibility(user, options)) {
        throw new Error('User not eligible to create full-body video (limits or premium required)');
      }

      // Validate motion pack compatibility
      if (!fullBodyVideoGenerationService.validateMotionPackCompatibility(motionPack, options)) {
        throw new Error('Motion pack not compatible with selected options');
      }

      const videoQueue = getQueue('videoQueue');
      if (!videoQueue) {
        throw new Error('Video queue not initialized');
      }

      const job = await videoQueue.add('processFullBodyVideo', {
        userId: userId.toString(),
        transformId: options.transformId ? options.transformId.toString() : null,
        style: options.style,
        motionPack: options.motionPack,
        vibe: options.vibe,
        durationSec: options.durationSec || 12,
        intensity: options.intensity || 0.6,
        background: options.background || 'auto',
        captions: options.captions,
        clothHints: options.clothHints || { sway: 0.6, wind: 0.3 },
      }, {
        attempts: 2, // Fewer retries for full-body videos due to complexity
        backoff: { type: 'exponential', delay: 10000 },
        priority: user.subscription.status === 'warrior' ? 1 : 5, // Priority for Warrior Pass users
      });

      logger.info(`Full-body video job ${job.id} added to queue for user ${userId}`);
      return { jobId: job.id, status: 'queued' };

    } catch (error) {
      logger.error('Error creating full-body video job:', error);
      throw error;
    }
  },

  /**
   * Process a full-body video generation job
   * @param {Object} job - BullMQ job
   * @returns {Promise<Object>} - Processing result
   */
  async processFullBodyVideoJob(job) {
    const { 
      userId, 
      transformId, 
      style, 
      motionPack, 
      vibe, 
      durationSec, 
      intensity, 
      background, 
      captions, 
      clothHints 
    } = job.data;
    const currentJobId = job.id;

    try {
      io.to(userId).emit('video_progress', { 
        jobId: currentJobId, 
        progress: 5, 
        message: 'Fetching base image...' 
      });

      // 1. Get base image
      let baseFrameBuffer;
      let transformation;

      if (transformId) {
        transformation = await Transformation.findById(transformId);
        if (!transformation) {
          throw new Error('Transformation not found');
        }
        
        const response = await fetch(transformation.result.url);
        baseFrameBuffer = Buffer.from(await response.arrayBuffer());
      } else {
        throw new Error('Transform ID is required for full-body videos');
      }

      io.to(userId).emit('video_progress', { 
        jobId: currentJobId, 
        progress: 15, 
        message: 'Running safety checks...' 
      });

      // 2. Safety and moderation checks
      const moderationResult = await moderationService.moderateImage(baseFrameBuffer, userId, transformId);
      if (moderationResult.action !== MODERATION_ACTIONS.ALLOW) {
        throw new Error(`Content moderation failed: ${moderationResult.reason}`);
      }

      io.to(userId).emit('video_progress', { 
        jobId: currentJobId, 
        progress: 25, 
        message: 'Loading motion pack...' 
      });

      // 3. Get motion pack
      const motionPackData = await MotionPack.findOne({ 
        id: motionPack,
        isActive: true 
      });
      
      if (!motionPackData) {
        throw new Error('Motion pack not found or inactive');
      }

      io.to(userId).emit('video_progress', { 
        jobId: currentJobId, 
        progress: 35, 
        message: 'Generating full-body animation...' 
      });

      // 4. Generate full-body video
      const generationOptions = {
        durationSec,
        intensity,
        scene: background,
        clothHints,
        audioTrack: vibe ? await this.getAudioTrack(vibe) : null,
        bpm: motionPackData.bpmRange.min,
      };

      const generationResult = await fullBodyVideoGenerationService.generateFullBodyVideo(
        baseFrameBuffer,
        motionPackData,
        generationOptions
      );

      io.to(userId).emit('video_progress', { 
        jobId: currentJobId, 
        progress: 80, 
        message: 'Uploading to CDN...' 
      });

      // 5. Upload to CDN
      const videoFileName = `${userId}/${uuidv4()}_fullbody.mp4`;
      const thumbFileName = `${userId}/${uuidv4()}_thumb.jpg`;
      const ogFileName = `${userId}/${uuidv4()}_og.jpg`;

      const [videoUploadResult, thumbUploadResult, ogUploadResult] = await Promise.all([
        uploadFileToS3(generationResult.videoPath, `video/${videoFileName}`, 'video/mp4'),
        uploadFileToS3(generationResult.thumbPath, `video/${thumbFileName}`, 'image/jpeg'),
        uploadFileToS3(generationResult.ogPath, `video/${ogFileName}`, 'image/jpeg'),
      ]);

      io.to(userId).emit('video_progress', { 
        jobId: currentJobId, 
        progress: 95, 
        message: 'Saving to database...' 
      });

      // 6. Save to database
      const videoDoc = await Video.create({
        userId,
        source: { type: 'image', transformId },
        variant: 'fullbody',
        style,
        vibe,
        intensity,
        captions,
        driver: {
          motionPack,
          poseFps: 30,
          scene: background,
          clothHints,
        },
        render: {
          model: { name: 'FullBodyAI', version: 'v1.0' },
          motion: { engine: 'fullbody', params: { motionPack, intensity } },
          audio: vibe ? { trackId: vibe, bpm: motionPackData.bpmRange.min } : null,
          durationSec,
          fps: 30,
          width: 1080,
          height: 1920,
          bitrateKbps: 2000,
          processingMs: generationResult.processingMs,
          costCents: fullBodyVideoGenerationService.calculateProcessingCost(generationOptions),
          identityLockScore: generationResult.identityLockScore,
          faceConsistencyScore: generationResult.faceConsistencyScore,
        },
        urls: {
          mp4: videoUploadResult.url,
          thumb: thumbUploadResult.url,
          og: ogUploadResult.url,
        },
        flags: { 
          isPublic: true, 
          moderation: 'clean', 
          status: 'completed' 
        },
      });

      // 7. Link video to transformation
      if (transformation) {
        transformation.videoRefs.push(videoDoc._id);
        await transformation.save();
      }

      // 8. Update user's daily limits
      await this.updateUserDailyLimits(userId, 'fullbody');

      io.to(userId).emit('video_done', { 
        jobId: currentJobId, 
        videoId: videoDoc._id, 
        urls: videoDoc.urls,
        variant: 'fullbody'
      });

      logger.info(`Full-body video ${videoDoc._id} completed for user ${userId}`);
      return { videoId: videoDoc._id, urls: videoDoc.urls };

    } catch (error) {
      logger.error(`Error processing full-body video job ${currentJobId} for user ${userId}:`, error);
      
      // Create failed video record
      await Video.create({
        userId,
        source: { type: 'image', transformId },
        variant: 'fullbody',
        style,
        flags: { 
          isPublic: false, 
          moderation: 'blocked', 
          status: 'failed', 
          error: error.message 
        },
        render: {
          durationSec: 0, 
          fps: 0, 
          width: 0, 
          height: 0, 
          bitrateKbps: 0, 
          processingMs: Date.now() - job.timestamp, 
          costCents: 0 
        },
        urls: { mp4: '', thumb: '', og: '' },
      });

      io.to(userId).emit('video_failed', { 
        jobId: currentJobId, 
        reason: error.message 
      });
      
      throw error;
    }
  },

  /**
   * Get audio track for vibe
   * @param {string} vibe - Music vibe
   * @returns {Promise<Object>} - Audio track info
   */
  async getAudioTrack(vibe) {
    // Mock audio track selection
    const audioTracks = {
      amapiano: { id: 'amapiano_1', bpm: 112 },
      afrobeats: { id: 'afrobeats_1', bpm: 120 },
      highlife: { id: 'highlife_1', bpm: 100 },
      epic: { id: 'epic_1', bpm: 140 },
    };
    
    return audioTracks[vibe] || audioTracks.afrobeats;
  },

  /**
   * Check user eligibility for full-body videos
   * @param {Object} user - User document
   * @param {Object} options - Video options
   * @returns {boolean} - Whether eligible
   */
  checkUserFullBodyVideoEligibility(user, options) {
    // Check daily limits
    const dailyLimit = user.subscription.status === 'warrior' ? 5 : 1;
    const today = new Date().toISOString().split('T')[0];
    
    if (user.dailyLimits?.fullBodyVideos?.[today] >= dailyLimit) {
      return false;
    }

    // Check if user has enough coins for premium features
    if (options.motionPack === 'premium' && user.wallet?.balance < 50) {
      return false;
    }

    return true;
  },

  /**
   * Update user's daily limits
   * @param {string} userId - User ID
   * @param {string} type - Limit type
   */
  async updateUserDailyLimits(userId, type) {
    const today = new Date().toISOString().split('T')[0];
    
    await User.findByIdAndUpdate(userId, {
      $inc: {
        [`dailyLimits.${type}Videos.${today}`]: 1,
      },
    });
  },

  /**
   * Get available motion packs
   * @param {Object} filters - Filter options
   * @returns {Promise<Object[]>} - Motion packs
   */
  async getAvailableMotionPacks(filters = {}) {
    try {
      const query = { isActive: true };
      
      if (filters.region) {
        query.region = filters.region;
      }
      
      if (filters.complexity) {
        query['metadata.complexity'] = filters.complexity;
      }
      
      if (filters.bpm) {
        query['bpmRange.min'] = { $lte: filters.bpm };
        query['bpmRange.max'] = { $gte: filters.bpm };
      }

      const motionPacks = await MotionPack.find(query)
        .sort({ 'metadata.complexity': 1, name: 1 })
        .lean();

      return motionPacks;
    } catch (error) {
      logger.error('Error getting available motion packs:', error);
      throw error;
    }
  },

  /**
   * Get recommended motion packs for user
   * @param {string} userId - User ID
   * @param {Object} preferences - User preferences
   * @returns {Promise<Object[]>} - Recommended motion packs
   */
  async getRecommendedMotionPacks(userId, preferences = {}) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const { style, vibe } = preferences;
      
      const recommendations = await fullBodyVideoGenerationService.getRecommendedMotionPacks(
        style || user.tribe?.name || 'maasai',
        vibe || 'afrobeats'
      );

      return recommendations;
    } catch (error) {
      logger.error('Error getting recommended motion packs:', error);
      throw error;
    }
  },

  /**
   * Get full-body video statistics
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Video statistics
   */
  async getFullBodyVideoStats(userId) {
    try {
      const stats = await Video.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId), variant: 'fullbody' } },
        {
          $group: {
            _id: null,
            totalVideos: { $sum: 1 },
            completedVideos: {
              $sum: { $cond: [{ $eq: ['$flags.status', 'completed'] }, 1, 0] }
            },
            totalViews: { $sum: '$engagement.views' },
            totalShares: { $sum: '$share.count' },
            avgProcessingTime: { $avg: '$render.processingMs' },
          }
        }
      ]);

      return stats[0] || {
        totalVideos: 0,
        completedVideos: 0,
        totalViews: 0,
        totalShares: 0,
        avgProcessingTime: 0,
      };
    } catch (error) {
      logger.error('Error getting full-body video stats:', error);
      throw error;
    }
  },
};

module.exports = fullBodyVideoProcessingService;
