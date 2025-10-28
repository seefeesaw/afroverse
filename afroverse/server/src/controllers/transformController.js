const Transformation = require('../models/Transformation');
const User = require('../models/User');
const { addTransformJob } = require('../queues/transformQueue');
const cloudStorageService = require('../services/cloudStorageService');
const imageService = require('../services/imageService');
const aiService = require('../services/aiService');
const { logger } = require('../utils/logger');

// Create new transformation
const createTransformation = async (req, res) => {
  try {
    const { style, intensity = 0.8 } = req.body;
    const userId = req.userId;

    // Validate style
    const availableStyles = aiService.getAvailableStyles();
    const allStyles = [...availableStyles.free, ...availableStyles.premium];
    
    if (!allStyles.includes(style)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid style selected'
      });
    }

    // Check if style is premium
    const isPremiumStyle = aiService.isPremiumStyle(style);
    
    // Get user and check daily limits
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check and reset daily limits if needed
    await user.checkDailyLimits();

    // Check if user can transform
    if (!user.canTransform()) {
      return res.status(403).json({
        success: false,
        message: 'Daily transform limit reached',
        upgradeRequired: true,
        remainingTransforms: 0
      });
    }

    // Check if premium style requires upgrade
    if (isPremiumStyle && user.subscription.status !== 'warrior') {
      return res.status(403).json({
        success: false,
        message: 'Premium style requires Warrior subscription',
        upgradeRequired: true,
        style: style
      });
    }

    // Upload original image to cloud storage
    const originalKey = `originals/${userId}/${Date.now()}_${req.file.filename}`;
    const uploadResult = await cloudStorageService.uploadFile(
      req.file.path,
      originalKey,
      'image/jpeg'
    );

    if (!uploadResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to upload image',
        error: uploadResult.error
      });
    }

    // Generate unique identifiers
    const shareCode = await Transformation.generateShareCode();
    const jobId = await Transformation.generateJobId();

    // Create transformation record
    const transformation = new Transformation({
      userId,
      original: {
        url: uploadResult.url,
        width: req.processedImage.metadata.width,
        height: req.processedImage.metadata.height,
        filename: req.file.filename,
        size: req.file.size
      },
      result: {
        url: '', // Will be filled when processing completes
        thumbnailUrl: '', // Will be filled when processing completes
        style,
        watermark: true,
        width: 0,
        height: 0
      },
      ai: {
        model: 'SDXL',
        prompt: aiService.getStylePrompts()[style].prompt,
        negativePrompt: aiService.getStylePrompts()[style].negativePrompt,
        processingTime: 0,
        intensity
      },
      flags: {
        nsfw: req.nsfwCheck.isNSFW,
        faceCount: req.faceDetection.faceCount,
        moderationStatus: 'pending',
        hasFace: req.faceDetection.hasFace,
        multipleFaces: req.faceDetection.multipleFaces
      },
      shareCode,
      jobId,
      status: 'queued'
    });

    await transformation.save();

    // Increment user's transform usage
    await user.incrementTransformUsage();

    // Add job to queue
    const jobResult = await addTransformJob(
      transformation._id,
      uploadResult.url,
      style,
      intensity
    );

    if (!jobResult.success) {
      // Update transformation with error
      transformation.status = 'failed';
      transformation.error = jobResult.error;
      await transformation.save();

      return res.status(500).json({
        success: false,
        message: 'Failed to queue transformation',
        error: jobResult.error
      });
    }

    logger.info(`Transformation created: ${transformation._id} for user: ${userId}`);

    res.json({
      success: true,
      jobId: transformation.jobId,
      status: 'queued',
      estimatedTime: 20,
      transformationId: transformation._id
    });

  } catch (error) {
    logger.error('Create transformation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get transformation status
const getTransformationStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.userId;

    const transformation = await Transformation.findOne({
      jobId,
      userId
    });

    if (!transformation) {
      return res.status(404).json({
        success: false,
        message: 'Transformation not found'
      });
    }

    const response = {
      success: true,
      status: transformation.status,
      transformationId: transformation._id
    };

    if (transformation.status === 'completed') {
      response.result = {
        beforeUrl: transformation.original.url,
        afterUrl: transformation.result.url,
        thumbnailUrl: transformation.result.thumbnailUrl,
        shareUrl: `${process.env.CLIENT_URL}/t/${transformation.shareCode}`,
        style: transformation.result.style,
        processingTime: transformation.ai.processingTime
      };
    } else if (transformation.status === 'failed') {
      response.error = transformation.error;
    }

    res.json(response);

  } catch (error) {
    logger.error('Get transformation status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get transformation history
const getTransformationHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const { cursor, limit = 20 } = req.query;

    const query = { userId };
    
    if (cursor) {
      query._id = { $lt: cursor };
    }

    const transformations = await Transformation.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('result.style result.thumbnailUrl createdAt shareCode status')
      .lean();

    const nextCursor = transformations.length === parseInt(limit) 
      ? transformations[transformations.length - 1]._id 
      : null;

    res.json({
      success: true,
      items: transformations.map(t => ({
        id: t._id,
        style: t.result.style,
        thumbnail: t.result.thumbnailUrl,
        createdAt: t.createdAt,
        shareCode: t.shareCode,
        status: t.status
      })),
      nextCursor
    });

  } catch (error) {
    logger.error('Get transformation history error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get public transformation by share code
const getPublicTransformation = async (req, res) => {
  try {
    const { shareCode } = req.params;

    const transformation = await Transformation.findOne({
      shareCode,
      isPublic: true,
      status: 'completed'
    }).populate('userId', 'username avatar');

    if (!transformation) {
      return res.status(404).json({
        success: false,
        message: 'Transformation not found or not public'
      });
    }

    // Increment view count
    await transformation.incrementViewCount();

    res.json({
      success: true,
      transformation: {
        id: transformation._id,
        beforeUrl: transformation.original.url,
        afterUrl: transformation.result.url,
        style: transformation.result.style,
        createdAt: transformation.createdAt,
        viewCount: transformation.viewCount,
        likeCount: transformation.likeCount,
        user: {
          username: transformation.userId.username,
          avatar: transformation.userId.avatar
        }
      }
    });

  } catch (error) {
    logger.error('Get public transformation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get available styles
const getAvailableStyles = async (req, res) => {
  try {
    const userId = req.userId;
    
    // Get user to check subscription status
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const styles = aiService.getAvailableStyles();
    const styleInfo = {};

    // Get detailed info for each style
    Object.keys(aiService.getStylePrompts()).forEach(style => {
      const info = aiService.getStyleInfo(style);
      if (info) {
        styleInfo[style] = {
          ...info,
          isPremium: aiService.isPremiumStyle(style),
          available: !info.isPremium || user.subscription.status === 'warrior'
        };
      }
    });

    res.json({
      success: true,
      styles: styleInfo,
      userSubscription: user.subscription.status
    });

  } catch (error) {
    logger.error('Get available styles error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  createTransformation,
  getTransformationStatus,
  getTransformationHistory,
  getPublicTransformation,
  getAvailableStyles
};
