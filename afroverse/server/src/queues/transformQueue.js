const Queue = require('bull');
const { redisClient } = require('../config/redis');
const { logger } = require('../utils/logger');

// Create transformation queue
const transformQueue = new Queue('transform', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD
  },
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 5,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  }
});

// Job processor
transformQueue.process('transform-image', async (job) => {
  const { transformationId, imageUrl, style, intensity } = job.data;
  
  logger.info(`Processing transformation job: ${transformationId}`);
  
  try {
    // Import services here to avoid circular dependencies
    const Transformation = require('../models/Transformation');
    const aiService = require('./aiService');
    const imageService = require('./imageService');
    const cloudStorageService = require('./cloudStorageService');
    
    // Update job status
    await job.progress(10);
    
    // Generate AI transformation
    const aiResult = await aiService.generateTransformation(imageUrl, style, intensity);
    
    if (!aiResult.success) {
      throw new Error(`AI generation failed: ${aiResult.error}`);
    }
    
    await job.progress(50);
    
    // Wait for completion
    const completion = await aiService.waitForCompletion(aiResult.predictionId);
    
    if (!completion.success) {
      throw new Error(`AI completion failed: ${completion.error}`);
    }
    
    await job.progress(80);
    
    // Download and process result image
    const resultImageUrl = completion.result[0]; // Replicate returns array of URLs
    
    // Upload to cloud storage
    const cloudResult = await cloudStorageService.uploadFromUrl(
      resultImageUrl,
      `transformations/${transformationId}/result.jpg`
    );
    
    if (!cloudResult.success) {
      throw new Error(`Cloud upload failed: ${cloudResult.error}`);
    }
    
    // Create thumbnail
    const thumbnailResult = await cloudStorageService.createThumbnail(
      cloudResult.url,
      `transformations/${transformationId}/thumbnail.jpg`
    );
    
    await job.progress(90);
    
    // Update transformation record
    const transformation = await Transformation.findById(transformationId);
    if (!transformation) {
      throw new Error('Transformation not found');
    }
    
    transformation.status = 'completed';
    transformation.result.url = cloudResult.url;
    transformation.result.thumbnailUrl = thumbnailResult.url;
    transformation.ai.processingTime = Date.now() - transformation.createdAt.getTime();
    
    await transformation.save();
    
    // Track achievement progress for transformations
    try {
      const achievementService = require('../services/achievementService');
      await achievementService.checkAchievements(transformation.userId, 'transformations', 1);
    } catch (error) {
      logger.error('Error tracking achievement progress:', error);
    }
    
    await job.progress(100);
    
    logger.info(`Transformation completed: ${transformationId}`);
    
    return {
      success: true,
      transformationId,
      resultUrl: cloudResult.url,
      thumbnailUrl: thumbnailResult.url
    };
    
  } catch (error) {
    logger.error(`Transformation job failed: ${transformationId}`, error);
    
    // Update transformation record with error
    try {
      const Transformation = require('../models/Transformation');
      await Transformation.findByIdAndUpdate(transformationId, {
        status: 'failed',
        error: error.message
      });
    } catch (updateError) {
      logger.error('Failed to update transformation with error:', updateError);
    }
    
    throw error;
  }
});

// Job event handlers
transformQueue.on('completed', (job, result) => {
  logger.info(`Job ${job.id} completed:`, result);
});

transformQueue.on('failed', (job, err) => {
  logger.error(`Job ${job.id} failed:`, err);
});

transformQueue.on('stalled', (job) => {
  logger.warn(`Job ${job.id} stalled`);
});

// Add job to queue
const addTransformJob = async (transformationId, imageUrl, style, intensity = 0.8) => {
  try {
    const job = await transformQueue.add('transform-image', {
      transformationId,
      imageUrl,
      style,
      intensity
    }, {
      priority: 1,
      delay: 0
    });
    
    logger.info(`Added transformation job: ${job.id} for transformation: ${transformationId}`);
    
    return {
      success: true,
      jobId: job.id
    };
  } catch (error) {
    logger.error('Failed to add transformation job:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get job status
const getJobStatus = async (jobId) => {
  try {
    const job = await transformQueue.getJob(jobId);
    
    if (!job) {
      return {
        success: false,
        error: 'Job not found'
      };
    }
    
    const state = await job.getState();
    const progress = job.progress();
    
    return {
      success: true,
      status: state,
      progress,
      data: job.data
    };
  } catch (error) {
    logger.error('Failed to get job status:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  transformQueue,
  addTransformJob,
  getJobStatus
};
