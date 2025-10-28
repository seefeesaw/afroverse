const Queue = require('bull');
const Redis = require('redis');
const eventsService = require('../services/eventsService');
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

// Create event processing queue
const eventQueue = new Queue('event processing', {
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

// Clan War creation worker (runs every Monday at 7 AM)
eventQueue.process('create-clan-war', 1, async (job) => {
  const { startDate } = job.data;
  
  logger.info(`Creating clan war for ${startDate || 'this week'}`);

  try {
    await job.progress(10);
    
    const event = await eventsService.createClanWar(startDate ? new Date(startDate) : new Date());
    
    await job.progress(50);
    
    // Send notifications to all users about the new clan war
    const User = require('../models/User');
    const users = await User.find({});
    
    for (const user of users) {
      await require('../services/notificationService').createNotification(user._id, {
        type: 'clan_war_started',
        title: `🔥 Clan War Started!`,
        message: `${event.title} - Contribute to your tribe's victory!`,
        deeplink: '/app/events',
      });
    }
    
    await job.progress(100);
    
    logger.info(`Clan war created: ${event.title}`);
    
    return { success: true, eventId: event._id, title: event.title };

  } catch (error) {
    logger.error(`Clan war creation failed:`, error);
    throw error;
  }
});

// Power Hour creation worker (runs daily at 6 PM)
eventQueue.process('create-power-hour', 1, async (job) => {
  const { date } = job.data;
  
  logger.info(`Creating power hour for ${date || 'today'}`);

  try {
    await job.progress(10);
    
    const event = await eventsService.createPowerHour(date ? new Date(date) : new Date());
    
    await job.progress(50);
    
    // Schedule notification job for 5 minutes before power hour
    await eventQueue.add('send-power-hour-notification', {
      eventId: event._id,
    }, {
      delay: event.startAt.getTime() - Date.now() - (5 * 60 * 1000), // 5 minutes before
    });
    
    await job.progress(100);
    
    logger.info(`Power hour created: ${event.title}`);
    
    return { success: true, eventId: event._id, title: event.title };

  } catch (error) {
    logger.error(`Power hour creation failed:`, error);
    throw error;
  }
});

// Power Hour notification worker
eventQueue.process('send-power-hour-notification', 1, async (job) => {
  const { eventId } = job.data;
  
  logger.info(`Sending power hour notification for event ${eventId}`);

  try {
    await job.progress(10);
    
    await eventsService.sendPowerHourNotification();
    
    await job.progress(100);
    
    logger.info('Power hour notification sent successfully');
    
    return { success: true };

  } catch (error) {
    logger.error('Power hour notification failed:', error);
    throw error;
  }
});

// Clan War completion worker (runs every Sunday at midnight)
eventQueue.process('complete-clan-war', 1, async (job) => {
  logger.info('Processing clan war completion');

  try {
    await job.progress(10);
    
    await eventsService.processClanWarCompletion();
    
    await job.progress(100);
    
    logger.info('Clan war completion processed successfully');
    
    return { success: true };

  } catch (error) {
    logger.error('Clan war completion failed:', error);
    throw error;
  }
});

// Event score update worker
eventQueue.process('update-event-score', 5, async (job) => {
  const { userId, activityType, value, metadata } = job.data;
  
  logger.info(`Updating event score for user ${userId}: ${activityType}`);

  try {
    await job.progress(10);
    
    // Update clan war score
    await eventsService.updateClanWarScore(userId, activityType, value, metadata);
    
    // Update user event participation
    const Event = require('../models/Event');
    const currentWar = await Event.getCurrentClanWar();
    const powerHour = await Event.getTodaysPowerHour();
    
    if (currentWar) {
      await eventsService.updateUserEventParticipation(userId, currentWar._id, activityType, value, {
        xpEarned: metadata.xpEarned || 0,
        clanPointsEarned: metadata.clanPointsEarned || 0,
        coinsEarned: metadata.coinsEarned || 0,
      });
    }
    
    if (powerHour && powerHour.isCurrentlyActive) {
      await eventsService.updateUserEventParticipation(userId, powerHour._id, activityType, value, {
        xpEarned: metadata.xpEarned || 0,
        clanPointsEarned: metadata.clanPointsEarned || 0,
        coinsEarned: metadata.coinsEarned || 0,
      });
    }
    
    await job.progress(100);
    
    logger.info(`Event score updated for user ${userId}`);
    
    return { success: true };

  } catch (error) {
    logger.error(`Event score update failed for user ${userId}:`, error);
    throw error;
  }
});

// Event analytics worker (runs hourly)
eventQueue.process('update-event-analytics', 1, async (job) => {
  logger.info('Updating event analytics');

  try {
    await job.progress(10);
    
    const Event = require('../models/Event');
    const UserEvent = require('../models/UserEvent');
    
    // Get all active events
    const activeEvents = await Event.find({ status: 'active' });
    
    for (const event of activeEvents) {
      try {
        // Get participation statistics
        const stats = await UserEvent.getEventParticipationStats(event._id);
        
        if (stats.length > 0) {
          const stat = stats[0];
          event.participationStats.totalParticipants = stat.totalParticipants;
          event.participationStats.totalActions = stat.totalActions;
          event.participationStats.averageEngagement = stat.averageActionsPerUser;
          
          await event.save();
        }
        
      } catch (eventError) {
        logger.error(`Error updating analytics for event ${event._id}:`, eventError);
      }
    }
    
    await job.progress(100);
    
    logger.info('Event analytics updated successfully');
    
    return { success: true };

  } catch (error) {
    logger.error('Event analytics update failed:', error);
    throw error;
  }
});

// Event cleanup worker (runs daily at 2 AM)
eventQueue.process('cleanup-events', 1, async (job) => {
  logger.info('Running event cleanup');

  try {
    await job.progress(10);
    
    const Event = require('../models/Event');
    const UserEvent = require('../models/UserEvent');
    
    // Clean up old completed events (older than 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const oldEvents = await Event.find({
      status: 'completed',
      endAt: { $lt: thirtyDaysAgo },
    });
    
    for (const event of oldEvents) {
      // Archive user event participations
      await UserEvent.updateMany(
        { eventId: event._id },
        { $set: { isActive: false } }
      );
      
      // Delete the event
      await Event.findByIdAndDelete(event._id);
    }
    
    await job.progress(100);
    
    logger.info(`Cleaned up ${oldEvents.length} old events`);
    
    return { success: true, cleanedCount: oldEvents.length };

  } catch (error) {
    logger.error('Event cleanup failed:', error);
    throw error;
  }
});

