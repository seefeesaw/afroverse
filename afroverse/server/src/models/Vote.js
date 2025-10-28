const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  battleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Battle',
    required: true,
    index: true
  },
  voter: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      sparse: true
    },
    fingerprint: {
      type: String,
      default: null
    },
    ipHash: {
      type: String,
      required: true
    }
  },
  choice: {
    type: String,
    enum: ['challenger', 'defender'],
    required: true
  },
  meta: {
    userAgent: {
      type: String,
      default: null
    },
    country: {
      type: String,
      default: null
    },
    device: {
      type: String,
      default: null
    }
  }
}, {
  timestamps: true
});

// Unique composite indexes for anti-cheat
voteSchema.index({ battleId: 1, 'voter.userId': 1 }, { 
  unique: true, 
  sparse: true,
  partialFilterExpression: { 'voter.userId': { $exists: true } }
});

voteSchema.index({ battleId: 1, 'voter.fingerprint': 1 }, { 
  unique: true, 
  sparse: true,
  partialFilterExpression: { 'voter.fingerprint': { $exists: true } }
});

voteSchema.index({ battleId: 1, 'voter.ipHash': 1 }, { 
  unique: true 
});

// Additional indexes for analytics
voteSchema.index({ battleId: 1, createdAt: -1 });
voteSchema.index({ 'voter.userId': 1, createdAt: -1 });
voteSchema.index({ createdAt: -1 });

// Method to check if user has voted
voteSchema.statics.hasUserVoted = async function(battleId, voterData) {
  const query = { battleId };
  
  // Build OR conditions for different voter identification methods
  const orConditions = [];
  
  if (voterData.userId) {
    orConditions.push({ 'voter.userId': voterData.userId });
  }
  
  if (voterData.fingerprint) {
    orConditions.push({ 'voter.fingerprint': voterData.fingerprint });
  }
  
  if (voterData.ipHash) {
    orConditions.push({ 'voter.ipHash': voterData.ipHash });
  }
  
  if (orConditions.length > 0) {
    query.$or = orConditions;
  }
  
  const existingVote = await this.findOne(query);
  return !!existingVote;
};

// Method to get vote statistics for a battle
voteSchema.statics.getBattleVoteStats = async function(battleId) {
  const stats = await this.aggregate([
    { $match: { battleId: new mongoose.Types.ObjectId(battleId) } },
    {
      $group: {
        _id: '$choice',
        count: { $sum: 1 },
        uniqueUsers: { $addToSet: '$voter.userId' },
        uniqueFingerprints: { $addToSet: '$voter.fingerprint' },
        uniqueIps: { $addToSet: '$voter.ipHash' }
      }
    }
  ]);
  
  const result = {
    challenger: { votes: 0, uniqueVoters: 0 },
    defender: { votes: 0, uniqueVoters: 0 },
    total: 0,
    uniqueVoters: 0
  };
  
  stats.forEach(stat => {
    const uniqueVoters = new Set([
      ...stat.uniqueUsers.filter(Boolean),
      ...stat.uniqueFingerprints.filter(Boolean),
      ...stat.uniqueIps.filter(Boolean)
    ]).size;
    
    result[stat._id] = {
      votes: stat.count,
      uniqueVoters
    };
    result.total += stat.count;
  });
  
  // Calculate total unique voters
  const allUniqueUsers = new Set();
  stats.forEach(stat => {
    stat.uniqueUsers.filter(Boolean).forEach(user => allUniqueUsers.add(user));
    stat.uniqueFingerprints.filter(Boolean).forEach(fp => allUniqueUsers.add(fp));
    stat.uniqueIps.filter(Boolean).forEach(ip => allUniqueUsers.add(ip));
  });
  result.uniqueVoters = allUniqueUsers.size;
  
  return result;
};

// Method to get recent votes for a battle
voteSchema.statics.getRecentVotes = async function(battleId, limit = 10) {
  return this.find({ battleId })
    .populate('voter.userId', 'username avatar')
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('choice voter.userId createdAt')
    .lean();
};

// Method to detect suspicious voting patterns
voteSchema.statics.detectSuspiciousActivity = async function(battleId, timeWindow = 300000) { // 5 minutes
  const cutoffTime = new Date(Date.now() - timeWindow);
  
  const suspiciousPatterns = await this.aggregate([
    {
      $match: {
        battleId: new mongoose.Types.ObjectId(battleId),
        createdAt: { $gte: cutoffTime }
      }
    },
    {
      $group: {
        _id: '$voter.ipHash',
        voteCount: { $sum: 1 },
        uniqueFingerprints: { $addToSet: '$voter.fingerprint' },
        uniqueUsers: { $addToSet: '$voter.userId' }
      }
    },
    {
      $match: {
        $or: [
          { voteCount: { $gt: 5 } }, // More than 5 votes from same IP
          { uniqueFingerprints: { $size: { $gt: 3 } } }, // Multiple fingerprints from same IP
          { uniqueUsers: { $size: { $gt: 2 } } } // Multiple users from same IP
        ]
      }
    }
  ]);
  
  return suspiciousPatterns.length > 0;
};

module.exports = mongoose.model('Vote', voteSchema);
