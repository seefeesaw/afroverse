const Bull = require('bull');
const User = require('../models/User');
const { logger } = require('../utils/logger');

// Create progression queue
const progressionQueue = new Bull('progression queue', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD
  }
});

// Daily freeze grant job
progressionQueue.process('daily-freeze-grant', async (job) => {
  try {
    logger.info('Starting daily freeze grant job');
    
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    // Find users who haven't received a freeze in the last 30 days
    const users = await User.find({
      $or: [
        { 'streak.freeze.lastGrantedAt': { $lt: thirtyDaysAgo } },
        { 'streak.freeze.lastGrantedAt': { $exists: false } }
      ]
    }).select('_id streak.freeze').lean();
    
    let grantedCount = 0;
    
    for (const user of users) {
      try {
        await User.findByIdAndUpdate(user._id, {
          $inc: { 'streak.freeze.available': 1 },
          $set: { 'streak.freeze.lastGrantedAt': now }
        });
        
        grantedCount++;
        logger.info(`Granted freeze to user ${user._id}`);
      } catch (error) {
        logger.error(`Failed to grant freeze to user ${user._id}:`, error);
      }
    }
    
    logger.info(`Daily freeze grant completed. Granted ${grantedCount} freezes`);
    
    return {
      success: true,
      grantedCount,
      processedAt: now
    };
  } catch (error) {
    logger.error('Daily freeze grant job failed:', error);
    throw error;
  }
});

// Schedule daily freeze grant for 02:00 UTC
const scheduleDailyFreezeGrant = () => {
  progressionQueue.add('daily-freeze-grant', {}, {
    repeat: { cron: '0 2 * * *' }, // Every day at 02:00 UTC
    removeOnComplete: 10,
    removeOnFail: 5
  });
  
  logger.info('Daily freeze grant scheduled for 02:00 UTC');
};

// Job event handlers
progressionQueue.on('completed', (job, result) => {
  logger.info(`Progression job ${job.name} completed`, result);
});

progressionQueue.on('failed', (job, err) => {
  logger.error(`Progression job ${job.name} failed:`, err);
});

progressionQueue.on('stalled', (job) => {
  logger.warn(`Progression job ${job.name} stalled`);
});

// Initialize schedules
const initializeSchedules = () => {
  scheduleDailyFreezeGrant();
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('Shutting down progression queue...');
  await progressionQueue.close();
});

process.on('SIGINT', async () => {
  logger.info('Shutting down progression queue...');
  await progressionQueue.close();
});

module.exports = {
  progressionQueue,
  initializeSchedules
};
