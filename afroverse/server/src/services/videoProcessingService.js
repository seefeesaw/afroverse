const Video = require('../models/Video');
const Transformation = require('../models/Transformation');
const User = require('../models/User');
const videoGenerationService = require('./videoGenerationService');
const { uploadToS3 } = require('./storageService');
const { sendNotification } = require('./notificationService');
const socketService = require('../sockets/socketService');

class VideoProcessingService {
  constructor() {
    this.processingJobs = new Map(); // Track active jobs
  }

  /**
   * Create a new video from an existing transformation
   * @param {Object} options - Video creation options
   * @returns {Promise<Object>} - Video creation result
   */
  async createVideoFromTransformation(options) {
    const {
      userId,
      transformId,
      variant,
      style,
      vibe = null,
      captions = null,
      intensity = 0.6
    } = options;

    try {
      // Validate user eligibility
      await this.validateUserEligibility(userId, variant);

      // Get the transformation
      const transformation = await Transformation.findById(transformId);
      if (!transformation) {
        throw new Error('Transformation not found');
      }

      if (transformation.userId.toString() !== userId.toString()) {
        throw new Error('Unauthorized: Transformation belongs to different user');
      }

      // Check if transformation is ready
      if (!transformation.isBattleReady()) {
        throw new Error('Transformation is not ready for video creation');
      }

      // Create video document
      const video = new Video({
        userId,
        source: {
          type: 'image',
          transformId,
          originalImageUrl: transformation.result.url
        },
        variant,
        style,
        vibe,
        captions,
        intensity,
        status: 'queued'
      });

      await video.save();

      // Add video reference to transformation
      transformation.videoRefs.push(video._id);
      await transformation.save();

      // Start processing
      this.processVideoJob(video._id);

      return {
        success: true,
        videoId: video._id,
        jobId: video._id.toString(),
        status: 'queued'
      };

    } catch (error) {
      console.error('Error creating video from transformation:', error);
      throw error;
    }
  }

  /**
   * Create a new video from a raw selfie
   * @param {Object} options - Video creation options
   * @returns {Promise<Object>} - Video creation result
   */
  async createVideoFromSelfie(options) {
    const {
      userId,
      imageBuffer,
      variant,
      style,
      vibe = null,
      captions = null,
      intensity = 0.6
    } = options;

    try {
      // Validate user eligibility
      await this.validateUserEligibility(userId, variant);

      // Create video document
      const video = new Video({
        userId,
        source: {
          type: 'selfie',
          transformId: null,
          originalImageUrl: null
        },
        variant,
        style,
        vibe,
        captions,
        intensity,
        status: 'queued'
      });

      await video.save();

      // Start processing with image buffer
      this.processVideoJob(video._id, imageBuffer);

      return {
        success: true,
        videoId: video._id,
        jobId: video._id.toString(),
        status: 'queued'
      };

    } catch (error) {
      console.error('Error creating video from selfie:', error);
      throw error;
    }
  }

