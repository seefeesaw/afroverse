const Queue = require('bull');
const Battle = require('../models/Battle');
const User = require('../models/User');
const { redisClient } = require('../config/redis');
const socketService = require('../sockets/socketService');
const { sendWhatsAppBattleNotification } = require('../services/whatsappService');
const { logger } = require('../utils/logger');

// Create battle queue
const battleQueue = new Queue('battle', {
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

// Battle expiry worker
battleQueue.process('battle-expiry', async (job) => {
  const { battleId } = job.data;
  
  logger.info(`Processing battle expiry job: ${battleId}`);
  
  try {
    const battle = await Battle.findById(battleId);
    
    if (!battle) {
      logger.warn(`Battle not found for expiry: ${battleId}`);
      return;
    }
    
    // Check if battle is still pending
    if (battle.status.current !== 'pending') {
      logger.info(`Battle ${battle.shortCode} is no longer pending, skipping expiry`);
      return;
    }
    
    // Mark battle as expired
    battle.status.current = 'expired';
    await battle.save();
    
    // Notify challenger
    try {
      const challenger = await User.findById(battle.challenger.userId);
      if (challenger) {
        // Send WhatsApp notification
        await sendWhatsAppBattleNotification(challenger.phone, {
          type: 'expired',
          battleCode: battle.shortCode,
          message: 'Your battle challenge expired without acceptance'
        });
        
        // Emit socket notification
        socketService.emitUserNotification(challenger._id, {
          type: 'battle_expired',
          battleId: battle._id,
          shortCode: battle.shortCode,
          message: 'Your battle challenge expired'
        });
      }
    } catch (notificationError) {
      logger.error('Failed to notify challenger of expired battle:', notificationError);
    }
    
    logger.info(`Battle ${battle.shortCode} marked as expired`);
    
    return {
      success: true,
      battleId,
      shortCode: battle.shortCode,
      status: 'expired'
    };
    
  } catch (error) {
    logger.error(`Battle expiry job failed: ${battleId}`, error);
    throw error;
  }
});

// Battle close worker
battleQueue.process('battle-close', async (job) => {
  const { battleId } = job.data;
  
  logger.info(`Processing battle close job: ${battleId}`);
  
  try {
    const battle = await Battle.findById(battleId);
    
    if (!battle) {
      logger.warn(`Battle not found for close: ${battleId}`);
      return;
    }
    
    // Check if battle is still active
    if (battle.status.current !== 'active') {
      logger.info(`Battle ${battle.shortCode} is no longer active, skipping close`);
      return;
    }
    
    // Complete the battle
    await battle.completeBattle();
    
    // Award tribe points
    const challenger = await User.findById(battle.challenger.userId);
    const defender = await User.findById(battle.defender.userId);
    
    if (challenger && defender) {
      if (battle.result.tie) {
        // Both get 50 points for tie
        challenger.tribePoints = (challenger.tribePoints || 0) + 50;
        defender.tribePoints = (defender.tribePoints || 0) + 50;
        
        // Track achievement progress for tribe points (tie)
        try {
          const achievementService = require('../services/achievementService');
          await achievementService.checkAchievements(challenger.userId, 'tribe_points', 50);
          await achievementService.checkAchievements(defender.userId, 'tribe_points', 50);
        } catch (error) {
          logger.error('Error tracking tribe points achievement (tie):', error);
        }
        
        challenger.battleStats = {
          ...challenger.battleStats,
          ties: (challenger.battleStats?.ties || 0) + 1
        };
        defender.battleStats = {
          ...defender.battleStats,
          ties: (defender.battleStats?.ties || 0) + 1
        };
      } else {
        // Winner gets 100, loser gets 25
        const winner = battle.result.winnerUserId.toString() === challenger._id.toString() ? challenger : defender;
        const loser = battle.result.winnerUserId.toString() === challenger._id.toString() ? defender : challenger;
        
        winner.tribePoints = (winner.tribePoints || 0) + 100;
        loser.tribePoints = (loser.tribePoints || 0) + 25;
        
        // Track achievement progress for tribe points
        try {
          const achievementService = require('../services/achievementService');
          await achievementService.checkAchievements(winner.userId, 'tribe_points', 100);
          await achievementService.checkAchievements(loser.userId, 'tribe_points', 25);
        } catch (error) {
          logger.error('Error tracking tribe points achievement:', error);
        }
        
        winner.battleStats = {
          ...winner.battleStats,
          wins: (winner.battleStats?.wins || 0) + 1
        };
        loser.battleStats = {
          ...loser.battleStats,
          losses: (loser.battleStats?.losses || 0) + 1
        };
      }
      
      await challenger.save();
      await defender.save();
    }
    
    // Emit socket event
    socketService.emitBattleUpdate(battleId, {
      status: 'completed',
      result: {
        winnerUserId: battle.result.winnerUserId,
        marginPct: battle.result.marginPct,
        tribePointsAwarded: battle.result.tribePointsAwarded,
        tie: battle.result.tie
      }
    });
    
    // Notify both users
    try {
      if (challenger) {
        await sendWhatsAppBattleNotification(challenger.phone, {
          type: 'completed',
          battleCode: battle.shortCode,
          isWinner: battle.result.winnerUserId?.toString() === challenger._id.toString(),
          marginPct: battle.result.marginPct,
          message: battle.result.tie 
            ? 'Your battle ended in a tie!'
            : battle.result.winnerUserId?.toString() === challenger._id.toString()
            ? `You won by ${battle.result.marginPct}%!`
            : `You lost by ${100 - battle.result.marginPct}%`
        });
        
        socketService.emitUserNotification(challenger._id, {
          type: 'battle_completed',
          battleId: battle._id,
          shortCode: battle.shortCode,
          isWinner: battle.result.winnerUserId?.toString() === challenger._id.toString(),
          marginPct: battle.result.marginPct
        });
      }
      
      if (defender) {
        await sendWhatsAppBattleNotification(defender.phone, {
          type: 'completed',
          battleCode: battle.shortCode,
          isWinner: battle.result.winnerUserId?.toString() === defender._id.toString(),
          marginPct: battle.result.marginPct,
          message: battle.result.tie 
            ? 'Your battle ended in a tie!'
            : battle.result.winnerUserId?.toString() === defender._id.toString()
            ? `You won by ${battle.result.marginPct}%!`
            : `You lost by ${100 - battle.result.marginPct}%`
        });
        
        socketService.emitUserNotification(defender._id, {
          type: 'battle_completed',
          battleId: battle._id,
          shortCode: battle.shortCode,
          isWinner: battle.result.winnerUserId?.toString() === defender._id.toString(),
          marginPct: battle.result.marginPct
        });
      }
    } catch (notificationError) {
      logger.error('Failed to notify users of completed battle:', notificationError);
    }
    
    logger.info(`Battle ${battle.shortCode} completed successfully`);
    
    return {
      success: true,
      battleId,
      shortCode: battle.shortCode,
      status: 'completed',
      winner: battle.result.winnerUserId,
      marginPct: battle.result.marginPct
    };
    
  } catch (error) {
    logger.error(`Battle close job failed: ${battleId}`, error);
    throw error;
  }
});

// Job event handlers
battleQueue.on('completed', (job, result) => {
  logger.info(`Battle job ${job.id} completed:`, result);
});

battleQueue.on('failed', (job, err) => {
  logger.error(`Battle job ${job.id} failed:`, err);
});

battleQueue.on('stalled', (job) => {
  logger.warn(`Battle job ${job.id} stalled`);
});

// Add battle expiry job
const addBattleExpiryJob = async (battleId, expiresAt) => {
  try {
    const delay = expiresAt.getTime() - Date.now();
    
    if (delay <= 0) {
      logger.warn(`Battle ${battleId} already expired, not scheduling job`);
      return;
    }
    
    const job = await battleQueue.add('battle-expiry', {
      battleId
    }, {
      delay,
      removeOnComplete: 5,
      removeOnFail: 3
    });
    
    logger.info(`Battle expiry job scheduled: ${job.id} for battle: ${battleId}`);
    
    return {
      success: true,
      jobId: job.id
    };
  } catch (error) {
    logger.error('Failed to schedule battle expiry job:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Add battle close job
const addBattleCloseJob = async (battleId, endsAt) => {
  try {
    const delay = endsAt.getTime() - Date.now();
    
    if (delay <= 0) {
      logger.warn(`Battle ${battleId} already ended, not scheduling job`);
      return;
    }
    
    const job = await battleQueue.add('battle-close', {
      battleId
    }, {
      delay,
      removeOnComplete: 5,
      removeOnFail: 3
    });
    
    logger.info(`Battle close job scheduled: ${job.id} for battle: ${battleId}`);
    
    return {
      success: true,
      jobId: job.id
    };
  } catch (error) {
    logger.error('Failed to schedule battle close job:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get job status
const getJobStatus = async (jobId) => {
  try {
    const job = await battleQueue.getJob(jobId);
    
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
  battleQueue,
  addBattleExpiryJob,
  addBattleCloseJob,
  getJobStatus
};