// Queue event handlers
eventQueue.on('completed', (job, result) => {
  logger.info(`Event job ${job.id} completed:`, result);
});

eventQueue.on('failed', (job, err) => {
  logger.error(`Event job ${job.id} failed:`, err);
});

eventQueue.on('stalled', (job) => {
  logger.warn(`Event job ${job.id} stalled`);
});

eventQueue.on('progress', (job, progress) => {
  logger.info(`Event job ${job.id} progress: ${progress}%`);
});

// Add clan war creation job (runs every Monday at 7 AM)
const addClanWarJob = async (startDate) => {
  const job = await eventQueue.add('create-clan-war', {
    startDate: startDate ? startDate.toISOString() : new Date().toISOString(),
    timestamp: Date.now()
  }, {
    priority: 1,
    delay: 0,
    jobId: `clan-war-${startDate ? startDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}`
  });

  logger.info(`Added clan war job ${job.id}`);
  return job;
};

// Add power hour creation job (runs daily at 6 PM)
const addPowerHourJob = async (date) => {
  const job = await eventQueue.add('create-power-hour', {
    date: date ? date.toISOString() : new Date().toISOString(),
    timestamp: Date.now()
  }, {
    priority: 1,
    delay: 0,
    jobId: `power-hour-${date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}`
  });

  logger.info(`Added power hour job ${job.id}`);
  return job;
};

// Add event score update job
const addEventScoreJob = async (userId, activityType, value, metadata = {}) => {
  const job = await eventQueue.add('update-event-score', {
    userId,
    activityType,
    value,
    metadata,
    timestamp: Date.now()
  }, {
    priority: 3,
    delay: 0,
    jobId: `event-score-${userId}-${Date.now()}`
  });

  logger.info(`Added event score job ${job.id} for user ${userId}`);
  return job;
};

// Add clan war completion job (runs every Sunday at midnight)
const addClanWarCompletionJob = async () => {
  const job = await eventQueue.add('complete-clan-war', {}, {
    repeat: { cron: '0 0 * * 0' }, // Every Sunday at midnight
    jobId: 'clan-war-completion'
  });

  logger.info(`Added clan war completion job ${job.id}`);
  return job;
};

// Add power hour creation job (runs daily at 6 PM)
const addPowerHourCreationJob = async () => {
  const job = await eventQueue.add('create-power-hour', {}, {
    repeat: { cron: '0 18 * * *' }, // Daily at 6 PM
    jobId: 'power-hour-creation'
  });

  logger.info(`Added power hour creation job ${job.id}`);
  return job;
};

// Add analytics update job (runs hourly)
const addAnalyticsJob = async () => {
  const job = await eventQueue.add('update-event-analytics', {}, {
    repeat: { cron: '0 * * * *' }, // Every hour
    jobId: 'event-analytics'
  });

  logger.info(`Added event analytics job ${job.id}`);
  return job;
};

// Add cleanup job (runs daily at 2 AM)
const addCleanupJob = async () => {
  const job = await eventQueue.add('cleanup-events', {}, {
    repeat: { cron: '0 2 * * *' }, // Daily at 2 AM
    jobId: 'event-cleanup'
  });

  logger.info(`Added event cleanup job ${job.id}`);
  return job;
};

// Get queue statistics
const getQueueStats = async () => {
  const waiting = await eventQueue.getWaiting();
  const active = await eventQueue.getActive();
  const completed = await eventQueue.getCompleted();
  const failed = await eventQueue.getFailed();

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
  await eventQueue.pause();
  logger.info('Event queue paused');
};

// Resume queue
const resumeQueue = async () => {
  await eventQueue.resume();
  logger.info('Event queue resumed');
};

// Clear queue
const clearQueue = async () => {
  await eventQueue.empty();
  logger.info('Event queue cleared');
};

// Initialize queue with scheduled jobs
const initializeQueue = async () => {
  try {
    // Add scheduled jobs if they don't exist
    await addClanWarCompletionJob();
    await addPowerHourCreationJob();
    await addAnalyticsJob();
    await addCleanupJob();
    
    // Create today's power hour if it doesn't exist
    await addPowerHourJob();
    
    // Create this week's clan war if it doesn't exist
    const now = new Date();
    if (now.getDay() === 1) { // Monday
      await addClanWarJob();
    }

    logger.info('Event queue initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize event queue:', error);
  }
};

// Graceful shutdown
const shutdown = async () => {
  logger.info('Shutting down event queue...');

  try {
    await eventQueue.close();
    await redis.quit();
    logger.info('Event queue shutdown complete');
  } catch (error) {
    logger.error('Error during event queue shutdown:', error);
  }
};

module.exports = {
  eventQueue,
  addClanWarJob,
  addPowerHourJob,
  addEventScoreJob,
  addClanWarCompletionJob,
  addPowerHourCreationJob,
  addAnalyticsJob,
  addCleanupJob,
  getQueueStats,
  pauseQueue,
  resumeQueue,
  clearQueue,
  initializeQueue,
  shutdown
};
