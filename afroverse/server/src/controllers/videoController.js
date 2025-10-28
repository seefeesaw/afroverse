const videoProcessingService = require('../services/videoProcessingService');
const fullBodyVideoProcessingService = require('../services/fullBodyVideoProcessingService');
const { addVideoJob, addFullBodyVideoJob } = require('../workers/videoWorker');
const { validationResult } = require('express-validator');
const multer = require('multer');
const sharp = require('sharp');

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

const videoController = {
  /**
   * POST /api/video/create
   * Create a new video from transformation or selfie
   */
  async createVideo(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    try {
      const userId = req.user.id;
      const { 
        transformId, 
        variant, 
        style, 
        vibe, 
        captions, 
        intensity = 0.6 
      } = req.body;

      let result;

      if (transformId) {
        // Create video from existing transformation
        result = await videoProcessingService.createVideoFromTransformation({
          userId,
          transformId,
          variant,
          style,
          vibe,
          captions,
          intensity
        });
      } else if (req.file) {
        // Create video from uploaded selfie
        const imageBuffer = await sharp(req.file.buffer)
          .resize(1080, 1920, { fit: 'cover' })
          .jpeg({ quality: 90 })
          .toBuffer();

        result = await videoProcessingService.createVideoFromSelfie({
          userId,
          imageBuffer,
          variant,
          style,
          vibe,
          captions,
          intensity
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Either transformId or image file is required'
        });
      }

      // Add job to queue
      await addVideoJob(result.videoId, req.file?.buffer, {
        priority: req.user.entitlements?.warriorPass ? 1 : 0
      });

      res.status(201).json({
        success: true,
        videoId: result.videoId,
        jobId: result.jobId,
        status: result.status,
        message: 'Video creation started'
      });

    } catch (error) {
      console.error('Error creating video:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create video'
      });
    }
  },

  /**
   * GET /api/video/status/:videoId
   * Get video processing status
   */
  async getVideoStatus(req, res) {
    try {
      const { videoId } = req.params;
      const userId = req.user.id;

      // Verify user owns the video
      const video = await require('../models/Video').findOne({ 
        _id: videoId, 
        userId 
      });
      
      if (!video) {
        return res.status(404).json({
          success: false,
          message: 'Video not found'
        });
      }

      const status = await videoProcessingService.getVideoStatus(videoId);
      
      res.json({
        success: true,
        ...status
      });

    } catch (error) {
      console.error('Error getting video status:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get video status'
      });
    }
  },

  /**
   * GET /api/video/history
   * Get user's video history
   */
  async getVideoHistory(req, res) {
    try {
      const userId = req.user.id;
      const { 
        limit = 20, 
        cursor, 
        variant 
      } = req.query;

      const history = await videoProcessingService.getUserVideoHistory(userId, {
        limit: parseInt(limit),
        cursor,
        variant
      });

      res.json({
        success: true,
        ...history
      });

    } catch (error) {
      console.error('Error getting video history:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get video history'
      });
    }
  },

  /**
   * DELETE /api/video/:videoId
   * Delete a video
   */
  async deleteVideo(req, res) {
    try {
      const { videoId } = req.params;
      const userId = req.user.id;

      const result = await videoProcessingService.deleteVideo(userId, videoId);
      
      res.json({
        success: true,
        message: result.message
      });

    } catch (error) {
      console.error('Error deleting video:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete video'
      });
    }
  },

  /**
   * POST /api/video/:videoId/share
   * Increment share count for a video
   */
  async shareVideo(req, res) {
    try {
      const { videoId } = req.params;
      const { platform } = req.body;

      await videoProcessingService.incrementShareCount(videoId);
      
      // Track analytics
      const video = await require('../models/Video').findById(videoId);
      if (video) {
        // Emit analytics event
        req.app.get('io').emit('video_shared', {
          videoId,
          userId: video.userId,
          platform,
          timestamp: Date.now()
        });
      }

      res.json({
        success: true,
        message: 'Share count updated'
      });

    } catch (error) {
      console.error('Error sharing video:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update share count'
      });
    }
  },

  /**
   * POST /api/video/:videoId/view
   * Increment view count for a video
   */
  async viewVideo(req, res) {
    try {
      const { videoId } = req.params;

      await videoProcessingService.incrementEngagement(videoId, 'views');
      
      res.json({
        success: true,
        message: 'View count updated'
      });

    } catch (error) {
      console.error('Error viewing video:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update view count'
      });
    }
  },

  /**
   * GET /api/video/audio-tracks
   * Get available audio tracks
   */
  async getAudioTracks(req, res) {
    try {
      const videoGenerationService = require('../services/videoGenerationService');
      const tracks = videoGenerationService.getAvailableAudioTracks();
      
      res.json({
        success: true,
        tracks
      });

    } catch (error) {
      console.error('Error getting audio tracks:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get audio tracks'
      });
    }
  },

  /**
   * GET /api/video/styles
   * Get available video styles
   */
  async getVideoStyles(req, res) {
    try {
      const styles = [
        {
          id: 'maasai',
          name: 'Maasai Warrior',
          description: 'Traditional Maasai warrior with red shuka and beaded jewelry',
          preview: '/assets/styles/maasai-preview.jpg'
        },
        {
          id: 'zulu',
          name: 'Zulu Royalty',
          description: 'Zulu royal attire with traditional headdress and shield',
          preview: '/assets/styles/zulu-preview.jpg'
        },
        {
          id: 'pharaoh',
          name: 'Ancient Pharaoh',
          description: 'Egyptian pharaoh with golden headdress and royal regalia',
          preview: '/assets/styles/pharaoh-preview.jpg'
        },
        {
          id: 'afrofuturistic',
          name: 'Afrofuturistic',
          description: 'Futuristic African warrior with tech-enhanced armor',
          preview: '/assets/styles/afrofuturistic-preview.jpg'
        }
      ];
      
      res.json({
        success: true,
        styles
      });

    } catch (error) {
      console.error('Error getting video styles:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get video styles'
      });
    }
  },

  /**
   * POST /api/video/fullbody/create
   * Create a full-body dance/action video
   */
  async createFullBodyVideo(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    try {
      const userId = req.user.id;
      const { 
        transformId, 
        style, 
        motionPack, 
        vibe, 
        durationSec = 12, 
        intensity = 0.6, 
        background = 'auto', 
        captions,
        clothHints = { sway: 0.6, wind: 0.3 }
      } = req.body;

      if (!transformId) {
        return res.status(400).json({
          success: false,
          message: 'Transform ID is required for full-body videos'
        });
      }

      const result = await fullBodyVideoProcessingService.createFullBodyVideoJob(userId, {
        transformId,
        style,
        motionPack,
        vibe,
        durationSec,
        intensity,
        background,
        captions,
        clothHints,
      });

      // Add job to queue
      await addFullBodyVideoJob(userId, {
        transformId,
        style,
        motionPack,
        vibe,
        durationSec,
        intensity,
        background,
        captions,
        clothHints,
        priority: req.user.subscription?.status === 'warrior' ? 1 : 5
      });

      res.status(201).json({
        success: true,
        jobId: result.jobId,
        status: result.status,
        message: 'Full-body video creation started'
      });

    } catch (error) {
      console.error('Error creating full-body video:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create full-body video'
      });
    }
  },

  /**
   * GET /api/video/motion-packs
   * Get available motion packs
   */
  async getMotionPacks(req, res) {
    try {
      const { region, complexity, bpm } = req.query;
      
      const motionPacks = await fullBodyVideoProcessingService.getAvailableMotionPacks({
        region,
        complexity,
        bpm: bpm ? parseInt(bpm) : undefined,
      });

      res.json({
        success: true,
        motionPacks
      });

    } catch (error) {
      console.error('Error getting motion packs:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get motion packs'
      });
    }
  },

  /**
   * GET /api/video/motion-packs/recommended
   * Get recommended motion packs for user
   */
  async getRecommendedMotionPacks(req, res) {
    try {
      const userId = req.user.id;
      const { style, vibe } = req.query;

      const recommendations = await fullBodyVideoProcessingService.getRecommendedMotionPacks(userId, {
        style,
        vibe,
      });

      res.json({
        success: true,
        recommendations
      });

    } catch (error) {
      console.error('Error getting recommended motion packs:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get recommended motion packs'
      });
    }
  },

  /**
   * GET /api/video/fullbody/stats
   * Get full-body video statistics for user
   */
  async getFullBodyVideoStats(req, res) {
    try {
      const userId = req.user.id;

      const stats = await fullBodyVideoProcessingService.getFullBodyVideoStats(userId);

      res.json({
        success: true,
        stats
      });

    } catch (error) {
      console.error('Error getting full-body video stats:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get full-body video stats'
      });
    }
  },

  /**
   * GET /api/video/:videoId/public
   * Get public video info (for sharing)
   */
  async getPublicVideo(req, res) {
    try {
      const { videoId } = req.params;

      const video = await require('../models/Video').findById(videoId)
        .populate('userId', 'username displayName')
        .lean();

      if (!video || !video.flags.isPublic) {
        return res.status(404).json({
          success: false,
          message: 'Video not found or private'
        });
      }

      // Increment view count
      await videoProcessingService.incrementEngagement(videoId, 'views');

      res.json({
        success: true,
        video: {
          id: video._id,
          variant: video.variant,
          style: video.style,
          urls: video.urls,
          duration: video.render.durationSec,
          shareCount: video.share.count,
          viewCount: video.engagement.views + 1, // +1 for current view
          createdAt: video.createdAt,
          user: {
            username: video.userId.username,
            displayName: video.userId.displayName
          }
        }
      });

    } catch (error) {
      console.error('Error getting public video:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get video'
      });
    }
  }
};

module.exports = {
  videoController,
  upload
};
