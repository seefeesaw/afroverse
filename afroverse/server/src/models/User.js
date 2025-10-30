const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  avatar: {
    type: String,
    default: null
  },
  tribe: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tribe',
      default: null
    },
    name: {
      type: String,
      default: null
    },
    joinedAt: {
      type: Date,
      default: null
    },
    canSwitchAt: {
      type: Date,
      default: null
    }
  },
  subscription: {
    status: {
      type: String,
      enum: ['free', 'warrior'],
      default: 'free'
    },
    expiresAt: {
      type: Date,
      default: null
    }
  },
  entitlements: {
    warriorActive: {
      type: Boolean,
      default: false
    },
    multiplier: {
      type: Number,
      default: 1
    },
    aiPriority: {
      type: Boolean,
      default: false
    },
    unlimitedTransformations: {
      type: Boolean,
      default: false
    },
    allStyles: {
      type: Boolean,
      default: false
    },
    warriorBadge: {
      type: Boolean,
      default: false
    },
    fasterProcessing: {
      type: Boolean,
      default: false
    },
    lastUpdatedAt: {
      type: Date,
      default: Date.now
    }
  },
  limits: {
    transformsUsed: {
      type: Number,
      default: 0
    },
    dayResetAt: {
      type: Date,
      default: () => {
        const tomorrow = new Date();
        tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
        tomorrow.setUTCHours(0, 0, 0, 0);
        return tomorrow;
      }
    }
  },
  progression: {
    level: {
      type: Number,
      default: 1
    },
    xp: {
      type: Number,
      default: 0
    },
    nextLevelXp: {
      type: Number,
      default: 100
    },
    vibranium: {
      type: Number,
      default: 0
    },
    badges: [{
      id: {
        type: String,
        required: true
      },
      unlockedAt: {
        type: Date,
        default: Date.now
      }
    }],
    rewards: [{
      id: {
        type: String,
        required: true
      },
      type: {
        type: String,
        enum: ['voucher', 'cosmetic', 'boost'],
        required: true
      },
      claimed: {
        type: Boolean,
        default: false
      },
      grantedAt: {
        type: Date,
        default: Date.now
      },
      consumedAt: {
        type: Date,
        default: null
      }
    }]
  },
  streak: {
    current: {
      type: Number,
      default: 0
    },
    longest: {
      type: Number,
      default: 0
    },
    lastQualifiedAt: {
      type: Date,
      default: null
    },
    lastCheckedDateLocal: {
      type: String,
      default: null
    },
    timezone: {
      type: String,
      default: 'Africa/Johannesburg'
    },
    freeze: {
      available: {
        type: Number,
        default: 0
      },
      lastGrantedAt: {
        type: Date,
        default: null
      }
    }
  },
  daily: {
    voteCount: {
      type: Number,
      default: 0
    },
    loginChecked: {
      type: Boolean,
      default: false
    },
    dayResetAtUTC: {
      type: Date,
      default: () => {
        const tomorrow = new Date();
        tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
        tomorrow.setUTCHours(0, 0, 0, 0);
        return tomorrow;
      }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLoginAt: {
    type: Date,
    default: null
  },
          referral: {
            code: {
              type: String,
              unique: true,
              sparse: true,
            },
            referredBy: {
              type: String,
              default: null,
            },
            referralsCount: {
              type: Number,
              default: 0,
            },
            lastReferralAt: {
              type: Date,
              default: null,
            },
            recruitmentRank: {
              type: String,
              enum: ['scout', 'captain', 'warlord'],
              default: 'scout',
            },
            rewardsClaimed: [{
              type: String,
              enum: ['extra_daily_transform', 'premium_video_unlock', 'coins', 'streak_shield', 'tribe_power_buff', 'rare_badge', 'warrior_pass_week'],
            }],
            dailyInviteCount: {
              type: Number,
              default: 0,
            },
            lastInviteDate: {
              type: Date,
              default: null,
            },
          },
          challenges: {
            dailyStreak: {
              current: {
                type: Number,
                default: 0,
              },
              longest: {
                type: Number,
                default: 0,
              },
              lastActiveAt: {
                type: Date,
                default: null,
              },
            },
            weeklyStreak: {
              current: {
                type: Number,
                default: 0,
              },
              longest: {
                type: Number,
                default: 0,
              },
              lastActiveAt: {
                type: Date,
                default: null,
              },
            },
            totalCompleted: {
              daily: {
                type: Number,
                default: 0,
              },
              weekly: {
                type: Number,
                default: 0,
              },
            },
            lastDailyChallengeDate: {
              type: Date,
              default: null,
            },
            lastWeeklyChallengeWeek: {
              type: Number,
              default: null,
            },
            streakFreezes: {
              type: Number,
              default: 0,
            },
            streakFreezesUsed: {
              type: Number,
              default: 0,
            },
          },
  // Creator Profile Fields
  followersCount: {
    type: Number,
    default: 0,
    index: true,
  },
  followingCount: {
    type: Number,
    default: 0,
  },
  bio: {
    type: String,
    maxlength: 160,
    default: '',
  },
  bannerUrl: {
    type: String,
    default: null,
  },
  isCreator: {
    type: Boolean,
    default: false,
    index: true,
  },
  creatorStats: {
    totalViews: {
      type: Number,
      default: 0,
    },
    totalVotes: {
      type: Number,
      default: 0,
    },
    winRate: {
      type: Number,
      default: 0,
    },
    consistencyScore: {
      type: Number,
      default: 0,
    },
    totalShares: {
      type: Number,
      default: 0,
    },
    creatorRank: {
      type: Number,
      default: null,
    },
    lastRankUpdate: {
      type: Date,
      default: null,
    },
  },
  profileViews: {
    type: Number,
    default: 0,
  },
  lastProfileView: {
    type: Date,
    default: null,
  },
  // Achievement System Fields
  achievements: {
    unlocked: [{
      achievementId: {
        type: String,
        ref: 'Achievement',
      },
      unlockedAt: {
        type: Date,
        default: Date.now,
      },
      rewardClaimed: {
        type: Boolean,
        default: false,
      },
    }],
    totalXp: {
      type: Number,
      default: 0,
    },
    lastAchievementCheck: {
      type: Date,
      default: Date.now,
    },
  },
  // Achievement Progress Tracking
  achievementProgress: {
    transformations: { type: Number, default: 0 },
    battlesWon: { type: Number, default: 0 },
    votesCast: { type: Number, default: 0 },
    tribePointsEarned: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    followers: { type: Number, default: 0 },
    following: { type: Number, default: 0 },
  },
}, {
  timestamps: true
});

