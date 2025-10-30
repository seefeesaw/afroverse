const mongoose = require('mongoose');
const { logger } = require('../utils/logger');
const Tribe = require('../models/Tribe');
const User = require('../models/User');
const Wallet = require('../models/Wallet');
const Video = require('../models/Video');
const Battle = require('../models/Battle');
const Transformation = require('../models/Transformation');
const Achievement = require('../models/Achievement');
const Follow = require('../models/Follow');
const Vote = require('../models/Vote');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const Challenge = require('../models/Challenge');
const UserChallenge = require('../models/UserChallenge');
const RankScore = require('../models/RankScore');
const TribePointEvent = require('../models/TribePointEvent');
const ShareEvent = require('../models/ShareEvent');
const FeedImpression = require('../models/FeedImpression');
const Referral = require('../models/Referral');
const { seedAdminUsers } = require('./adminSeeder');
const path = require('path');
const fs = require('fs');
const { Types } = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/afroverse';

async function connect() {
  await mongoose.connect(MONGODB_URI, {
    dbName: process.env.MONGODB_DB || 'afroverse',
  });
  logger.info('MongoDB connected for seeding');
}

async function seedTribes() {
  await Tribe.seedTribes();
}

async function seedUsers() {
  const tribes = await Tribe.find().limit(5);
  if (tribes.length === 0) {
    logger.warn('No tribes found, skipping user seeding');
    return [];
  }

  const usernames = [
    'warrior_one', 'warrior_two', 'warrior_three', 'creator_king', 'battle_queen',
    'tribe_chief', 'dance_master', 'video_pro', 'legend_player', 'rookie_star',
    'afro_hero', 'vibranium_lord', 'power_user', 'elite_warrior', 'mega_creator'
  ];

  const createdUsers = [];

  for (let i = 0; i < 15; i++) {
    const phone = `+1000000${String(i).padStart(4, '0')}`;
    const username = usernames[i] || `warrior_${i + 1}`;
    
    const exists = await User.findOne({ $or: [{ phone }, { username }] });
    if (exists) {
      createdUsers.push(exists);
      continue;
    }

    const tribe = tribes[i % tribes.length];
    const isCreator = i >= 3 && i <= 8; // Make some users creators
    const isWarrior = i % 3 === 0; // Make some users warriors (premium)

    const user = new User({
      phone,
      username,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      tribe: {
        id: tribe._id,
        name: tribe.displayName,
        joinedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random within last 30 days
      },
      isCreator,
      bio: isCreator ? `${username} creating amazing content for ${tribe.displayName}!` : '',
      subscription: {
        status: isWarrior ? 'warrior' : 'free',
        expiresAt: isWarrior ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
      },
      entitlements: {
        warriorActive: isWarrior,
        multiplier: isWarrior ? 2 : 1,
        aiPriority: isWarrior,
        unlimitedTransformations: isWarrior,
        allStyles: isWarrior,
        warriorBadge: isWarrior,
        fasterProcessing: isWarrior,
      },
      progression: {
        level: Math.floor(Math.random() * 20) + 1,
        xp: Math.floor(Math.random() * 5000),
        vibranium: Math.floor(Math.random() * 1000),
      },
      streak: {
        current: Math.floor(Math.random() * 15),
        longest: Math.floor(Math.random() * 30),
      },
      followersCount: isCreator ? Math.floor(Math.random() * 1000) + 100 : Math.floor(Math.random() * 50),
      followingCount: Math.floor(Math.random() * 100) + 10,
      creatorStats: isCreator ? {
        totalViews: Math.floor(Math.random() * 10000) + 1000,
        totalVotes: Math.floor(Math.random() * 5000) + 500,
        winRate: Math.random() * 100,
        consistencyScore: Math.random() * 100,
        totalShares: Math.floor(Math.random() * 500),
        creatorRank: isCreator ? i - 2 : null,
      } : undefined,
      lastLoginAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    });

    await user.save();
    createdUsers.push(user);
    
    // Update tribe member count
    await tribe.incrementMembers();
  }
  
  logger.info(`Seeded ${createdUsers.length} users`);
  return createdUsers;
}

