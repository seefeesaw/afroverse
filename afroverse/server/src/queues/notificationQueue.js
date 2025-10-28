const Bull = require('bull');
const notificationService = require('../services/notificationService');
const { logger } = require('../utils/logger');

// Create notification queue
const notificationQueue = new Bull('notification queue', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD
  }
});

// Process notification send jobs
notificationQueue.process('send-notification', async (job) => {
  try {
    const { userId, campaignId, channel, payload, options } = job.data;
    
    logger.info(`Processing notification send job: ${campaignId} to ${userId} via ${channel}`);
    
    const result = await notificationService.sendNotification(
      userId,
      campaignId,
      channel,
      payload,
      options
    );
    
    return result;
  } catch (error) {
    logger.error('Notification send job failed:', error);
    throw error;
  }
});

// Process bulk notification jobs
notificationQueue.process('send-bulk', async (job) => {
  try {
    const { campaignId, audience, options } = job.data;
    
    logger.info(`Processing bulk notification job: ${campaignId} to ${audience.length} users`);
    
    const result = await notificationService.sendBulkNotifications(
      campaignId,
      audience,
      options
    );
    
    return result;
  } catch (error) {
    logger.error('Bulk notification job failed:', error);
    throw error;
  }
});

// Process scheduled notifications
notificationQueue.process('process-scheduled', async (job) => {
  try {
    logger.info('Processing scheduled notifications');
    
    const result = await notificationService.processScheduledNotifications();
    
    return result;
  } catch (error) {
    logger.error('Scheduled notifications job failed:', error);
    throw error;
  }
});

// Process retry failed notifications
notificationQueue.process('retry-failed', async (job) => {
  try {
    logger.info('Processing retry failed notifications');
    
    const result = await notificationService.retryFailedNotifications();
    
    return result;
  } catch (error) {
    logger.error('Retry failed notifications job failed:', error);
    throw error;
  }
});

// Streak risk scanner worker
notificationQueue.process('streak-risk-scanner', async (job) => {
  try {
    logger.info('Running streak risk scanner');
    
    const User = require('../models/User');
    const UserNotificationSettings = require('../models/UserNotificationSettings');
    
    // Find users with streak at risk (T-2h to midnight)
    const now = new Date();
    const users = await User.find({
      isActive: true,
      'streak.current': { $gt: 0 }
    }).lean();
    
    const atRiskUsers = [];
    
    for (const user of users) {
      const tz = user.streak?.timezone || 'Africa/Johannesburg';
      const todayLocal = notificationService.toLocalDateString(now, tz);
      
      // Check if user hasn't qualified today
      if (user.streak?.lastCheckedDateLocal !== todayLocal) {
        // Check time to midnight
        const timeToMidnight = notificationService.getTimeUntilMidnight(now, tz);
        
        if (timeToMidnight <= 120) { // 2 hours
          atRiskUsers.push(user);
        }
      }
    }
    
    logger.info(`Found ${atRiskUsers.length} users with streak at risk`);
    
    // Send notifications to at-risk users
    for (const user of atRiskUsers) {
      try {
        const settings = await UserNotificationSettings.findById(user._id);
        if (!settings) continue;
        
        // Check if WhatsApp is enabled
        if (settings.channels.whatsapp.enabled && settings.categories.streak) {
          const timeLeft = notificationService.formatTimeUntilMidnight(
            notificationService.getTimeUntilMidnight(now, tz)
          );
          
          await notificationQueue.add('send-notification', {
            userId: user._id,
            campaignId: 'streak_at_risk',
            channel: 'whatsapp',
            payload: {
              tribe: user.tribe?.name || 'Your Tribe',
              time_left: timeLeft,
              deeplink: `https://afroverse.app/r/streak_${user._id}`
            }
          });
        }
        
        // Check if push is enabled
        if (settings.channels.push.enabled && settings.categories.streak) {
          const timeLeft = notificationService.formatTimeUntilMidnight(
            notificationService.getTimeUntilMidnight(now, tz)
          );
          
          await notificationQueue.add('send-notification', {
            userId: user._id,
            campaignId: 'streak_at_risk',
            channel: 'push',
            payload: {
              tribe: user.tribe?.name || 'Your Tribe',
              time_left: timeLeft,
              deeplink: `afroverse://feed?vote=quick5`
            }
          });
        }
        
        // Always send in-app notification
        if (settings.channels.inapp.enabled && settings.categories.streak) {
          const timeLeft = notificationService.formatTimeUntilMidnight(
            notificationService.getTimeUntilMidnight(now, tz)
          );
          
          await notificationQueue.add('send-notification', {
            userId: user._id,
            campaignId: 'streak_at_risk',
            channel: 'inapp',
            payload: {
              tribe: user.tribe?.name || 'Your Tribe',
              time_left: timeLeft,
              deeplink: `afroverse://feed?vote=quick5`
            }
          });
        }
        
      } catch (error) {
        logger.error(`Error processing streak risk for user ${user._id}:`, error);
      }
    }
    
    return {
      success: true,
      atRiskUsers: atRiskUsers.length,
      notificationsQueued: atRiskUsers.length * 3 // WhatsApp + Push + In-app
    };
    
  } catch (error) {
    logger.error('Streak risk scanner job failed:', error);
    throw error;
  }
});

