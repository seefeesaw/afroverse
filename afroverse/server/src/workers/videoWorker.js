const Queue = require('bull');
const Redis = require('redis');
const videoProcessingService = require('../services/videoProcessingService');
const fullBodyVideoProcessingService = require('../services/fullBodyVideoProcessingService');
const { logger } = require('../utils/logger');

// Redis connection
const redis = Redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  retry_strategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      return new Error('The server refused the connection');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      return new Error('Retry time exhausted');
    }
    if (options.attempt > 10) {
      return undefined;
    }
    return Math.min(options.attempt * 100, 3000);
  }
});

// Create video processing queue
const videoQueue = new Queue('video processing', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
  },
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 5,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

// Video processing worker
videoQueue.process('create-video', 4, async (job) => {
  const { videoId, imageBuffer, options } = job.data;
  
  logger.info(`Processing video job ${job.id} for video ${videoId}`);
  
  try {
    // Update job progress
    await job.progress(0);
    
    // Process the video
    await videoProcessingService.processVideoJob(videoId, imageBuffer);
    
    // Mark job as completed
    await job.progress(100);
    
    logger.info(`Video job ${job.id} completed successfully`);
    
    return { success: true, videoId };
    
  } catch (error) {
    logger.error(`Video job ${job.id} failed:`, error);
    throw error;
  }
});

// Video cleanup worker (runs periodically)
videoQueue.process('cleanup-videos', 1, async (job) => {
  logger.info('Running video cleanup job');
  
  try {
    // Clean up old temporary files
    await videoProcessingService.cleanupOldTempFiles();
    
    // Clean up failed jobs older than 24 hours
    await videoProcessingService.cleanupFailedJobs();
    
    logger.info('Video cleanup job completed');
    
    return { success: true };
    
  } catch (error) {
    logger.error('Video cleanup job failed:', error);
    throw error;
  }
});

// Full-body video processing worker
videoQueue.process('processFullBodyVideo', 2, async (job) => {
  logger.info(`Processing full-body video job ${job.id} for user ${job.data.userId}`);
  
  try {
    const result = await fullBodyVideoProcessingService.processFullBodyVideoJob(job);
    logger.info(`Full-body video job ${job.id} completed successfully`);
    return result;
  } catch (error) {
    logger.error(`Full-body video job ${job.id} failed: ${error.message}`, { stack: error.stack });
    throw error;
  }
});

// Video analytics worker (runs hourly)
videoQueue.process('video-analytics', 1, async (job) => {
  logger.info('Running video analytics job');
  
  try {
    // Update video engagement metrics
    await videoProcessingService.updateVideoAnalytics();
    
    // Generate video performance reports
    await videoProcessingService.generateVideoReports();
    
    logger.info('Video analytics job completed');
    
    return { success: true };
    
  } catch (error) {
    logger.error('Video analytics job failed:', error);
    throw error;
  }
});

// Queue event handlers
videoQueue.on('completed', (job, result) => {
  logger.info(`Video job ${job.id} completed:`, result);
});

videoQueue.on('failed', (job, err) => {
  logger.error(`Video job ${job.id} failed:`, err);
});

videoQueue.on('stalled', (job) => {
  logger.warn(`Video job ${job.id} stalled`);
});

videoQueue.on('progress', (job, progress) => {
  logger.info(`Video job ${job.id} progress: ${progress}%`);
});

// Add full-body video job
const addFullBodyVideoJob = async (userId, options) => {
  const job = await videoQueue.add('processFullBodyVideo', {
    userId,
    ...options,
    timestamp: Date.now()
  }, {
    priority: options.priority || 5,
    delay: options.delay || 0,
    jobId: `fullbody_${userId}_${Date.now()}`
  });
  
  logger.info(`Added full-body video job ${job.id} for user ${userId}`);
  return job;
};

// Add video creation job
const addVideoJob = async (videoId, imageBuffer = null, options = {}) => {
  const job = await videoQueue.add('create-video', {
    videoId,
    imageBuffer,
    options,
    timestamp: Date.now()
  }, {
    priority: options.priority || 0,
    delay: options.delay || 0,
    jobId: `video_${videoId}_${Date.now()}`
  });
  
  logger.info(`Added video job ${job.id} for video ${videoId}`);
  return job;
};

// Add cleanup job (runs every 6 hours)
const addCleanupJob = async () => {
  const job = await videoQueue.add('cleanup-videos', {}, {
    repeat: { cron: '0 */6 * * *' }, // Every 6 hours
    jobId: 'video-cleanup'
  });
  
  logger.info(`Added video cleanup job ${job.id}`);
  return job;
};

// Add analytics job (runs every hour)
const addAnalyticsJob = async () => {
  const job = await videoQueue.add('video-analytics', {}, {
    repeat: { cron: '0 * * * *' }, // Every hour
    jobId: 'video-analytics'
  });
  
  logger.info(`Added video analytics job ${job.id}`);
  return job;
};

// Get queue statistics
const getQueueStats = async () => {
  const waiting = await videoQueue.getWaiting();
  const active = await videoQueue.getActive();
  const completed = await videoQueue.getCompleted();
  const failed = await videoQueue.getFailed();
  
  return {
    waiting: waiting.length,
    active: active.length,
    completed: completed.length,
    failed: failed.length,
    total: waiting.length + active.length + completed.length + failed.length
  };
};

// Pause queue
const pauseQueue = async () => {
  await videoQueue.pause();
  logger.info('Video queue paused');
};

// Resume queue
const resumeQueue = async () => {
  await videoQueue.resume();
  logger.info('Video queue resumed');
};

// Clear queue
const clearQueue = async () => {
  await videoQueue.empty();
  logger.info('Video queue cleared');
};

// Initialize queue with scheduled jobs
const initializeQueue = async () => {
  try {
    // Add scheduled jobs if they don't exist
    await addCleanupJob();
    await addAnalyticsJob();
    
    logger.info('Video queue initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize video queue:', error);
  }
};

// Graceful shutdown
const shutdown = async () => {
  logger.info('Shutting down video queue...');
  
  try {
    await videoQueue.close();
    await redis.quit();
    logger.info('Video queue shutdown complete');
  } catch (error) {
    logger.error('Error during video queue shutdown:', error);
  }
};

module.exports = {
  videoQueue,
  addVideoJob,
  addFullBodyVideoJob,
  addCleanupJob,
  addAnalyticsJob,
  getQueueStats,
  pauseQueue,
  resumeQueue,
  clearQueue,
  initializeQueue,
  shutdown
};