async function seedWallets() {
  const users = await User.find().select('_id');
  for (const u of users) {
    const wallet = await Wallet.getOrCreateWallet(u._id);
    // Add some initial balance for testing
    wallet.balance = Math.floor(Math.random() * 5000);
    await wallet.save();
  }
  logger.info(`Seeded wallets for ${users.length} users`);
}

async function seedTransformations() {
  const users = await User.find().limit(10);
  const tribes = await Tribe.find();
  const styles = ['maasai', 'zulu', 'pharaoh', 'afrofuturistic'];
  const statuses = ['completed', 'completed', 'completed', 'processing', 'failed'];
  const createdTransformations = [];

  for (let i = 0; i < 30; i++) {
    const user = users[i % users.length];
    const tribe = tribes[i % tribes.length];
    const style = styles[i % styles.length];
    const status = statuses[i % statuses.length];
    
    // Generate unique codes
    const shareCode = await Transformation.generateShareCode();
    const jobId = await Transformation.generateJobId();

    const transformation = new Transformation({
      userId: user._id,
      status,
      original: {
        url: `https://cdn.example.com/input/${user.username}_${i}.jpg`,
        width: 1024,
        height: 1024,
        filename: `${user.username}_original_${i}.jpg`,
        size: 1024000 + Math.floor(Math.random() * 500000), // 1-1.5MB
      },
      result: {
        url: status === 'completed' ? `https://cdn.example.com/output/${user.username}_${i}.jpg` : 'https://cdn.example.com/placeholder.jpg',
        thumbnailUrl: status === 'completed' ? `https://cdn.example.com/output/${user.username}_${i}_thumb.jpg` : 'https://cdn.example.com/placeholder_thumb.jpg',
        style,
        watermark: true,
        width: 1024,
        height: 1024,
      },
      ai: {
        model: 'SDXL',
        prompt: `Transform person into ${style} warrior style, ${tribe.displayName} inspired, highly detailed, professional photography`,
        negativePrompt: 'blurry, low quality, distorted, deformed, ugly, bad anatomy, bad proportions',
        processingTime: status === 'completed' ? Math.floor(Math.random() * 30) + 10 : 0, // 10-40 seconds
        intensity: 0.8,
      },
      flags: {
        nsfw: false,
        faceCount: 1,
        moderationStatus: status === 'completed' ? 'approved' : 'pending',
        hasFace: true,
        multipleFaces: false,
      },
      shareCode,
      jobId,
      isPublic: i % 10 !== 0, // Most public
      viewCount: status === 'completed' ? Math.floor(Math.random() * 500) : 0,
      likeCount: status === 'completed' ? Math.floor(Math.random() * 100) : 0,
      shareCount: status === 'completed' ? Math.floor(Math.random() * 50) : 0,
    });

    await transformation.save();
    createdTransformations.push(transformation);
  }

  logger.info(`Seeded ${createdTransformations.length} transformations`);
  return createdTransformations;
}

