const mongoose = require('mongoose');

const transformationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  original: {
    url: {
      type: String,
      required: true
    },
    width: {
      type: Number,
      required: true
    },
    height: {
      type: Number,
      required: true
    },
    filename: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    }
  },
  result: {
    url: {
      type: String,
      required: true
    },
    thumbnailUrl: {
      type: String,
      required: true
    },
    style: {
      type: String,
      required: true,
      enum: ['maasai', 'zulu', 'pharaoh', 'afrofuturistic']
    },
    watermark: {
      type: Boolean,
      default: true
    },
    width: {
      type: Number,
      required: true
    },
    height: {
      type: Number,
      required: true
    }
  },
  ai: {
    model: {
      type: String,
      default: 'SDXL'
    },
    prompt: {
      type: String,
      required: true
    },
    negativePrompt: {
      type: String,
      default: 'blurry, low quality, distorted, deformed, ugly, bad anatomy, bad proportions'
    },
    processingTime: {
      type: Number,
      required: true
    },
    intensity: {
      type: Number,
      default: 0.8,
      min: 0.5,
      max: 1.0
    }
  },
  flags: {
    nsfw: {
      type: Boolean,
      default: false
    },
    faceCount: {
      type: Number,
      default: 0
    },
    moderationStatus: {
      type: String,
      enum: ['approved', 'rejected', 'pending'],
      default: 'pending'
    },
    hasFace: {
      type: Boolean,
      default: false
    },
    multipleFaces: {
      type: Boolean,
      default: false
    }
  },
  shareCode: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  jobId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  status: {
    type: String,
    enum: ['queued', 'processing', 'completed', 'failed'],
    default: 'queued'
  },
  error: {
    type: String,
    default: null
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  viewCount: {
    type: Number,
    default: 0
  },
  likeCount: {
    type: Number,
    default: 0
  },
  shareCount: {
    type: Number,
    default: 0
  },
  videoRefs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video'
  }]
}, {
  timestamps: true
});

// Indexes for efficient queries
transformationSchema.index({ userId: 1, createdAt: -1 });
transformationSchema.index({ shareCode: 1 });
transformationSchema.index({ jobId: 1 });
transformationSchema.index({ status: 1 });
transformationSchema.index({ 'flags.moderationStatus': 1 });
transformationSchema.index({ isPublic: 1, createdAt: -1 });

// Method to generate unique share code
transformationSchema.statics.generateShareCode = async function() {
  let shareCode;
  let isUnique = false;
  let attempts = 0;
  
  while (!isUnique && attempts < 10) {
    // Generate 8-character alphanumeric code
    shareCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    const existing = await this.findOne({ shareCode });
    if (!existing) {
      isUnique = true;
    }
    attempts++;
  }
  
  if (!isUnique) {
    // Fallback with timestamp
    shareCode = `T${Date.now().toString(36).toUpperCase()}`;
  }
  
  return shareCode;
};

// Method to generate unique job ID
transformationSchema.statics.generateJobId = async function() {
  let jobId;
  let isUnique = false;
  let attempts = 0;
  
  while (!isUnique && attempts < 10) {
    jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    const existing = await this.findOne({ jobId });
    if (!existing) {
      isUnique = true;
    }
    attempts++;
  }
  
  if (!isUnique) {
    // Fallback with UUID-like format
    jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }
  
  return jobId;
};

// Method to increment view count
transformationSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  return this.save();
};

// Method to increment like count
transformationSchema.methods.incrementLikeCount = function() {
  this.likeCount += 1;
  return this.save();
};

// Method to check if transformation is ready for battle
transformationSchema.methods.isBattleReady = function() {
  return this.status === 'completed' && 
         this.flags.moderationStatus === 'approved' && 
         this.isPublic;
};

// Virtual for public URL
transformationSchema.virtual('publicUrl').get(function() {
  return `/t/${this.shareCode}`;
});

// Ensure virtual fields are serialized
transformationSchema.set('toJSON', { virtuals: true });
transformationSchema.set('toObject', { virtuals: true });

// Method to increment share count
transformationSchema.methods.incrementShareCount = function() {
  this.shareCount += 1;
  
  // Track achievement progress for shares
  try {
    const achievementService = require('../services/achievementService');
    achievementService.checkAchievements(this.userId, 'shares', 1);
  } catch (error) {
    console.error('Error tracking transformation share achievement:', error);
  }
  
  return this.save();
};

module.exports = mongoose.model('Transformation', transformationSchema);
