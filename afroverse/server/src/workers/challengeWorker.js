const Queue = require('bull');
const Redis = require('redis');
const challengeService = require('../services/challengeService');
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

// Create challenge processing queue
const challengeQueue = new Queue('challenge processing', {
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

// Daily challenge creation worker (runs at midnight)
challengeQueue.process('create-daily-challenge', 1, async (job) => {
  const { date } = job.data;
  
  logger.info(`Creating daily challenge for ${date || 'today'}`);

  try {
    await job.progress(10);
    
    const challenge = await challengeService.createTodaysDailyChallenge(date ? new Date(date) : new Date());
    
    await job.progress(50);
    
    // Notify all users about the new daily challenge
    // This could be expanded to send push notifications
    
    await job.progress(100);
    
    logger.info(`Daily challenge created: ${challenge.title}`);
    
    return { success: true, challengeId: challenge._id, title: challenge.title };

  } catch (error) {
    logger.error(`Daily challenge creation failed:`, error);
    throw error;
  }
});

// Weekly challenge creation worker (runs on Sunday at midnight)
challengeQueue.process('create-weekly-challenge', 1, async (job) => {
  const { date } = job.data;
  
  logger.info(`Creating weekly challenge for ${date || 'this week'}`);

  try {
    await job.progress(10);
    
    const challenge = await challengeService.createWeeklyChallenge(date ? new Date(date) : new Date());
    
    await job.progress(50);
    
    // Reset all tribe weekly challenge scores
    await challengeService.resetWeeklyChallenges();
    
    await job.progress(100);
    
    logger.info(`Weekly challenge created: ${challenge.title}`);
    
    return { success: true, challengeId: challenge._id, title: challenge.title };

  } catch (error) {
    logger.error(`Weekly challenge creation failed:`, error);
    throw error;
  }
});

// Weekly challenge winner processing worker (runs on Monday at 6 AM)
challengeQueue.process('process-weekly-winners', 1, async (job) => {
  logger.info('Processing weekly challenge winners');

  try {
    await job.progress(10);
    
    await challengeService.processWeeklyChallengeWinners();
    
    await job.progress(100);
    
    logger.info('Weekly challenge winners processed successfully');
    
    return { success: true };

  } catch (error) {
    logger.error('Weekly challenge winner processing failed:', error);
    throw error;
  }
});

// Challenge progress update worker
challengeQueue.process('update-challenge-progress', 5, async (job) => {
  const { userId, activityType, value, metadata } = job.data;
  
  logger.info(`Updating challenge progress for user ${userId}: ${activityType}`);

  try {
    await job.progress(10);
    
    const result = await challengeService.updateChallengeProgress(userId, activityType, value, metadata);
    
    await job.progress(100);
    
    logger.info(`Challenge progress updated for user ${userId}`);
    
    return { success: true, result };

  } catch (error) {
    logger.error(`Challenge progress update failed for user ${userId}:`, error);
    throw error;
  }
});

// Streak maintenance worker (runs daily at 1 AM)
challengeQueue.process('maintain-streaks', 1, async (job) => {
  logger.info('Running streak maintenance');

  try {
    await job.progress(10);
    
    const User = require('../models/User');
    const users = await User.find({}).select('_id challenges');
    
    let processedCount = 0;
    const totalUsers = users.length;
    
    for (const user of users) {
      try {
        // Check if user's daily streak needs updating
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const lastActive = user.challenges.dailyStreak.lastActiveAt;
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastActive && lastActive < yesterday) {
          // Streak broken - reset to 0
          user.challenges.dailyStreak.current = 0;
          await user.save();
        }
        
        processedCount++;
        await job.progress(10 + (processedCount / totalUsers) * 80);
        
      } catch (userError) {
        logger.error(`Error processing streak for user ${user._id}:`, userError);
      }
    }
    
    await job.progress(100);
    
    logger.info(`Streak maintenance completed for ${processedCount} users`);
    
    return { success: true, processedCount };

  } catch (error) {
    logger.error('Streak maintenance failed:', error);
    throw error;
  }
});

// Challenge analytics worker (runs hourly)
challengeQueue.process('update-challenge-analytics', 1, async (job) => {
  logger.info('Updating challenge analytics');

  try {
    await job.progress(10);
    
    const Challenge = require('../models/Challenge');
    const UserChallenge = require('../models/UserChallenge');
    
    // Get all active challenges
    const activeChallenges = await Challenge.find({ isActive: true });
    
    for (const challenge of activeChallenges) {
      try {
        // Get completion statistics
        const stats = await UserChallenge.getChallengeStats(challenge._id);
        
        if (stats.length > 0) {
          const stat = stats[0];
          challenge.totalParticipants = stat.totalParticipants;
          challenge.completionRate = stat.totalParticipants > 0 
            ? (stat.completedCount / stat.totalParticipants) * 100 
            : 0;
          
          await challenge.save();
        }
        
      } catch (challengeError) {
        logger.error(`Error updating analytics for challenge ${challenge._id}:`, challengeError);
      }
    }
    
    await job.progress(100);
    
    logger.info('Challenge analytics updated successfully');
    
    return { success: true };

  } catch (error) {
    logger.error('Challenge analytics update failed:', error);
    throw error;
  }
});

// Queue event handlers
challengeQueue.on('completed', (job, result) => {
  logger.info(`Challenge job ${job.id} completed:`, result);
});

challengeQueue.on('failed', (job, err) => {
  logger.error(`Challenge job ${job.id} failed:`, err);
});

challengeQueue.on('stalled', (job) => {
  logger.warn(`Challenge job ${job.id} stalled`);
});

challengeQueue.on('progress', (job, progress) => {
  logger.info(`Challenge job ${job.id} progress: ${progress}%`);
});

// Add daily challenge creation job (runs daily at midnight)
const addDailyChallengeJob = async (date) => {
  const job = await challengeQueue.add('create-daily-challenge', {
    date: date ? date.toISOString() : new Date().toISOString(),
    timestamp: Date.now()
  }, {
    priority: 1,
    delay: 0,
    jobId: `daily-challenge-${date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}`
  });

  logger.info(`Added daily challenge job ${job.id}`);
  return job;
};

// Add weekly challenge creation job (runs on Sunday at midnight)
const addWeeklyChallengeJob = async (date) => {
  const job = await challengeQueue.add('create-weekly-challenge', {
    date: date ? date.toISOString() : new Date().toISOString(),
    timestamp: Date.now()
  }, {
    priority: 1,
    delay: 0,
    jobId: `weekly-challenge-${date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}`
  });

  logger.info(`Added weekly challenge job ${job.id}`);
  return job;
};

// Add weekly winner processing job (runs on Monday at 6 AM)
const addWeeklyWinnerJob = async () => {
  const job = await challengeQueue.add('process-weekly-winners', {}, {
    priority: 2,
    delay: 0,
    jobId: 'weekly-winner-processing'
  });

  logger.info(`Added weekly winner job ${job.id}`);
  return job;
};

// Add challenge progress update job
const addChallengeProgressJob = async (userId, activityType, value, metadata = {}) => {
  const job = await challengeQueue.add('update-challenge-progress', {
    userId,
    activityType,
    value,
    metadata,
    timestamp: Date.now()
  }, {
    priority: 3,
    delay: 0,
    jobId: `challenge-progress-${userId}-${Date.now()}`
  });

  logger.info(`Added challenge progress job ${job.id} for user ${userId}`);
  return job;
};

// Add streak maintenance job (runs daily at 1 AM)
const addStreakMaintenanceJob = async () => {
  const job = await challengeQueue.add('maintain-streaks', {}, {
    repeat: { cron: '0 1 * * *' }, // Daily at 1 AM
    jobId: 'streak-maintenance'
  });

  logger.info(`Added streak maintenance job ${job.id}`);
  return job;
};

// Add analytics update job (runs hourly)
const addAnalyticsJob = async () => {
  const job = await challengeQueue.add('update-challenge-analytics', {}, {
    repeat: { cron: '0 * * * *' }, // Every hour
    jobId: 'challenge-analytics'
  });

  logger.info(`Added challenge analytics job ${job.id}`);
  return job;
};

// Get queue statistics
const getQueueStats = async () => {
  const waiting = await challengeQueue.getWaiting();
  const active = await challengeQueue.getActive();
  const completed = await challengeQueue.getCompleted();
  const failed = await challengeQueue.getFailed();

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
  await challengeQueue.pause();
  logger.info('Challenge queue paused');
};

// Resume queue
const resumeQueue = async () => {
  await challengeQueue.resume();
  logger.info('Challenge queue resumed');
};

// Clear queue
const clearQueue = async () => {
  await challengeQueue.empty();
  logger.info('Challenge queue cleared');
};

// Initialize queue with scheduled jobs
const initializeQueue = async () => {
  try {
    // Add scheduled jobs if they don't exist
    await addStreakMaintenanceJob();
    await addAnalyticsJob();
    
    // Create today's challenges if they don't exist
    await addDailyChallengeJob();
    
    // Create this week's challenge if it doesn't exist
    const now = new Date();
    if (now.getDay() === 0) { // Sunday
      await addWeeklyChallengeJob();
    }

    logger.info('Challenge queue initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize challenge queue:', error);
  }
};

// Graceful shutdown
const shutdown = async () => {
  logger.info('Shutting down challenge queue...');

  try {
    await challengeQueue.close();
    await redis.quit();
    logger.info('Challenge queue shutdown complete');
  } catch (error) {
    logger.error('Error during challenge queue shutdown:', error);
  }
};

module.exports = {
  challengeQueue,
  addDailyChallengeJob,
  addWeeklyChallengeJob,
  addWeeklyWinnerJob,
  addChallengeProgressJob,
  addStreakMaintenanceJob,
  addAnalyticsJob,
  getQueueStats,
  pauseQueue,
  resumeQueue,
  clearQueue,
  initializeQueue,
  shutdown
};