async function seedVideos() {
  const users = await User.find().limit(10);
  const tribes = await Tribe.find();
  const types = ['portrait_loop', 'fullbody_dance', 'battle_clip', 'image_loop'];
  const styles = ['classic', 'warrior', 'royal', 'modern', 'traditional'];
  const createdVideos = [];

  for (let i = 0; i < 50; i++) {
    const user = users[i % users.length];
    const tribe = tribes[i % tribes.length];
    const type = types[i % types.length];
    const style = styles[i % styles.length];

    const video = new Video({
      ownerId: user._id,
      type,
      style,
      tribe: tribe.displayName,
      durationSec: 12 + Math.floor(Math.random() * 18), // 12-30 seconds
      cdn: {
        hlsUrl: `https://cdn.example.com/videos/${user.username}_${i}/stream.m3u8`,
        mp4Url: `https://cdn.example.com/videos/${user.username}_${i}/video.mp4`,
        thumbUrl: `https://cdn.example.com/videos/${user.username}_${i}/thumb.jpg`,
        blurhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
      },
      stats: {
        views: Math.floor(Math.random() * 5000),
        likes: Math.floor(Math.random() * 1000),
        shares: Math.floor(Math.random() * 200),
        completions: Math.floor(Math.random() * 3000),
        votesCast: Math.floor(Math.random() * 500),
      },
      safety: {
        moderation: i % 10 === 0 ? 'pending' : 'approved',
      },
      metadata: {
        caption: `Amazing ${style} style video from ${tribe.displayName}!`,
        hashtags: ['afroverse', tribe.name, style],
        isPublic: i % 15 !== 0, // Most public, some private
      },
      region: 'ZA',
      ranking: {
        foryouScore: Math.random() * 100,
        tribeScore: Math.random() * 100,
        followingScore: Math.random() * 100,
        battlesScore: Math.random() * 100,
      },
    });

    await video.save();
    createdVideos.push(video);
  }

  logger.info(`Seeded ${createdVideos.length} videos`);
  return createdVideos;
}

async function seedBattles() {
  const users = await User.find().limit(10);
  const transformations = await Transformation.find({ status: 'completed' }).limit(20);
  
  if (users.length < 2 || transformations.length < 2) {
    logger.warn('Not enough users or transformations for battles');
    return [];
  }

  const createdBattles = [];
  const statuses = ['pending', 'active', 'active', 'completed', 'completed', 'expired'];

  for (let i = 0; i < 25; i++) {
    const challenger = users[i % users.length];
    const defender = i % 3 === 0 ? null : users[(i + 1) % users.length]; // Some battles pending
    const status = defender ? statuses[i % statuses.length] : 'pending';
    
    const challengerTransform = transformations[i % transformations.length];
    const defenderTransform = defender ? transformations[(i + 1) % transformations.length] : null;

    const shortCode = `BT${String(1000 + i).padStart(4, '0')}`;
    const shareCode = `SH${String(5000 + i).padStart(6, '0')}`;

    const battle = new Battle({
      shortCode,
      share: {
        code: shareCode,
        url: `https://afroverse.app/b/${shortCode}`,
      },
      challenger: {
        userId: challenger._id,
        username: challenger.username,
        tribe: challenger.tribe.name,
        transformId: challengerTransform._id,
        transformUrl: challengerTransform.result.url,
      },
      defender: defender ? {
        userId: defender._id,
        username: defender.username,
        tribe: defender.tribe.name,
        transformId: defenderTransform._id,
        transformUrl: defenderTransform.result.url,
      } : undefined,
      status: {
        current: status,
        timeline: {
          created: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          accepted: defender ? new Date(Date.now() - Math.random() * 6 * 24 * 60 * 60 * 1000) : null,
          started: status !== 'pending' ? new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000) : null,
          endsAt: status !== 'pending' ? new Date(Date.now() + (status === 'completed' || status === 'expired' ? -1 : 1) * Math.random() * 24 * 60 * 60 * 1000) : null,
          completedAt: status === 'completed' ? new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000) : null,
        },
      },
      votes: {
        challenger: status === 'active' || status === 'completed' ? Math.floor(Math.random() * 500) : 0,
        defender: status === 'active' || status === 'completed' ? Math.floor(Math.random() * 500) : 0,
        total: 0,
      },
      engagement: {
        views: Math.floor(Math.random() * 2000),
        shares: Math.floor(Math.random() * 100),
      },
      meta: {
        challengeMethod: i % 3 === 0 ? 'whatsapp' : i % 3 === 1 ? 'link' : 'username',
        challengeTarget: defender ? defender.username : 'anyone',
      },
    });

    battle.votes.total = battle.votes.challenger + battle.votes.defender;

    // Set winner for completed battles
    if (status === 'completed') {
      const winnerUserId = battle.votes.challenger > battle.votes.defender ? challenger._id : defender._id;
      battle.result = {
        winnerUserId,
        marginPct: Math.abs(battle.votes.challenger - battle.votes.defender) / battle.votes.total * 100,
        tribePointsAwarded: {
          winner: 100,
          loser: 25,
        },
        tie: battle.votes.challenger === battle.votes.defender,
      };
    }

    await battle.save();
    createdBattles.push(battle);
  }

  logger.info(`Seeded ${createdBattles.length} battles`);
  return createdBattles;
}

