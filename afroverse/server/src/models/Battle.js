const mongoose = require('mongoose');

const battleSchema = new mongoose.Schema({
  shortCode: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  share: {
    code: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    }
  },
  challenger: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: {
      type: String,
      required: true
    },
    tribe: {
      type: String,
      required: true
    },
    transformId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transformation',
      required: true
    },
    transformUrl: {
      type: String,
      required: true
    }
  },
  defender: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    username: {
      type: String,
      default: null
    },
    tribe: {
      type: String,
      default: null
    },
    transformId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transformation',
      default: null
    },
    transformUrl: {
      type: String,
      default: null
    }
  },
  status: {
    current: {
      type: String,
      enum: ['pending', 'active', 'completed', 'expired'],
      default: 'pending',
      index: true
    },
    timeline: {
      created: {
        type: Date,
        default: Date.now
      },
      accepted: {
        type: Date,
        default: null
      },
      started: {
        type: Date,
        default: null
      },
      endsAt: {
        type: Date,
        default: null,
        index: true
      },
      completedAt: {
        type: Date,
        default: null
      }
    }
  },
  votes: {
    challenger: {
      type: Number,
      default: 0
    },
    defender: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    }
  },
  engagement: {
    views: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    source: {
      type: String,
      enum: ['web', 'whatsapp', 'bot', 'unknown'],
      default: 'unknown'
    }
  },
  result: {
    winnerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    marginPct: {
      type: Number,
      default: null
    },
    tribePointsAwarded: {
      winner: {
        type: Number,
        default: null
      },
      loser: {
        type: Number,
        default: null
      }
    },
    tie: {
      type: Boolean,
      default: false
    }
  },
  moderation: {
    reported: {
      type: Boolean,
      default: false
    },
    reportCount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['ok', 'under_review', 'removed'],
      default: 'ok'
    }
  },
  meta: {
    country: {
      type: String,
      default: null
    },
    device: {
      type: String,
      default: null
    },
    challengeMethod: {
      type: String,
      enum: ['whatsapp', 'link', 'username'],
      required: true
    },
    challengeTarget: {
      type: String,
      required: true
    },
    message: {
      type: String,
      default: null
    }
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
battleSchema.index({ shortCode: 1 });
battleSchema.index({ 'status.current': 1, 'status.timeline.endsAt': 1 });
battleSchema.index({ createdAt: -1 });
battleSchema.index({ 'challenger.userId': 1 });
battleSchema.index({ 'defender.userId': 1 });
battleSchema.index({ 'moderation.status': 1 });

// Method to generate unique short code
battleSchema.statics.generateShortCode = async function() {
  let shortCode;
  let isUnique = false;
  let attempts = 0;
  
  while (!isUnique && attempts < 10) {
    // Generate format: BT + 4 digits
    const randomNum = Math.floor(Math.random() * 9000) + 1000;
    shortCode = `BT${randomNum}`;
    
    const existing = await this.findOne({ shortCode });
    if (!existing) {
      isUnique = true;
    }
    attempts++;
  }
  
  if (!isUnique) {
    // Fallback with timestamp
    shortCode = `BT${Date.now().toString().slice(-4)}`;
  }
  
  return shortCode;
};

// Method to accept battle
battleSchema.methods.acceptBattle = function(defenderData) {
  this.defender = defenderData;
  this.status.current = 'active';
  this.status.timeline.accepted = new Date();
  this.status.timeline.started = new Date();
  
  // Set battle to end in 24 hours
  const endTime = new Date();
  endTime.setHours(endTime.getHours() + 24);
  this.status.timeline.endsAt = endTime;
  
  return this.save();
};

// Method to complete battle
battleSchema.methods.completeBattle = async function() {
  const challengerVotes = this.votes.challenger;
  const defenderVotes = this.votes.defender;
  const totalVotes = this.votes.total;
  
  this.status.current = 'completed';
  this.status.timeline.completedAt = new Date();
  
  if (challengerVotes === defenderVotes) {
    // Tie
    this.result.tie = true;
    this.result.tribePointsAwarded = {
      winner: 50,
      loser: 50
    };
  } else {
    // Winner determined
    const winner = challengerVotes > defenderVotes ? 'challenger' : 'defender';
    const winnerUserId = winner === 'challenger' ? this.challenger.userId : this.defender.userId;
    const marginPct = ((Math.max(challengerVotes, defenderVotes) / totalVotes) * 100).toFixed(1);
    
  this.result.winnerUserId = winnerUserId;
  this.result.marginPct = parseFloat(marginPct);
  this.result.tribePointsAwarded = {
    winner: 100,
    loser: 25
  };
  
  // Track achievement progress for battle wins
  try {
    const achievementService = require('../services/achievementService');
    await achievementService.checkAchievements(winnerUserId, 'battles_won', 1);
  } catch (error) {
    console.error('Error tracking battle win achievement:', error);
  }
  }
  
  return this.save();
};

// Method to increment view count
battleSchema.methods.incrementViewCount = function() {
  this.engagement.views += 1;
  return this.save();
};

// Method to increment share count
battleSchema.methods.incrementShareCount = function() {
  this.engagement.shares += 1;
  
  // Track achievement progress for shares
  try {
    const achievementService = require('../services/achievementService');
    achievementService.checkAchievements(this.challenger.userId, 'shares', 1);
    achievementService.checkAchievements(this.defender.userId, 'shares', 1);
  } catch (error) {
    console.error('Error tracking share achievement:', error);
  }
  
  return this.save();
};

// Method to check if battle is active
battleSchema.methods.isActive = function() {
  return this.status.current === 'active' && 
         this.status.timeline.endsAt && 
         new Date() < this.status.timeline.endsAt;
};

// Method to check if battle is pending
battleSchema.methods.isPending = function() {
  return this.status.current === 'pending' && 
         this.status.timeline.endsAt && 
         new Date() < this.status.timeline.endsAt;
};

// Method to check if battle is expired
battleSchema.methods.isExpired = function() {
  return this.status.current === 'expired' || 
         (this.status.timeline.endsAt && new Date() >= this.status.timeline.endsAt);
};

// Method to get time remaining
battleSchema.methods.getTimeRemaining = function() {
  if (!this.status.timeline.endsAt) return 0;
  
  const now = new Date();
  const endTime = this.status.timeline.endsAt;
  
  if (now >= endTime) return 0;
  
  return Math.max(0, endTime.getTime() - now.getTime());
};

// Virtual for public URL
battleSchema.virtual('publicUrl').get(function() {
  return `/b/${this.shortCode}`;
});

// Ensure virtual fields are serialized
battleSchema.set('toJSON', { virtuals: true });
battleSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Battle', battleSchema);