  /**
   * Process a video job
   * @param {string} videoId - Video ID
   * @param {Buffer} imageBuffer - Optional image buffer for selfie videos
   */
  async processVideoJob(videoId, imageBuffer = null) {
    const startTime = Date.now();
    
    try {
      const video = await Video.findById(videoId);
      if (!video) {
        throw new Error('Video not found');
      }

      // Update status to processing
      video.status = 'processing';
      await video.save();

      // Notify user of progress
      this.emitProgress(video.userId, videoId, 10, 'Starting video generation...');

      // Get base image
      let baseImageBuffer;
      if (video.source.type === 'image') {
        // Download from transformation URL
        const response = await fetch(video.source.originalImageUrl);
        baseImageBuffer = Buffer.from(await response.arrayBuffer());
      } else if (imageBuffer) {
        baseImageBuffer = imageBuffer;
      } else {
        throw new Error('No image buffer provided for selfie video');
      }

      this.emitProgress(video.userId, videoId, 30, 'Generating motion frames...');

      // Generate video based on variant
      let generationResult;
      if (video.variant === 'loop') {
        generationResult = await videoGenerationService.generateLoop(baseImageBuffer, {
          style: video.style,
          duration: 4,
          motion: 'subtle',
          intensity: video.intensity
        });
      } else {
        generationResult = await videoGenerationService.generateClip(baseImageBuffer, {
          style: video.style,
          duration: 12,
          vibe: video.vibe,
          captions: video.captions,
          intensity: video.intensity
        });
      }

      this.emitProgress(video.userId, videoId, 70, 'Uploading video...');

      // Upload video to storage
      const videoUrl = await this.uploadVideo(video.userId, videoId, generationResult.videoBuffer);
      
      // Generate thumbnail
      const thumbnailBuffer = await videoGenerationService.generateThumbnail(
        path.join(__dirname, '../../temp', `${videoId}_temp.mp4`)
      );
      const thumbnailUrl = await this.uploadThumbnail(video.userId, videoId, thumbnailBuffer);

      // Generate OG image for social sharing
      const ogImageUrl = await this.generateOGImage(video.userId, videoId, thumbnailBuffer);

      this.emitProgress(video.userId, videoId, 90, 'Finalizing...');

      // Update video with results
      const processingTime = Date.now() - startTime;
      video.render = {
        model: {
          name: 'AnimateDiff',
          version: '1.0'
        },
        motion: {
          engine: 'animatediff',
          params: {
            style: video.style,
            intensity: video.intensity,
            variant: video.variant
          }
        },
        grading: {
          lut: null,
          exposure: 0,
          saturation: 1
        },
        audio: video.vibe ? {
          trackId: videoGenerationService.getAvailableAudioTracks()[video.vibe]?.id,
          bpm: videoGenerationService.getAvailableAudioTracks()[video.vibe]?.bpm,
          key: videoGenerationService.getAvailableAudioTracks()[video.vibe]?.key
        } : {
          trackId: null,
          bpm: null,
          key: null
        },
        durationSec: generationResult.duration,
        fps: generationResult.fps,
        width: generationResult.width,
        height: generationResult.height,
        bitrateKbps: 1200,
        processingMs: processingTime,
        costCents: this.calculateCost(video.variant, processingTime)
      };

      video.urls = {
        mp4: videoUrl,
        thumb: thumbnailUrl,
        og: ogImageUrl
      };

      video.status = 'completed';
      await video.save();

      // Create feed video entry
      try {
        const FeedVideo = require('../models/Video');
        const user = await User.findById(video.userId).select('tribe region');
        
        const feedVideo = new FeedVideo({
          ownerId: video.userId,
          type: video.variant === 'fullbody' ? 'fullbody_dance' : 'portrait_loop',
          sourceTransformId: video.source.transformId,
          style: video.style,
          tribe: user.tribe.id,
          durationSec: video.render.durationSec,
          cdn: {
            hlsUrl: video.urls.hls,
            mp4Url: video.urls.mp4,
            thumbUrl: video.urls.thumbnail,
            blurhash: video.render.blurhash,
          },
          region: user.region || 'ZA',
        });

        await feedVideo.save();
        
        // Trigger ranking calculation
        const feedService = require('./feedService');
        await feedService.recalculateVideoRanking(feedVideo._id);
        
        logger.info(`Feed video created: ${feedVideo._id}`);
      } catch (error) {
        logger.error('Error creating feed video:', error);
      }

      // Update user's video count
      await this.updateUserVideoStats(video.userId, video.variant);

      // Notify completion
      this.emitCompletion(video.userId, videoId, video);
      
      // Send notification
      await sendNotification(video.userId, 'video', 'Video Ready!', 
        `Your ${video.variant} video is ready to share!`, '/app/videos');

      console.log(`Video ${videoId} processed successfully in ${processingTime}ms`);

    } catch (error) {
      console.error(`Error processing video ${videoId}:`, error);
      
      // Update video status to failed
      await Video.findByIdAndUpdate(videoId, {
        status: 'failed',
        error: error.message
      });

      // Notify user of failure
      this.emitError(videoId, error.message);
    }
  }

  /**
   * Validate user eligibility for video creation
   * @param {string} userId - User ID
   * @param {string} variant - Video variant
   */
  async validateUserEligibility(userId, variant) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check daily limits
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayVideos = await Video.countDocuments({
      userId,
      createdAt: { $gte: today },
      variant
    });

    const dailyLimit = user.entitlements?.warriorPass ? 999 : 2; // Free: 2 per day, Premium: unlimited
    
    if (todayVideos >= dailyLimit) {
      throw new Error(`Daily limit reached for ${variant} videos. Upgrade to Warrior Pass for unlimited videos.`);
    }