async function seedFollows() {
  const users = await User.find();
  const createdFollows = [];

  // Create follow relationships
  for (let i = 0; i < users.length; i++) {
    for (let j = 0; j < 3; j++) {
      const followingIndex = (i + j + 1) % users.length;
      if (i === followingIndex) continue;

      const existing = await Follow.findOne({
        followerId: users[i]._id,
        followingId: users[followingIndex]._id,
      });

      if (!existing) {
        const follow = new Follow({
          followerId: users[i]._id,
          followingId: users[followingIndex]._id,
        });
        await follow.save();
        createdFollows.push(follow);
      }
    }
  }

  logger.info(`Seeded ${createdFollows.length} follows`);
  return createdFollows;
}

async function seedVotes() {
  const battles = await Battle.find({ 'status.current': { $in: ['active', 'completed'] } });
  const users = await User.find();
  const createdVotes = [];

  for (const battle of battles) {
    const voteCount = battle.votes.total || Math.floor(Math.random() * 50) + 10;
    
    for (let i = 0; i < Math.min(voteCount, users.length); i++) {
      const user = users[i % users.length];
      const choice = Math.random() > 0.5 ? 'challenger' : 'defender';
      
      // Generate a mock IP hash
      const ipHash = `ip_hash_${battle._id}_${user._id}`;
      const fingerprint = `fp_${user._id}_${Math.random().toString(36).substring(7)}`;

      // Check if user already voted on this battle
      const existing = await Vote.findOne({
        battleId: battle._id,
        'voter.userId': user._id,
      });

      if (!existing) {
        const vote = new Vote({
          battleId: battle._id,
          voter: {
            userId: user._id,
            fingerprint,
            ipHash,
          },
          choice,
          meta: {
            userAgent: 'Mozilla/5.0 (Seeded Data)',
            country: 'ZA',
            device: 'web',
          },
        });
        await vote.save();
        createdVotes.push(vote);
      }
    }
  }

  logger.info(`Seeded ${createdVotes.length} votes`);
  return createdVotes;
}

async function seedComments() {
  const videos = await Video.find().limit(20);
  const users = await User.find();
  const createdComments = [];

  const commentTexts = [
    'This is amazing! 🔥',
    'Love the energy!',
    'Incredible work!',
    'This deserves more views',
    'Stunning transformation',
    'Can\'t stop watching this',
    'Pure talent right here',
    'This is legendary',
    'Absolutely brilliant',
    'Keep creating!',
  ];

  for (const video of videos) {
    const commentCount = Math.floor(Math.random() * 10) + 1;
    
    for (let i = 0; i < commentCount; i++) {
      const user = users[i % users.length];
      const text = commentTexts[i % commentTexts.length];

      const comment = new Comment({
        videoId: video._id,
        userId: user._id,
        text,
        likes: Math.floor(Math.random() * 50),
        flags: {
          moderationStatus: 'approved',
          isPinned: i === 0 && Math.random() > 0.7, // Randomly pin first comment sometimes
        },
        metadata: {
          emojis: ['🔥', '❤️', '👏'],
          tribe: video.tribe,
        },
      });
      await comment.save();
      createdComments.push(comment);
    }
  }

  logger.info(`Seeded ${createdComments.length} comments`);
  return createdComments;
}

