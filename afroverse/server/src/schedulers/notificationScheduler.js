const cron = require('node-cron');
const notificationService = require('../services/notificationService');
const User = require('../models/User');
const Tribe = require('../models/Tribe');
const { logger } = require('../utils/logger');

class NotificationScheduler {
  constructor() {
    this.jobs = new Map();
    this.initializeSchedulers();
  }

  /**
   * Initialize all scheduled notification jobs
   */
  initializeSchedulers() {
    // Daily challenge notification - 7:00 AM UTC
    this.scheduleJob('daily-challenge', '0 7 * * *', this.sendDailyChallengeNotification.bind(this));

    // Streak reminder - 11:00 PM UTC
    this.scheduleJob('streak-reminder', '0 23 * * *', this.sendStreakReminderNotification.bind(this));

    // Tribe weekly reset - Monday 8:00 AM UTC
    this.scheduleJob('tribe-reset', '0 8 * * 1', this.sendTribeResetNotification.bind(this));

    // Inactive user re-engagement - Daily at 6:00 PM UTC
    this.scheduleJob('re-engagement', '0 18 * * *', this.sendReEngagementNotification.bind(this));

    // Weekly tribe summary - Sunday 7:00 PM UTC
    this.scheduleJob('tribe-summary', '0 19 * * 0', this.sendTribeSummaryNotification.bind(this));

    // Cleanup expired notifications - Every 6 hours
    this.scheduleJob('cleanup', '0 */6 * * *', this.cleanupExpiredNotifications.bind(this));

    logger.info('Notification schedulers initialized');
  }

  /**
   * Schedule a cron job
   * @param {string} name - Job name
   * @param {string} schedule - Cron schedule
   * @param {Function} task - Task function
   */
  scheduleJob(name, schedule, task) {
    try {
      const job = cron.schedule(schedule, task, {
        scheduled: true,
        timezone: 'UTC'
      });

      this.jobs.set(name, job);
      logger.info(`Scheduled notification job: ${name} (${schedule})`);
    } catch (error) {
      logger.error(`Failed to schedule job ${name}:`, error);
    }
  }

  /**
   * Send daily challenge notification
   */
  async sendDailyChallengeNotification() {
    try {
      logger.info('Starting daily challenge notification job');

      // Get active users
      const activeUsers = await User.find({
        lastActiveAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Active in last 7 days
        'notifications.push.daily': true
      }).limit(1000);

      const challengeName = this.generateDailyChallengeName();
      const coinReward = 50;

      for (const user of activeUsers) {
        try {
          await notificationService.sendNotification(
            user._id,
            'daily_challenge',
            'push',
            {
              challengeName,
              coinReward
            },
            { priority: 'high' }
          );
        } catch (error) {
          logger.error(`Failed to send daily challenge to user ${user._id}:`, error);
        }
      }

      logger.info(`Daily challenge notifications sent to ${activeUsers.length} users`);

    } catch (error) {
      logger.error('Error in daily challenge notification job:', error);
    }
  }

  /**
   * Send streak reminder notification
   */
  async sendStreakReminderNotification() {
    try {
      logger.info('Starting streak reminder notification job');

      // Get users with active streaks
      const usersWithStreaks = await User.find({
        'streak.current': { $gt: 0 },
        'notifications.push.streak': true,
        lastActiveAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Active in last 24 hours
      }).limit(1000);

      for (const user of usersWithStreaks) {
        try {
          const streakDays = user.streak.current;
          const timeLeft = this.calculateStreakTimeLeft(user);

          await notificationService.sendNotification(
            user._id,
            'streak_reminder',
            'push',
            {
              streakDays,
              timeLeft
            },
            { priority: 'urgent' }
          );
        } catch (error) {
          logger.error(`Failed to send streak reminder to user ${user._id}:`, error);
        }
      }

      logger.info(`Streak reminders sent to ${usersWithStreaks.length} users`);

    } catch (error) {
      logger.error('Error in streak reminder notification job:', error);
    }
  }

  /**
   * Send tribe reset notification
   */
  async sendTribeResetNotification() {
    try {
      logger.info('Starting tribe reset notification job');

      // Get all tribes
      const tribes = await Tribe.find({}).populate('members', 'username');

      for (const tribe of tribes) {
        try {
          // Send to tribe members
          const memberIds = tribe.members.map(member => member._id);
          
          await notificationService.sendBulkNotification(
            memberIds,
            'tribe_weekly_reset',
            'push',
            {
              tribeName: tribe.name,
              previousRank: tribe.previousWeekRank || 'N/A'
            },
            { priority: 'normal' }
          );
        } catch (error) {
          logger.error(`Failed to send tribe reset notification for tribe ${tribe._id}:`, error);
        }
      }

      logger.info(`Tribe reset notifications sent for ${tribes.length} tribes`);

    } catch (error) {
      logger.error('Error in tribe reset notification job:', error);
    }
  }

