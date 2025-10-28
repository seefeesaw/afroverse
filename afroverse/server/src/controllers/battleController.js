const Battle = require('../models/Battle');
const Vote = require('../models/Vote');
const Transformation = require('../models/Transformation');
const User = require('../models/User');
const { addBattleExpiryJob, addBattleCloseJob } = require('../queues/battleQueue');
const { sendWhatsAppBattleChallenge } = require('../services/whatsappService');
const feedScoringService = require('../services/feedScoringService');
const socketService = require('../sockets/socketService');
const { logger } = require('../utils/logger');
const crypto = require('crypto');

// Helper function to hash IP address
const hashIp = (ip, salt) => {
  return crypto.createHash('sha256').update(ip + salt).digest('hex');
};

// Helper function to generate fingerprint
const generateFingerprint = (req) => {
  const userAgent = req.get('User-Agent') || '';
  const acceptLanguage = req.get('Accept-Language') || '';
  const acceptEncoding = req.get('Accept-Encoding') || '';
  
  const fingerprint = userAgent + acceptLanguage + acceptEncoding;
  return crypto.createHash('sha256').update(fingerprint).digest('hex');
};

// Create a new battle
const createBattle = async (req, res) => {
  try {
    const { transformId, challengeMethod, challengeTarget, message } = req.body;
    const userId = req.userId;

    // Validate transformation belongs to user and is approved
    const transformation = await Transformation.findOne({
      _id: transformId,
      userId,
      'flags.moderationStatus': 'approved',
      status: 'completed'
    });

    if (!transformation) {
      return res.status(403).json({
        success: false,
        message: 'Transformation not found or not approved'
      });
    }

    // Get user info
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate unique short code
    const shortCode = await Battle.generateShortCode();
    const shareUrl = `${process.env.CLIENT_URL}/b/${shortCode}`;

    // Create battle
    const battle = new Battle({
      shortCode,
      share: {
        code: shortCode,
        url: shareUrl
      },
      challenger: {
        userId: user._id,
        username: user.username,
        tribe: user.tribe?.name || 'No Tribe',
        transformId: transformation._id,
        transformUrl: transformation.result.url
      },
      status: {
        current: 'pending',
        timeline: {
          created: new Date(),
          endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        }
      },
      meta: {
        challengeMethod,
        challengeTarget,
        message: message || 'Let\'s see who wears it better!',
        country: req.ip, // You might want to use a geolocation service
        device: req.get('User-Agent')
      }
    });

    await battle.save();

    // Create battle video for feed
    try {
      const FeedVideo = require('../models/Video');
      const challengerUser = await User.findById(user._id).select('tribe region');
      const defenderUser = await User.findById(opponentId).select('tribe region');
      
      const battleVideo = new FeedVideo({
        ownerId: user._id,
        type: 'battle_clip',
        battleId: battle._id,
        style: transformation.result.style,
        tribe: challengerUser.tribe.id,
        durationSec: 15, // Battle videos are typically 15 seconds
        cdn: {
          hlsUrl: `${process.env.CDN_URL}/battles/${battle.shortCode}/battle.m3u8`,
          mp4Url: `${process.env.CDN_URL}/battles/${battle.shortCode}/battle.mp4`,
          thumbUrl: `${process.env.CDN_URL}/battles/${battle.shortCode}/thumb.jpg`,
          blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4',
        },
        metadata: {
          caption: `Battle: ${user.username} vs ${defenderUser.username}`,
          hashtags: ['battle', 'challenge', transformation.result.style],
        },
        region: challengerUser.region || 'ZA',
      });

      await battleVideo.save();
      
      // Trigger ranking calculation
      const feedService = require('../services/feedService');
      await feedService.recalculateVideoRanking(battleVideo._id);
      
      logger.info(`Battle video created: ${battleVideo._id}`);
    } catch (error) {
      logger.error('Error creating battle video:', error);
    }

    // Send WhatsApp challenge if method is whatsapp
    if (challengeMethod === 'whatsapp') {
      try {
        await sendWhatsAppBattleChallenge(challengeTarget, {
          challengerUsername: user.username,
          battleUrl: shareUrl,
          message: battle.meta.message
        });
      } catch (whatsappError) {
        logger.error('WhatsApp challenge failed:', whatsappError);
        // Continue anyway - battle is created
      }
    }

    // Schedule battle expiry job
    await addBattleExpiryJob(battle._id, battle.status.timeline.endsAt);

    logger.info(`Battle created: ${shortCode} by user: ${userId}`);

    res.json({
      success: true,
      battleId: battle._id,
      shortCode: battle.shortCode,
      status: battle.status.current,
      expiresAt: battle.status.timeline.endsAt,
      shareUrl: battle.share.url
    });

  } catch (error) {
    logger.error('Create battle error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Accept a battle
const acceptBattle = async (req, res) => {
  try {
    const { battleId } = req.params;
    const { transformId } = req.body;
    const userId = req.userId;

    // Find battle
    const battle = await Battle.findById(battleId);
    if (!battle) {
      return res.status(404).json({
        success: false,
        message: 'Battle not found'
      });
    }

    // Check if battle is pending
    if (battle.status.current !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Battle is not pending acceptance'
      });
    }

    // Check if battle has expired
    if (battle.isExpired()) {
      battle.status.current = 'expired';
      await battle.save();
      return res.status(400).json({
        success: false,
        message: 'Battle has expired'
      });
    }

    // Validate transformation belongs to user and is approved
    const transformation = await Transformation.findOne({
      _id: transformId,
      userId,
      'flags.moderationStatus': 'approved',
      status: 'completed'
    });

    if (!transformation) {
      return res.status(403).json({
        success: false,
        message: 'Transformation not found or not approved'
      });
    }

    // Get user info
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Accept battle
    const defenderData = {
      userId: user._id,
      username: user.username,
      tribe: user.tribe?.name || 'No Tribe',
      transformId: transformation._id,
      transformUrl: transformation.result.url
    };

    await battle.acceptBattle(defenderData);

    // Schedule battle close job
    await addBattleCloseJob(battle._id, battle.status.timeline.endsAt);

    // Emit socket event
    socketService.emitBattleUpdate(battle._id, {
      status: 'active',
      endsAt: battle.status.timeline.endsAt,
      defender: defenderData
    });

    logger.info(`Battle accepted: ${battle.shortCode} by user: ${userId}`);

    res.json({
      success: true,
      status: battle.status.current,
      endsAt: battle.status.timeline.endsAt,
      battleUrl: battle.share.url
    });

  } catch (error) {
    logger.error('Accept battle error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get battle by short code (public)
const getBattle = async (req, res) => {
  try {
    const { shortCode } = req.params;

    const battle = await Battle.findOne({ shortCode });
    if (!battle) {
      return res.status(404).json({
        success: false,
        message: 'Battle not found'
      });
    }

    // Increment view count
    await battle.incrementViewCount();

    // Check if battle is expired and update status
    if (battle.isExpired() && battle.status.current !== 'expired') {
      battle.status.current = 'expired';
      await battle.save();
    }

    res.json({
      success: true,
      battleId: battle._id,
      shortCode: battle.shortCode,
      status: battle.status.current,
      endsAt: battle.status.timeline.endsAt,
      challenger: {
        username: battle.challenger.username,
        tribe: battle.challenger.tribe,
        transformUrl: battle.challenger.transformUrl
      },
      defender: battle.defender.userId ? {
        username: battle.defender.username,
        tribe: battle.defender.tribe,
        transformUrl: battle.defender.transformUrl
      } : null,
      votes: battle.votes,
      shareUrl: battle.share.url,
      timeRemaining: battle.getTimeRemaining()
    });

  } catch (error) {
    logger.error('Get battle error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Vote on a battle
const voteOnBattle = async (req, res) => {
  try {
    const { battleId } = req.params;
    const { votedFor } = req.body;

    // Validate vote choice
    if (!['challenger', 'defender'].includes(votedFor)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vote choice'
      });
    }

    // Find battle
    const battle = await Battle.findById(battleId);
    if (!battle) {
      return res.status(404).json({
        success: false,
        message: 'Battle not found'
      });
    }

    // Check if battle is active
    if (!battle.isActive()) {
      return res.status(400).json({
        success: false,
        message: 'Battle is not active'
      });
    }

    // Prepare voter data
    const voterData = {
      userId: req.userId || null,
      fingerprint: req.headers['x-fingerprint'] || null,
      ipHash: hashIp(req.ip, process.env.IP_SALT || 'default-salt')
    };

    // Check if user has already voted
    const hasVoted = await Vote.hasUserVoted(battleId, voterData);
    if (hasVoted) {
      return res.status(409).json({
        success: false,
        message: 'Already voted on this battle'
      });
    }

    // Create vote
    const vote = new Vote({
      battleId,
      voter: voterData,
      choice: votedFor,
      meta: {
        userAgent: req.get('User-Agent'),
        country: req.ip, // You might want to use a geolocation service
        device: req.get('User-Agent')
      }
    });

    await vote.save();

    // Track achievement progress for votes cast
    if (req.userId) {
      try {
        const achievementService = require('../services/achievementService');
        await achievementService.checkAchievements(req.userId, 'votes_cast', 1);
      } catch (error) {
        logger.error('Error tracking vote achievement:', error);
      }
    }

    // Update battle vote counts atomically
    const updateFields = {
      'votes.total': 1,
      [`votes.${votedFor}`]: 1
    };

    const updatedBattle = await Battle.findByIdAndUpdate(
      battleId,
      { $inc: updateFields },
      { new: true, projection: { votes: 1, shortCode: 1 } }
    );

    // Update velocity for feed scoring
    await feedScoringService.updateVelocity(battleId);

    // Emit socket event
    socketService.emitBattleUpdate(battleId, {
      votes: updatedBattle.votes
    });

    logger.info(`Vote cast: ${votedFor} for battle ${updatedBattle.shortCode}`);

    res.json({
      success: true,
      votes: updatedBattle.votes
    });

  } catch (error) {
    logger.error('Vote error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// List active battles
const listActiveBattles = async (req, res) => {
  try {
    const { cursor, limit = 10 } = req.query;
    const limitNum = Math.min(parseInt(limit), 50);

    const query = { 'status.current': 'active' };
    
    if (cursor) {
      query._id = { $lt: cursor };
    }

    const battles = await Battle.find(query)
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .select('shortCode status votes challenger defender createdAt')
      .lean();

    const nextCursor = battles.length === limitNum 
      ? battles[battles.length - 1]._id 
      : null;

    const items = battles.map(battle => ({
      shortCode: battle.shortCode,
      status: battle.status.current,
      endsAt: battle.status.timeline.endsAt,
      cards: {
        challenger: {
          username: battle.challenger.username,
          tribe: battle.challenger.tribe,
          transformUrl: battle.challenger.transformUrl
        },
        defender: battle.defender.userId ? {
          username: battle.defender.username,
          tribe: battle.defender.tribe,
          transformUrl: battle.defender.transformUrl
        } : null
      },
      votes: battle.votes,
      createdAt: battle.createdAt
    }));

    res.json({
      success: true,
      items,
      nextCursor
    });

  } catch (error) {
    logger.error('List active battles error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Report a battle
const reportBattle = async (req, res) => {
  try {
    const { battleId } = req.params;
    const { reason, details } = req.body;

    const battle = await Battle.findById(battleId);
    if (!battle) {
      return res.status(404).json({
        success: false,
        message: 'Battle not found'
      });
    }

    // Update moderation status
    battle.moderation.reported = true;
    battle.moderation.reportCount += 1;
    battle.moderation.status = 'under_review';

    await battle.save();

    logger.info(`Battle reported: ${battle.shortCode}, reason: ${reason}`);

    res.json({
      success: true,
      message: 'Battle reported successfully'
    });

  } catch (error) {
    logger.error('Report battle error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  createBattle,
  acceptBattle,
  getBattle,
  voteOnBattle,
  listActiveBattles,
  reportBattle
};