async function seedAchievements() {
  const achievements = [
    {
      _id: 'first_transformation',
      name: 'First Steps',
      description: 'Complete your first transformation',
      category: 'milestone',
      rarity: 'common',
      icon: '🎯',
      color: '#4CAF50',
      target: 1,
      metric: 'transformations',
      reward: {
        type: 'free_transform',
        value: 1,
        description: 'Get 1 free transformation',
      },
      xpReward: 50,
      sortOrder: 1,
    },
    {
      _id: 'battle_champion',
      name: 'Battle Champion',
      description: 'Win your first battle',
      category: 'battle',
      rarity: 'common',
      icon: '🏆',
      color: '#FFD700',
      target: 1,
      metric: 'battles_won',
      reward: {
        type: 'xp_boost',
        value: 2,
        description: '2x XP boost for 1 hour',
      },
      xpReward: 100,
      sortOrder: 2,
    },
    {
      _id: 'tribe_warrior',
      name: 'Tribe Warrior',
      description: 'Earn 1000 tribe points',
      category: 'tribe',
      rarity: 'rare',
      icon: '🛡️',
      color: '#9C27B0',
      target: 1000,
      metric: 'tribe_points',
      reward: {
        type: 'tribe_points_multiplier',
        value: 1.5,
        description: '1.5x tribe points multiplier',
      },
      xpReward: 200,
      sortOrder: 3,
    },
    {
      _id: 'social_butterfly',
      name: 'Social Butterfly',
      description: 'Get 100 followers',
      category: 'social',
      rarity: 'rare',
      icon: '🦋',
      color: '#FF4081',
      target: 100,
      metric: 'followers',
      reward: {
        type: 'badge',
        value: 1,
        description: 'Exclusive Social Star badge',
      },
      xpReward: 150,
      sortOrder: 4,
    },
    {
      _id: 'vote_master',
      name: 'Vote Master',
      description: 'Cast 100 votes in battles',
      category: 'battle',
      rarity: 'epic',
      icon: '🎬',
      color: '#FF9800',
      target: 100,
      metric: 'votes_cast',
      reward: {
        type: 'premium_style',
        value: 1,
        description: 'Unlock exclusive premium style',
      },
      xpReward: 300,
      sortOrder: 5,
    },
    {
      _id: 'streak_legend',
      name: 'Streak Legend',
      description: 'Maintain a 7-day login streak',
      category: 'streak',
      rarity: 'epic',
      icon: '🔥',
      color: '#F44336',
      target: 7,
      metric: 'streak_days',
      reward: {
        type: 'streak_freeze',
        value: 2,
        description: 'Get 2 streak freezes',
      },
      xpReward: 250,
      sortOrder: 6,
    },
    {
      _id: 'viral_sensation',
      name: 'Viral Sensation',
      description: 'Get 1000 shares on your content',
      category: 'social',
      rarity: 'legendary',
      icon: '⭐',
      color: '#E91E63',
      target: 1000,
      metric: 'shares',
      reward: {
        type: 'profile_title',
        value: 1,
        description: 'Exclusive "Viral Legend" title',
      },
      xpReward: 1000,
      sortOrder: 7,
    },
  ];

  for (const achData of achievements) {
    const existing = await Achievement.findById(achData._id);
    if (!existing) {
      await Achievement.create(achData);
    }
  }

  logger.info(`Seeded ${achievements.length} achievements`);
}

