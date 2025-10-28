const Queue = require('bull');
const feedScoringService = require('../services/feedScoringService');
const { redisClient } = require('../config/redis');
const { logger } = require('../utils/logger');

// Create feed queue
const feedQueue = new Queue('feed', {
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

// Feed scorer worker (runs every 30 seconds)
feedQueue.process('feed-scorer', async (job) => {
  const { region } = job.data;
  
  logger.info(`Processing feed scorer job for region: ${region}`);
  
  try {
    // Remove expired boosts first
    await feedScoringService.removeExpiredBoosts(region);
    
    // Recompute scores
    const result = await feedScoringService.recomputeScores(region, 2000);
    
    if (result.success) {
      logger.info(`Feed scorer completed for region ${region}: ${result.updated} battles updated`);
    } else {
      logger.error(`Feed scorer failed for region ${region}: ${result.error}`);
    }
    
    return result;
  } catch (error) {
    logger.error(`Feed scorer job failed for region ${region}:`, error);
    throw error;
  }
});

// Velocity rollup worker (runs every minute)
feedQueue.process('velocity-rollup', async (job) => {
  logger.info('Processing velocity rollup job');
  
  try {
    // Get all active battles
    const activeBattles = await Battle.find({
      'status.current': 'active'
    }).select('_id').lean();

    for (const battle of activeBattles) {
      const battleId = battle._id.toString();
      const key = `vel:${battleId}`;
      
      // Get current velocity
      const currentVelocity = await redisClient.get(key);
      if (currentVelocity) {
        // Apply decay: new_velocity = 0.8 * old_velocity
        const newVelocity = 0.8 * parseFloat(currentVelocity);
        await redisClient.setEx(key, 3600, newVelocity.toString());
      }
    }
    
    logger.info(`Velocity rollup completed for ${activeBattles.length} battles`);
    
    return {
      success: true,
      processed: activeBattles.length
    };
  } catch (error) {
    logger.error('Velocity rollup job failed:', error);
    throw error;
  }
});

// Pruner worker (runs every 5 minutes)
feedQueue.process('feed-pruner', async (job) => {
  const { region } = job.data;
  
  logger.info(`Processing feed pruner job for region: ${region}`);
  
  try {
    const key = `feed:active:${region}`;
    
    // Get all battles in the feed
    const battleIds = await redisClient.zrange(key, 0, -1);
    
    if (battleIds.length === 0) {
      return { success: true, processed: 0 };
    }
    
    // Check which battles are still active
    const activeBattles = await Battle.find({
      _id: { $in: battleIds },
      'status.current': 'active'
    }).select('_id').lean();
    
    const activeBattleIds = activeBattles.map(battle => battle._id.toString());
    const inactiveBattleIds = battleIds.filter(id => !activeBattleIds.includes(id));
    
    // Remove inactive battles from feed
    if (inactiveBattleIds.length > 0) {
      await redisClient.zrem(key, ...inactiveBattleIds);
      
      // Add completed battles to completed feed
      const completedBattles = await Battle.find({
        _id: { $in: inactiveBattleIds },
        'status.current': 'completed'
      }).select('_id').lean();
      
      if (completedBattles.length > 0) {
        const completedKey = `feed:completed:${region}`;
        const completedIds = completedBattles.map(battle => battle._id.toString());
        
        // Add to completed feed with timestamp as score
        const now = Date.now();
        const args = [];
        completedIds.forEach(id => {
          args.push(now, id);
        });
        
        await redisClient.zadd(completedKey, ...args);
        
        // Keep only last 1000 completed battles
        await redisClient.zremrangebyrank(completedKey, 0, -1001);
      }
    }
    
    logger.info(`Feed pruner completed for region ${region}: ${inactiveBattleIds.length} battles removed`);
    
    return {
      success: true,
      processed: inactiveBattleIds.length
    };
  } catch (error) {
    logger.error(`Feed pruner job failed for region ${region}:`, error);
    throw error;
  }
});

// Job event handlers
feedQueue.on('completed', (job, result) => {
  logger.info(`Feed job ${job.id} completed:`, result);
});

feedQueue.on('failed', (job, err) => {
  logger.error(`Feed job ${job.id} failed:`, err);
});

feedQueue.on('stalled', (job) => {
  logger.warn(`Feed job ${job.id} stalled`);
});

// Schedule recurring jobs
const scheduleFeedJobs = () => {
  const regions = ['global', 'za', 'ng', 'ke', 'gh'];
  
  // Feed scorer - every 30 seconds
  regions.forEach(region => {
    feedQueue.add('feed-scorer', { region }, {
      repeat: { every: 30000 }, // 30 seconds
      removeOnComplete: 5,
      removeOnFail: 3
    });
  });
  
  // Velocity rollup - every minute
  feedQueue.add('velocity-rollup', {}, {
    repeat: { every: 60000 }, // 1 minute
    removeOnComplete: 5,
    removeOnFail: 3
  });
  
  // Feed pruner - every 5 minutes
  regions.forEach(region => {
    feedQueue.add('feed-pruner', { region }, {
      repeat: { every: 300000 }, // 5 minutes
      removeOnComplete: 5,
      removeOnFail: 3
    });
  });
  
  logger.info('Feed jobs scheduled successfully');
};

// Add immediate feed scorer job
const addFeedScorerJob = async (region = 'global') => {
  try {
    const job = await feedQueue.add('feed-scorer', { region });
    logger.info(`Feed scorer job scheduled: ${job.id} for region: ${region}`);
    
    return {
      success: true,
      jobId: job.id
    };
  } catch (error) {
    logger.error('Failed to schedule feed scorer job:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Add immediate velocity rollup job
const addVelocityRollupJob = async () => {
  try {
    const job = await feedQueue.add('velocity-rollup', {});
    logger.info(`Velocity rollup job scheduled: ${job.id}`);
    
    return {
      success: true,
      jobId: job.id
    };
  } catch (error) {
    logger.error('Failed to schedule velocity rollup job:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Add immediate feed pruner job
const addFeedPrunerJob = async (region = 'global') => {
  try {
    const job = await feedQueue.add('feed-pruner', { region });
    logger.info(`Feed pruner job scheduled: ${job.id} for region: ${region}`);
    
    return {
      success: true,
      jobId: job.id
    };
  } catch (error) {
    logger.error('Failed to schedule feed pruner job:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get job status
const getJobStatus = async (jobId) => {
  try {
    const job = await feedQueue.getJob(jobId);
    
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
  feedQueue,
  scheduleFeedJobs,
  addFeedScorerJob,
  addVelocityRollupJob,
  addFeedPrunerJob,
  getJobStatus
};
