const Bull = require('bull');
const leaderboardService = require('../services/leaderboardService');
const { logger } = require('../utils/logger');

// Create leaderboard queue
const leaderboardQueue = new Bull('leaderboard queue', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD
  }
});

// Weekly reset job
leaderboardQueue.process('weekly-reset', async (job) => {
  try {
    logger.info('Starting weekly leaderboard reset job');
    
    const result = await leaderboardService.weeklyReset();
    
    logger.info('Weekly leaderboard reset job completed', result);
    
    return result;
  } catch (error) {
    logger.error('Weekly leaderboard reset job failed:', error);
    throw error;
  }
});

// Reconciliation job
leaderboardQueue.process('reconcile', async (job) => {
  try {
    logger.info('Starting leaderboard reconciliation job');
    
    const result = await leaderboardService.reconcile();
    
    logger.info('Leaderboard reconciliation job completed', result);
    
    return result;
  } catch (error) {
    logger.error('Leaderboard reconciliation job failed:', error);
    throw error;
  }
});

// Schedule weekly reset for Monday 00:00 UTC
const scheduleWeeklyReset = () => {
  // Calculate next Monday 00:00 UTC
  const now = new Date();
  const nextMonday = new Date(now);
  nextMonday.setUTCDate(now.getUTCDate() + (1 + 7 - now.getUTCDay()) % 7);
  nextMonday.setUTCHours(0, 0, 0, 0);
  
  // If it's already Monday 00:00 or past, schedule for next Monday
  if (nextMonday <= now) {
    nextMonday.setUTCDate(nextMonday.getUTCDate() + 7);
  }
  
  leaderboardQueue.add('weekly-reset', {}, {
    repeat: { cron: '0 0 * * 1' }, // Every Monday at 00:00 UTC
    removeOnComplete: 10,
    removeOnFail: 5
  });
  
  logger.info(`Weekly reset scheduled for ${nextMonday.toISOString()}`);
};

// Schedule reconciliation every 5 minutes
const scheduleReconciliation = () => {
  leaderboardQueue.add('reconcile', {}, {
    repeat: { cron: '*/5 * * * *' }, // Every 5 minutes
    removeOnComplete: 10,
    removeOnFail: 5
  });
  
  logger.info('Reconciliation scheduled every 5 minutes');
};

// Initialize schedules
const initializeSchedules = () => {
  scheduleWeeklyReset();
  scheduleReconciliation();
};

// Job event handlers
leaderboardQueue.on('completed', (job, result) => {
  logger.info(`Leaderboard job ${job.name} completed`, result);
});

leaderboardQueue.on('failed', (job, err) => {
  logger.error(`Leaderboard job ${job.name} failed:`, err);
});

leaderboardQueue.on('stalled', (job) => {
  logger.warn(`Leaderboard job ${job.name} stalled`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('Shutting down leaderboard queue...');
  await leaderboardQueue.close();
});

process.on('SIGINT', async () => {
  logger.info('Shutting down leaderboard queue...');
  await leaderboardQueue.close();
});

module.exports = {
  leaderboardQueue,
  initializeSchedules
};