async function seedNotifications() {
  const users = await User.find().limit(10);
  const createdNotifications = [];

  const notificationTypes = [
    { type: 'battle_challenge', title: 'New Battle Challenge!', message: 'Someone challenged you to a battle', channel: 'inapp' },
    { type: 'battle_result', title: 'Victory!', message: 'You won the battle!', channel: 'push' },
    { type: 'tribe_alert', title: 'Tribe Update', message: 'Your tribe is leading this week!', channel: 'inapp' },
    { type: 'coin_earned', title: 'Coins Earned!', message: 'You earned 50 vibranium', channel: 'inapp' },
    { type: 'streak_reminder', title: 'Streak Alert', message: 'Don\'t break your streak today!', channel: 'push' },
  ];

  for (const user of users) {
    for (let i = 0; i < 5; i++) {
      const notifType = notificationTypes[i % notificationTypes.length];
      
      const notification = new Notification({
        userId: user._id,
        type: notifType.type,
        title: notifType.title,
        message: notifType.message,
        channel: notifType.channel,
        status: Math.random() > 0.3 ? 'read' : 'sent',
        data: { testData: true, userId: user._id },
      });
      await notification.save();
      createdNotifications.push(notification);
    }
  }

  logger.info(`Seeded ${createdNotifications.length} notifications`);
  return createdNotifications;
}

async function seedReferrals() {
  const users = await User.find().limit(10);
  const createdReferrals = [];

  for (let i = 0; i < users.length - 1; i++) {
    const referrer = users[i];
    const referred = users[i + 1];

    // Set referral code for referrer
    if (!referrer.referral.code) {
      referrer.referral.code = `REF${String(i).padStart(6, '0')}`;
      await referrer.save();
    }

    const referral = new Referral({
      referrerUserId: referrer._id,
      referredUserId: referred._id,
      referralCode: referrer.referral.code,
      status: i % 3 === 0 ? 'completed' : 'pending',
      rewardsClaimed: i % 3 === 0,
    });
    await referral.save();
    createdReferrals.push(referral);
  }

  logger.info(`Seeded ${createdReferrals.length} referrals`);
  return createdReferrals;
}

function oid() {
  return new Types.ObjectId();
}

function dummyText(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}

function generateDummy(modelName) {
  switch (modelName) {
    case 'AuditLog':
      return { userId: oid(), action: 'seed', details: { note: 'seeded' } };
    case 'BlockedUser':
      return { userId: oid(), blockedUserId: oid(), reason: 'seed' };
    case 'Boost':
      return { userId: oid(), type: 'xp', multiplier: 2, expiresAt: new Date(Date.now() + 3600000) };
    case 'ChatSettings':
      return { userId: oid(), allowDMs: true };
    case 'CommentLike':
      return { userId: oid(), commentId: oid() };
    case 'Conversation':
      return { participants: [oid(), oid()], lastMessageAt: new Date() };
    case 'DeviceFingerprint':
      return { userId: oid(), fingerprint: dummyText('fp') };
    case 'DeviceToken':
      return { userId: oid(), token: dummyText('tok'), platform: 'ios' };
    case 'DmMessage':
      return { conversationId: oid(), senderId: oid(), text: 'hello' };
    case 'Enforcement':
      return { userId: oid(), action: 'warning', reason: 'seed' };
    case 'Event':
      return { type: 'seed_event', metadata: { k: 'v' } };
    case 'FraudDetection':
      return { userId: oid(), type: 'seed', score: 0 };
    case 'Message':
      return { userId: oid(), type: 'system', content: 'seed' };
    case 'ModerationJob':
      return { targetType: 'video', targetId: oid(), status: 'pending' };
    case 'ModerationLog':
      return { userId: oid(), action: 'seed_mark', details: { reason: 'seed' } };
    case 'MotionPack':
      return { key: dummyText('pack'), name: 'Seed Pack', description: 'desc' };
    case 'NotificationCampaign':
      return { name: dummyText('camp'), type: 'broadcast', payload: {} };
    case 'NotificationTemplate':
      return { key: dummyText('tmpl'), channel: 'push', title: 'T', body: 'B' };
    case 'Purchase':
      return { userId: oid(), sku: 'test_sku', amount: 1, currency: 'USD' };
    case 'Report':
      return { reporterId: oid(), targetType: 'video', targetId: oid(), reason: 'spam' };
    case 'Subscription':
      return { userId: oid(), status: 'active', provider: 'stripe' };
    case 'TribeAggregate':
      return { tribeId: oid(), period: 'weekly', metrics: { points: 0 } };
    case 'TrustScore':
      return { userId: oid(), score: 100 };
    case 'UserCosmetic':
      return { userId: oid(), owned: [], equipped: {} };
    case 'UserEvent':
      return { userId: oid(), type: 'login', metadata: {} };
    case 'UserNotificationSettings':
      return { userId: oid(), channels: { push: true, inapp: true } };
    case 'UserReward':
      return { userId: oid(), items: [] };
    case 'UserSettings':
      return { userId: oid(), locale: 'en-ZA' };
    case 'ViralLanding':
      return { code: dummyText('land'), landingUrl: 'https://example.com/landing' };
    case 'WalletTransaction':
      return { userId: oid(), type: 'earn', amount: 1 };
    case 'WeeklyChampions':
      return { week: 1, year: new Date().getFullYear(), champions: [] };
    default:
      return {};
  }
}