    // Check if user has active subscription for premium features
    if (variant === 'clip' && !user.entitlements?.warriorPass) {
      // Check if user has enough coins
      const wallet = await this.getUserWallet(userId);
      if (wallet.balance < 20) {
        throw new Error('Insufficient coins. Need 20 coins to create video clips.');
      }
    }
  }

  /**
   * Upload video to storage
   * @param {string} userId - User ID
   * @param {string} videoId - Video ID
   * @param {Buffer} videoBuffer - Video buffer
   * @returns {Promise<string>} - Video URL
   */
  async uploadVideo(userId, videoId, videoBuffer) {
    const filename = `videos/${userId}/${videoId}/master.mp4`;
    return await uploadToS3(filename, videoBuffer, 'video/mp4');
  }

  /**
   * Upload thumbnail to storage
   * @param {string} userId - User ID
   * @param {string} videoId - Video ID
   * @param {Buffer} thumbnailBuffer - Thumbnail buffer
   * @returns {Promise<string>} - Thumbnail URL
   */
  async uploadThumbnail(userId, videoId, thumbnailBuffer) {
    const filename = `videos/${userId}/${videoId}/thumb.jpg`;
    return await uploadToS3(filename, thumbnailBuffer, 'image/jpeg');
  }

  /**
   * Generate OG image for social sharing
   * @param {string} userId - User ID
   * @param {string} videoId - Video ID
   * @param {Buffer} thumbnailBuffer - Thumbnail buffer
   * @returns {Promise<string>} - OG image URL
   */
  async generateOGImage(userId, videoId, thumbnailBuffer) {
    // For now, use thumbnail as OG image
    // In production, you might want to create a custom OG image with branding
    const filename = `videos/${userId}/${videoId}/og.jpg`;
    return await uploadToS3(filename, thumbnailBuffer, 'image/jpeg');
  }

  /**
   * Calculate processing cost
   * @param {string} variant - Video variant
   * @param {number} processingTime - Processing time in ms
   * @returns {number} - Cost in cents
   */
  calculateCost(variant, processingTime) {
    const baseCost = variant === 'loop' ? 1 : 5; // Base cost in cents
    const timeCost = Math.ceil(processingTime / 1000) * 0.1; // Additional cost per second
    return Math.round((baseCost + timeCost) * 100) / 100;
  }

  /**
   * Update user video statistics
   * @param {string} userId - User ID
   * @param {string} variant - Video variant
   */
  async updateUserVideoStats(userId, variant) {
    await User.findByIdAndUpdate(userId, {
      $inc: {
        [`stats.videos.${variant}`]: 1,
        'stats.videos.total': 1
      }
    });
  }

  /**
   * Get user wallet (placeholder - integrate with wallet service)
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Wallet object
   */
  async getUserWallet(userId) {
    // Placeholder - integrate with actual wallet service
    return { balance: 100 };
  }

  /**
   * Emit progress update
   * @param {string} userId - User ID
   * @param {string} videoId - Video ID
   * @param {number} progress - Progress percentage
   * @param {string} message - Progress message
   */
  emitProgress(userId, videoId, progress, message) {
    io.to(userId).emit('video_progress', {
      videoId,
      progress,
      message,
      timestamp: Date.now()
    });
  }

  /**
   * Emit completion notification
   * @param {string} userId - User ID
   * @param {string} videoId - Video ID
   * @param {Object} video - Video document
   */
  emitCompletion(userId, videoId, video) {
    io.to(userId).emit('video_done', {
      videoId,
      urls: video.urls,
      duration: video.render.durationSec,
      variant: video.variant,
      style: video.style,
      timestamp: Date.now()
    });
  }

  /**
   * Emit error notification
   * @param {string} videoId - Video ID
   * @param {string} error - Error message
   */
  emitError(videoId, error) {
    // Find video to get userId
    Video.findById(videoId).then(video => {
      if (video) {
        io.to(video.userId).emit('video_failed', {
          videoId,
          error,
          timestamp: Date.now()
        });
      }
    });
  }

  /**
   * Get video status
   * @param {string} videoId - Video ID
   * @returns {Promise<Object>} - Video status
   */
  async getVideoStatus(videoId) {
    const video = await Video.findById(videoId);
    if (!video) {
      throw new Error('Video not found');
    }

    return {
      videoId,
      status: video.status,
      progress: video.status === 'processing' ? 50 : (video.status === 'completed' ? 100 : 0),
      error: video.error,
      video: video.status === 'completed' ? {
        id: video._id,
        urls: video.urls,
        variant: video.variant,
        style: video.style,
        duration: video.render.durationSec,
        createdAt: video.createdAt
      } : null
    };
  }

  /**
   * Get user's video history
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} - Video history
   */
  async getUserVideoHistory(userId, options = {}) {
    const {
      limit = 20,
      cursor = null,
      variant = null
    } = options;

    const query = { userId, status: 'completed' };
    if (variant) query.variant = variant;

    if (cursor) {
      query._id = { $lt: cursor };
    }

    const videos = await Video.find(query)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .populate('source.transformId', 'shareCode result.url')
      .lean();

    const hasMore = videos.length > limit;
    if (hasMore) videos.pop();

    return {
      videos: videos.map(video => ({
        id: video._id,
        variant: video.variant,
        style: video.style,
        urls: video.urls,
        duration: video.render.durationSec,
        shareCount: video.share.count,
        viewCount: video.engagement.views,
        createdAt: video.createdAt,
        source: video.source
      })),
      hasMore,
      nextCursor: hasMore ? videos[videos.length - 1]._id : null
    };
  }

  /**
   * Delete a video (soft delete)
   * @param {string} userId - User ID
   * @param {string} videoId - Video ID
   * @returns {Promise<Object>} - Deletion result
   */
  async deleteVideo(userId, videoId) {
    const video = await Video.findOne({ _id: videoId, userId });
    if (!video) {
      throw new Error('Video not found or unauthorized');
    }

    // Soft delete by updating flags
    video.flags.isPublic = false;
    video.status = 'deleted';
    await video.save();

    return { success: true, message: 'Video deleted successfully' };
  }

  /**
   * Increment video engagement metrics
   * @param {string} videoId - Video ID
   * @param {string} metric - Metric to increment ('views', 'likes', 'votes')
   * @param {number} amount - Amount to increment (default: 1)
   */
  async incrementEngagement(videoId, metric, amount = 1) {
    const updateField = `engagement.${metric}`;
    await Video.findByIdAndUpdate(videoId, {
      $inc: { [updateField]: amount }
    });
  }

  /**
   * Increment share count
   * @param {string} videoId - Video ID
   */
  async incrementShareCount(videoId) {
    await Video.findByIdAndUpdate(videoId, {
      $inc: { 'share.count': 1 },
      $set: { 'share.lastSharedAt': new Date() }
    });
  }

  /**
   * Update video analytics metrics
   */
  async updateVideoAnalytics() {
    try {
      logger.info('Updating video analytics');
      
      // Get videos from the last 24 hours
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const videos = await Video.find({
        createdAt: { $gte: yesterday }
      }).select('_id stats');
      
      for (const video of videos) {
        // Update engagement metrics
        const engagementScore = (video.stats?.likes || 0) + 
                              (video.stats?.shares || 0) * 2 + 
                              (video.stats?.views || 0) * 0.1;
        
        await Video.findByIdAndUpdate(video._id, {
          $set: { 'analytics.engagementScore': engagementScore }
        });
      }
      
      logger.info(`Updated analytics for ${videos.length} videos`);
      return { success: true, count: videos.length };
    } catch (error) {
      logger.error('Error updating video analytics:', error);
      throw error;
    }
  }

  /**
   * Clean up old temporary files
   */
  async cleanupOldTempFiles() {
    try {
      logger.info('Cleaning up old temporary files');
      
      // This would typically clean up files from a temp directory
      // For now, we'll just log the action
      logger.info('Temporary file cleanup completed');
      
      return { success: true };
    } catch (error) {
      logger.error('Error cleaning up temporary files:', error);
      throw error;
    }
  }

  /**
   * Generate video performance reports
   */
  async generateVideoReports() {
    try {
      logger.info('Generating video performance reports');
      
      // This would typically generate reports
      // For now, we'll just log the action
      logger.info('Video performance reports generated');
      
      return { success: true };
    } catch (error) {
      logger.error('Error generating video reports:', error);
      throw error;
    }
  }

  /**
   * Clean up failed jobs older than 24 hours
   */
  async cleanupFailedJobs() {
    try {
      logger.info('Cleaning up failed video jobs');
      
      // This would typically clean up failed jobs
      // For now, we'll just log the action
      logger.info('Failed job cleanup completed');
      
      return { success: true };
    } catch (error) {
      logger.error('Error cleaning up failed jobs:', error);
      throw error;
    }
  }
}

module.exports = new VideoProcessingService();