  /**
   * Send re-engagement notification to inactive users
   */
  async sendReEngagementNotification() {
    try {
      logger.info('Starting re-engagement notification job');

      // Get users inactive for 2-7 days
      const inactiveUsers = await User.find({
        lastActiveAt: { 
          $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          $lt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        'notifications.push.system': true
      }).limit(500);

      for (const user of inactiveUsers) {
        try {
          const daysInactive = Math.floor(
            (Date.now() - user.lastActiveAt.getTime()) / (1000 * 60 * 60 * 24)
          );

          await notificationService.sendNotification(
            user._id,
            'system_update',
            'push',
            {
              daysInactive,
              userName: user.username
            },
            { priority: 'normal' }
          );
        } catch (error) {
          logger.error(`Failed to send re-engagement notification to user ${user._id}:`, error);
        }
      }

      logger.info(`Re-engagement notifications sent to ${inactiveUsers.length} users`);

    } catch (error) {
      logger.error('Error in re-engagement notification job:', error);
    }
  }

  /**
   * Send tribe summary notification
   */
  async sendTribeSummaryNotification() {
    try {
      logger.info('Starting tribe summary notification job');

      // Get top performing tribes
      const topTribes = await Tribe.find({})
        .sort({ currentWeekPoints: -1 })
        .limit(10)
        .populate('members', 'username');

      for (const tribe of topTribes) {
        try {
          const memberIds = tribe.members.map(member => member._id);
          
          await notificationService.sendBulkNotification(
            memberIds,
            'tribe_alert',
            'push',
            {
              tribeName: tribe.name,
              rank: topTribes.indexOf(tribe) + 1,
              points: tribe.currentWeekPoints
            },
            { priority: 'normal' }
          );
        } catch (error) {
          logger.error(`Failed to send tribe summary for tribe ${tribe._id}:`, error);
        }
      }

      logger.info(`Tribe summary notifications sent for ${topTribes.length} tribes`);

    } catch (error) {
      logger.error('Error in tribe summary notification job:', error);
    }
  }

  /**
   * Cleanup expired notifications
   */
  async cleanupExpiredNotifications() {
    try {
      logger.info('Starting notification cleanup job');
      
      const result = await notificationService.cleanupExpired();
      
      logger.info(`Cleaned up ${result.deletedCount} expired notifications`);

    } catch (error) {
      logger.error('Error in notification cleanup job:', error);
    }
  }

  /**
   * Generate daily challenge name
   */
  generateDailyChallengeName() {
    const challenges = [
      'Transform Tuesday',
      'Warrior Wednesday',
      'Tribe Thursday',
      'Fight Friday',
      'Style Saturday',
      'Showcase Sunday',
      'Master Monday'
    ];

    const today = new Date().getDay();
    return challenges[today] || 'Daily Challenge';
  }

  /**
   * Calculate time left to save streak
   */
  calculateStreakTimeLeft(user) {
    const now = new Date();
    const userTimezone = user.timezone || 'UTC';
    const userTime = new Date(now.toLocaleString("en-US", { timeZone: userTimezone }));
    
    const hoursUntilMidnight = 24 - userTime.getHours();
    const minutesUntilMidnight = 60 - userTime.getMinutes();
    
    if (hoursUntilMidnight > 1) {
      return `${hoursUntilMidnight - 1} hours`;
    } else if (minutesUntilMidnight > 1) {
      return `${minutesUntilMidnight - 1} minutes`;
    } else {
      return 'less than 1 minute';
    }
  }

  /**
   * Start all scheduled jobs
   */
  start() {
    for (const [name, job] of this.jobs) {
      job.start();
      logger.info(`Started notification job: ${name}`);
    }
  }

  /**
   * Stop all scheduled jobs
   */
  stop() {
    for (const [name, job] of this.jobs) {
      job.stop();
      logger.info(`Stopped notification job: ${name}`);
    }
  }

  /**
   * Get job status
   */
  getStatus() {
    const status = {};
    for (const [name, job] of this.jobs) {
      status[name] = {
        running: job.running,
        scheduled: job.scheduled
      };
    }
    return status;
  }

  /**
   * Manually trigger a job
   * @param {string} jobName - Name of the job to trigger
   */
  async triggerJob(jobName) {
    try {
      const job = this.jobs.get(jobName);
      if (!job) {
        throw new Error(`Job ${jobName} not found`);
      }

      // Get the task function and execute it
      const taskMap = {
        'daily-challenge': this.sendDailyChallengeNotification.bind(this),
        'streak-reminder': this.sendStreakReminderNotification.bind(this),
        'tribe-reset': this.sendTribeResetNotification.bind(this),
        're-engagement': this.sendReEngagementNotification.bind(this),
        'tribe-summary': this.sendTribeSummaryNotification.bind(this),
        'cleanup': this.cleanupExpiredNotifications.bind(this)
      };

      const task = taskMap[jobName];
      if (task) {
        await task();
        logger.info(`Manually triggered job: ${jobName}`);
        return { success: true, message: `Job ${jobName} executed successfully` };
      } else {
        throw new Error(`Task function for ${jobName} not found`);
      }

    } catch (error) {
      logger.error(`Error triggering job ${jobName}:`, error);
      throw error;
    }
  }
}

module.exports = new NotificationScheduler();