async function seedAllModels() {
  const modelsDir = path.join(__dirname, '..', 'models');
  const files = fs.readdirSync(modelsDir).filter(f => f.endsWith('.js') && f !== 'index.js');
  const results = [];
  
  // Models we've already seeded with comprehensive data
  const skipModels = [
    'User', 'Tribe', 'Video', 'Wallet', 'AdminUser', 'Battle', 'Transformation',
    'Achievement', 'Follow', 'Vote', 'Comment', 'Notification', 'Referral'
  ];
  
  for (const f of files) {
    try {
      const mod = require(path.join(modelsDir, f));
      const model = mod && mod.modelName ? mod : (mod.default || mod);
      const name = model.modelName;
      if (!name) continue;
      
      if (skipModels.includes(name)) {
        results.push({ model: name, status: 'skipped (comprehensive seed)' });
        continue;
      }
      
      const payload = generateDummy(name);
      if (Object.keys(payload).length === 0) {
        results.push({ model: name, status: 'skipped (no template)' });
        continue;
      }
      
      await model.create(payload);
      results.push({ model: name, status: 'created' });
    } catch (e) {
      logger.warn(`Seed skipped for ${f}: ${e.message}`);
      results.push({ model: f, status: `failed: ${e.message}` });
    }
  }
  
  logger.info(`Generic seeding complete`);
  return results;
}

async function main() {
  try {
    await connect();
    
    logger.info('🌱 Starting comprehensive database seeding...');
    
    // Core data
    logger.info('📊 Seeding core data...');
    await seedTribes();
    await seedAdminUsers();
    
    // Users and wallets
    logger.info('👥 Seeding users and wallets...');
    const users = await seedUsers();
    await seedWallets();
    
    // Content
    logger.info('🎬 Seeding transformations and videos...');
    await seedTransformations();
    await seedVideos();
    
    // Battles
    logger.info('⚔️  Seeding battles...');
    await seedBattles();
    
    // Social features
    logger.info('🤝 Seeding social features...');
    await seedFollows();
    await seedVotes();
    await seedComments();
    await seedReferrals();
    
    // Achievements and notifications
    logger.info('🏆 Seeding achievements and notifications...');
    await seedAchievements();
    await seedNotifications();
    
    // Remaining models
    logger.info('📦 Seeding remaining models...');
    const results = await seedAllModels();
    
    // Summary
    logger.info('\n✅ Seeding completed successfully!');
    logger.info(`📈 Summary:`);
    logger.info(`   - Users: ${users.length}`);
    logger.info(`   - Tribes: 5`);
    logger.info(`   - Videos: 50`);
    logger.info(`   - Battles: 25`);
    logger.info(`   - Transformations: 30`);
    logger.info('\n🚀 Your database is now ready for Postman testing!');
    
  } catch (err) {
    logger.error('❌ Seeding error:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    logger.info('🔌 MongoDB connection closed');
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };


