const Queue = require('bull');
const Redis = require('redis');
const referralService = require('../services/referralService');
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

// Create referral processing queue
const referralQueue = new Queue('referral processing', {
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

// Referral processing worker
referralQueue.process('process-referral', 2, async (job) => {
  const { referralId, referrerId, referredUserId } = job.data;
  
  logger.info(`Processing referral job ${job.id} for referral ${referralId}`);
  
  try {
    // Update job progress
    await job.progress(10);
    
    // Process the referral completion
    await referralService.processReferralCompletion(referralId);
    
    await job.progress(100);
    
    logger.info(`Referral job ${job.id} completed successfully`);
    
    return { success: true, referralId };
    
  } catch (error) {
    logger.error(`Referral job ${job.id} failed:`, error);
    throw error;
  }
});

// Referral cleanup worker (runs daily)
referralQueue.process('cleanup-referrals', 1, async (job) => {
  logger.info('Running referral cleanup job');
  
  try {
    // Clean up expired referrals
    await referralService.cleanupExpiredReferrals();
    
    // Reset daily invite counts
    await referralService.resetDailyInviteCounts();
    
    logger.info('Referral cleanup job completed');
    
    return { success: true };
    
  } catch (error) {
    logger.error('Referral cleanup job failed:', error);
    throw error;
  }
});

// Referral analytics worker (runs hourly)
referralQueue.process('referral-analytics', 1, async (job) => {
  logger.info('Running referral analytics job');
  
  try {
    // Update referral statistics
    await referralService.updateReferralAnalytics();
    
    // Generate referral reports
    await referralService.generateReferralReports();
    
    logger.info('Referral analytics job completed');
    
    return { success: true };
    
  } catch (error) {
    logger.error('Referral analytics job failed:', error);
    throw error;
  }
});

// Tribe referral pressure worker (runs every 6 hours)
referralQueue.process('tribe-referral-pressure', 1, async (job) => {
  logger.info('Running tribe referral pressure job');
  
  try {
    // Check tribe rankings and send pressure messages
    await referralService.sendTribeReferralPressure();
    
    // Update tribe multipliers based on referrals
    await referralService.updateTribeMultipliers();
    
    logger.info('Tribe referral pressure job completed');
    
    return { success: true };
    
  } catch (error) {
    logger.error('Tribe referral pressure job failed:', error);
    throw error;
  }
});

// Queue event handlers
referralQueue.on('completed', (job, result) => {
  logger.info(`Referral job ${job.id} completed:`, result);
});

referralQueue.on('failed', (job, err) => {
  logger.error(`Referral job ${job.id} failed:`, err);
});

referralQueue.on('stalled', (job) => {
  logger.warn(`Referral job ${job.id} stalled`);
});

referralQueue.on('progress', (job, progress) => {
  logger.info(`Referral job ${job.id} progress: ${progress}%`);
});

// Add referral processing job
const addReferralJob = async (referralId, referrerId, referredUserId) => {
  const job = await referralQueue.add('process-referral', {
    referralId,
    referrerId,
    referredUserId,
    timestamp: Date.now()
  }, {
    priority: 1, // High priority for referral processing
    delay: 0,
    jobId: `referral_${referralId}_${Date.now()}`
  });
  
  logger.info(`Added referral job ${job.id} for referral ${referralId}`);
  return job;
};

// Add cleanup job (runs daily at midnight)
const addCleanupJob = async () => {
  const job = await referralQueue.add('cleanup-referrals', {}, {
    repeat: { cron: '0 0 * * *' }, // Daily at midnight
    jobId: 'referral-cleanup'
  });
  
  logger.info(`Added referral cleanup job ${job.id}`);
  return job;
};

// Add analytics job (runs every hour)
const addAnalyticsJob = async () => {
  const job = await referralQueue.add('referral-analytics', {}, {
    repeat: { cron: '0 * * * *' }, // Every hour
    jobId: 'referral-analytics'
  });
  
  logger.info(`Added referral analytics job ${job.id}`);
  return job;
};

// Add tribe pressure job (runs every 6 hours)
const addTribePressureJob = async () => {
  const job = await referralQueue.add('tribe-referral-pressure', {}, {
    repeat: { cron: '0 */6 * * *' }, // Every 6 hours
    jobId: 'tribe-referral-pressure'
  });
  
  logger.info(`Added tribe referral pressure job ${job.id}`);
  return job;
};

// Get queue statistics
const getQueueStats = async () => {
  const waiting = await referralQueue.getWaiting();
  const active = await referralQueue.getActive();
  const completed = await referralQueue.getCompleted();
  const failed = await referralQueue.getFailed();
  
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
  await referralQueue.pause();
  logger.info('Referral queue paused');
};

// Resume queue
const resumeQueue = async () => {
  await referralQueue.resume();
  logger.info('Referral queue resumed');
};

// Clear queue
const clearQueue = async () => {
  await referralQueue.empty();
  logger.info('Referral queue cleared');
};

// Initialize queue with scheduled jobs
const initializeQueue = async () => {
  try {
    // Add scheduled jobs if they don't exist
    await addCleanupJob();
    await addAnalyticsJob();
    await addTribePressureJob();
    
    logger.info('Referral queue initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize referral queue:', error);
  }
};

// Graceful shutdown
const shutdown = async () => {
  logger.info('Shutting down referral queue...');
  
  try {
    await referralQueue.close();
    await redis.quit();
    logger.info('Referral queue shutdown complete');
  } catch (error) {
    logger.error('Error during referral queue shutdown:', error);
  }
};

module.exports = {
  referralQueue,
  addReferralJob,
  addCleanupJob,
  addAnalyticsJob,
  addTribePressureJob,
  getQueueStats,
  pauseQueue,
  resumeQueue,
  clearQueue,
  initializeQueue,
  shutdown
};