// Index for efficient queries
userSchema.index({ phone: 1 });
userSchema.index({ username: 1 });
userSchema.index({ 'tribe.id': 1 });
userSchema.index({ followersCount: -1 });
userSchema.index({ isCreator: 1, followersCount: -1 });
userSchema.index({ 'creatorStats.creatorRank': 1 });
userSchema.index({ 'subscription.status': 1 });
userSchema.index({ 'streak.lastQualifiedAt': -1 });
userSchema.index({ 'progression.level': -1 });

// Method to generate unique username
userSchema.statics.generateUsername = async function() {
  let username;
  let isUnique = false;
  let attempts = 0;
  
  while (!isUnique && attempts < 10) {
    const randomNum = Math.floor(Math.random() * 9000) + 1000;
    username = `Warrior_${randomNum}`;
    
    const existing = await this.findOne({ username });
    if (!existing) {
      isUnique = true;
    }
    attempts++;
  }
  
  if (!isUnique) {
    // Fallback with timestamp
    username = `Warrior_${Date.now().toString().slice(-4)}`;
  }
  
  return username;
};

// Method to check and reset daily limits
userSchema.methods.checkDailyLimits = function() {
  const now = new Date();
  
  if (now > this.limits.dayResetAt) {
    this.limits.transformsUsed = 0;
    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);
    this.limits.dayResetAt = tomorrow;
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Method to check if user can transform
userSchema.methods.canTransform = function() {
  if (this.entitlements.unlimitedTransformations) {
    return true;
  }
  
  return this.limits.transformsUsed < 3;
};

// Method to increment transform usage
userSchema.methods.incrementTransformUsage = function() {
  this.limits.transformsUsed += 1;
  return this.save();
};

// Method to check and reset daily counters
userSchema.methods.checkDailyReset = function() {
  const now = new Date();
  
  if (now > this.daily.dayResetAtUTC) {
    this.daily.voteCount = 0;
    this.daily.loginChecked = false;
    
    // Set next reset to tomorrow at midnight UTC
    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);
    this.daily.dayResetAtUTC = tomorrow;
    
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Method to increment vote count
userSchema.methods.incrementVoteCount = function() {
  this.daily.voteCount += 1;
  return this.save();
};

// Method to check if user has qualified today
userSchema.methods.hasQualifiedToday = function() {
  const now = new Date();
  const tz = this.streak.timezone || 'Africa/Johannesburg';
  const todayLocal = this.toLocalDateString(now, tz);
  
  return this.streak.lastCheckedDateLocal === todayLocal;
};

// Method to get time until midnight in user's timezone
userSchema.methods.getTimeUntilMidnight = function() {
  const now = new Date();
  const tz = this.streak.timezone || 'Africa/Johannesburg';
  
  // Get next midnight in user's timezone
  const tomorrow = new Date(now);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);
  
  // Convert to user's timezone
  const userMidnight = new Date(tomorrow.toLocaleString('en-US', { timeZone: tz }));
  
  return Math.floor((userMidnight - now) / 1000);
};

// Static method to convert UTC date to local date string
userSchema.statics.toLocalDateString = function(date, timezone) {
  return new Date(date.toLocaleString('en-US', { timeZone: timezone }))
    .toISOString()
    .split('T')[0];
};

// Method to convert UTC date to local date string
userSchema.methods.toLocalDateString = function(date, timezone) {
  return User.toLocalDateString(date, timezone);
};

// Method to calculate day difference in local timezone
userSchema.methods.dayDiffLocal = function(date1, date2, timezone) {
  const d1 = new Date(date1 + 'T00:00:00');
  const d2 = new Date(date2 + 'T00:00:00');
  return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
};

// Method to activate warrior entitlements
userSchema.methods.activateWarriorEntitlements = function() {
  this.entitlements.warriorActive = true;
  this.entitlements.multiplier = 2;
  this.entitlements.aiPriority = true;
  this.entitlements.unlimitedTransformations = true;
  this.entitlements.allStyles = true;
  this.entitlements.warriorBadge = true;
  this.entitlements.fasterProcessing = true;
  this.entitlements.lastUpdatedAt = new Date();
  this.subscription.status = 'warrior';
  return this.save();
};

// Method to deactivate warrior entitlements
userSchema.methods.deactivateWarriorEntitlements = function() {
  this.entitlements.warriorActive = false;
  this.entitlements.multiplier = 1;
  this.entitlements.aiPriority = false;
  this.entitlements.unlimitedTransformations = false;
  this.entitlements.allStyles = false;
  this.entitlements.warriorBadge = false;
  this.entitlements.fasterProcessing = false;
  this.entitlements.lastUpdatedAt = new Date();
  this.subscription.status = 'free';
  return this.save();
};

// Method to check if user has warrior entitlements
userSchema.methods.hasWarriorEntitlements = function() {
  return this.entitlements.warriorActive && this.subscription.status === 'warrior';
};

// Method to get tribe points multiplier
userSchema.methods.getTribePointsMultiplier = function() {
  return this.entitlements.multiplier || 1;
};

// Method to check if user has AI priority
userSchema.methods.hasAiPriority = function() {
  return this.entitlements.aiPriority || false;
};

// Method to check if user has all styles
userSchema.methods.hasAllStyles = function() {
  return this.entitlements.allStyles || false;
};

// Method to check if user has warrior badge
userSchema.methods.hasWarriorBadge = function() {
  return this.entitlements.warriorBadge || false;
};

// Method to check if user has faster processing
userSchema.methods.hasFasterProcessing = function() {
  return this.entitlements.fasterProcessing || false;
};

// Method to update entitlements from subscription
userSchema.methods.updateEntitlementsFromSubscription = function(subscription) {
  if (subscription && subscription.isActive()) {
    this.activateWarriorEntitlements();
  } else {
    this.deactivateWarriorEntitlements();
  }
  return this.save();
};

// Creator Profile Methods
userSchema.methods.incrementFollowersCount = function() {
  this.followersCount += 1;
  return this.save();
};

userSchema.methods.decrementFollowersCount = function() {
  this.followersCount = Math.max(0, this.followersCount - 1);
  return this.save();
};

userSchema.methods.incrementFollowingCount = function() {
  this.followingCount += 1;
  return this.save();
};

userSchema.methods.decrementFollowingCount = function() {
  this.followingCount = Math.max(0, this.followingCount - 1);
  return this.save();
};

userSchema.methods.updateCreatorStats = function(stats) {
  if (stats.views) this.creatorStats.totalViews += stats.views;
  if (stats.votes) this.creatorStats.totalVotes += stats.votes;
  if (stats.shares) this.creatorStats.totalShares += stats.shares;
  if (stats.winRate !== undefined) this.creatorStats.winRate = stats.winRate;
  if (stats.consistencyScore !== undefined) this.creatorStats.consistencyScore = stats.consistencyScore;
  return this.save();
};

userSchema.methods.updateCreatorRank = function(rank) {
  this.creatorStats.creatorRank = rank;
  this.creatorStats.lastRankUpdate = new Date();
  return this.save();
};

userSchema.methods.incrementProfileViews = function() {
  this.profileViews += 1;
  this.lastProfileView = new Date();
  return this.save();
};

userSchema.methods.getCreatorRankTier = function() {
  const rank = this.creatorStats.creatorRank;
  if (!rank) return 'unranked';
  if (rank <= 10) return 'legend';
  if (rank <= 50) return 'gold';
  if (rank <= 100) return 'silver';
  if (rank <= 500) return 'bronze';
  return 'rising';
};

userSchema.methods.getCreatorScore = function() {
  const stats = this.creatorStats;
  // TikTok-style ranking algorithm
  const viewsScore = Math.log10(stats.totalViews + 1) * 30;
  const votesScore = Math.log10(stats.totalVotes + 1) * 25;
  const winRateScore = stats.winRate * 20;
  const consistencyScore = stats.consistencyScore * 15;
  const sharesScore = Math.log10(stats.totalShares + 1) * 10;
  
  return viewsScore + votesScore + winRateScore + consistencyScore + sharesScore;
};

userSchema.methods.promoteToCreator = function() {
  this.isCreator = true;
  return this.save();
};

// Achievement System Methods
userSchema.methods.updateAchievementProgress = function(metric, value) {
  if (this.achievementProgress[metric] !== undefined) {
    this.achievementProgress[metric] += value;
  }
  return this.save();
};

userSchema.methods.unlockAchievement = function(achievementId) {
  const existingAchievement = this.achievements.unlocked.find(
    a => a.achievementId === achievementId
  );
  
  if (!existingAchievement) {
    this.achievements.unlocked.push({
      achievementId,
      unlockedAt: new Date(),
      rewardClaimed: false
    });
  }
  
  return this.save();
};

userSchema.methods.hasAchievement = function(achievementId) {
  return this.achievements.unlocked.some(a => a.achievementId === achievementId);
};

userSchema.methods.claimAchievementReward = function(achievementId) {
  const achievement = this.achievements.unlocked.find(
    a => a.achievementId === achievementId
  );
  
  if (achievement && !achievement.rewardClaimed) {
    achievement.rewardClaimed = true;
    return this.save();
  }
  
  return Promise.resolve(this);
};

userSchema.methods.addAchievementXp = function(xp) {
  this.achievements.totalXp += xp;
  return this.save();
};

userSchema.methods.getAchievementProgress = function(metric) {
  return this.achievementProgress[metric] || 0;
};

module.exports = mongoose.model('User', userSchema);
