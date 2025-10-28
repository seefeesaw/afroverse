const mongoose = require('mongoose');

const motionPackSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  bpmRange: {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
  },
  region: {
    type: String,
    required: true,
  },
  culturalContext: {
    type: String,
    required: true,
  },
  file: {
    type: String,
    required: true, // Path to pose data file (JSON/BVH)
  },
  previewGif: {
    type: String,
    default: null, // URL to preview GIF
  },
  phrases: [{
    start: { type: Number, required: true },
    end: { type: Number, required: true },
    description: String,
  }],
  safety: {
    kneeBendMax: { type: Number, default: 120 },
    armRaiseMax: { type: Number, default: 160 },
    hipTwistMax: { type: Number, default: 45 },
    neckBendMax: { type: Number, default: 30 },
  },
  metadata: {
    durationSec: { type: Number, required: true },
    frameCount: { type: Number, required: true },
    complexity: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate',
    },
    intensity: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.6,
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes
motionPackSchema.index({ id: 1 });
motionPackSchema.index({ region: 1 });
motionPackSchema.index({ 'bpmRange.min': 1, 'bpmRange.max': 1 });
motionPackSchema.index({ isActive: 1 });

// Update the updatedAt field before saving
motionPackSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to get motion packs by BPM
motionPackSchema.statics.getByBPM = function(bpm) {
  return this.find({
    isActive: true,
    'bpmRange.min': { $lte: bpm },
    'bpmRange.max': { $gte: bpm },
  });
};

// Static method to get motion packs by region
motionPackSchema.statics.getByRegion = function(region) {
  return this.find({
    isActive: true,
    region: region,
  });
};

// Static method to get motion packs by complexity
motionPackSchema.statics.getByComplexity = function(complexity) {
  return this.find({
    isActive: true,
    'metadata.complexity': complexity,
  });
};

module.exports = mongoose.model('MotionPack', motionPackSchema);