// Battle window reminder worker
notificationQueue.process('battle-window-reminder', async (job) => {
  try {
    logger.info('Running battle window reminder');
    
    const Battle = require('../models/Battle');
    
    // Find battles with 2 hours left
    const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000);
    const battles = await Battle.find({
      status: 'active',
      'timeline.votingEndsAt': { $lte: twoHoursFromNow }
    }).lean();
    
    logger.info(`Found ${battles.length} battles with 2 hours left`);
    
    // Send reminders to battle participants
    for (const battle of battles) {
      try {
        // Send to challenger
        await notificationQueue.add('send-notification', {
          userId: battle.challenger.userId,
          campaignId: 'battle_2h_left',
          channel: 'push',
          payload: {
            opponent: battle.defender.username,
            margin: battle.votes.challenger - battle.votes.defender,
            deeplink: `afroverse://battle/${battle.shortCode}`
          }
        });
        
        // Send to defender
        await notificationQueue.add('send-notification', {
          userId: battle.defender.userId,
          campaignId: 'battle_2h_left',
          channel: 'push',
          payload: {
            opponent: battle.challenger.username,
            margin: battle.votes.defender - battle.votes.challenger,
            deeplink: `afroverse://battle/${battle.shortCode}`
          }
        });
        
      } catch (error) {
        logger.error(`Error processing battle reminder for ${battle._id}:`, error);
      }
    }
    
    return {
      success: true,
      battlesProcessed: battles.length,
      notificationsQueued: battles.length * 2
    };
    
  } catch (error) {
    logger.error('Battle window reminder job failed:', error);
    throw error;
  }
});

// Job event handlers
notificationQueue.on('completed', (job, result) => {
  logger.info(`Notification job ${job.name} completed`, result);
});

notificationQueue.on('failed', (job, err) => {
  logger.error(`Notification job ${job.name} failed:`, err);
});

notificationQueue.on('stalled', (job) => {
  logger.warn(`Notification job ${job.name} stalled`);
});

// Schedule recurring jobs
const scheduleRecurringJobs = () => {
  // Process scheduled notifications every minute
  notificationQueue.add('process-scheduled', {}, {
    repeat: { cron: '*/1 * * * *' }, // Every minute
    removeOnComplete: 10,
    removeOnFail: 5
  });
  
  // Retry failed notifications every 5 minutes
  notificationQueue.add('retry-failed', {}, {
    repeat: { cron: '*/5 * * * *' }, // Every 5 minutes
    removeOnComplete: 10,
    removeOnFail: 5
  });
  
  // Streak risk scanner every 10 minutes
  notificationQueue.add('streak-risk-scanner', {}, {
    repeat: { cron: '*/10 * * * *' }, // Every 10 minutes
    removeOnComplete: 10,
    removeOnFail: 5
  });
  
  // Battle window reminder every 5 minutes
  notificationQueue.add('battle-window-reminder', {}, {
    repeat: { cron: '*/5 * * * *' }, // Every 5 minutes
    removeOnComplete: 10,
    removeOnFail: 5
  });
  
  logger.info('Notification recurring jobs scheduled');
};

// Initialize schedules
const initializeSchedules = () => {
  scheduleRecurringJobs();
};

// Add notification job
const addNotificationJob = (type, data, options = {}) => {
  return notificationQueue.add(type, data, {
    removeOnComplete: 10,
    removeOnFail: 5,
    ...options
  });
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('Shutting down notification queue...');
  await notificationQueue.close();
});

process.on('SIGINT', async () => {
  logger.info('Shutting down notification queue...');
  await notificationQueue.close();
});

module.exports = {
  notificationQueue,
  initializeSchedules,
  addNotificationJob
};
