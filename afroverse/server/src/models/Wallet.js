const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  balance: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalEarned: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalSpent: {
    type: Number,
    default: 0,
    min: 0,
  },
  lastEarnedAt: {
    type: Date,
    default: null,
  },
  dailyEarned: {
    type: Number,
    default: 0,
    min: 0,
  },
  dailyEarnedDate: {
    type: Date,
    default: Date.now,
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

// Index for efficient queries
walletSchema.index({ userId: 1 });
walletSchema.index({ balance: -1 });

// Pre-save middleware to update timestamps
walletSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to check if daily earning limit is reached
walletSchema.methods.canEarnToday = function() {
  const today = new Date();
  const lastEarnedDate = new Date(this.dailyEarnedDate);
  
  // Reset daily earned if it's a new day
  if (today.toDateString() !== lastEarnedDate.toDateString()) {
    this.dailyEarned = 0;
    this.dailyEarnedDate = today;
    return true;
  }
  
  // Check if daily limit (100 coins) is reached
  return this.dailyEarned < 100;
};

// Method to add coins with daily limit check
walletSchema.methods.addCoins = function(amount, reason) {
  if (!this.canEarnToday()) {
    throw new Error('Daily earning limit reached');
  }
  
  this.balance += amount;
  this.totalEarned += amount;
  this.dailyEarned += amount;
  this.lastEarnedAt = new Date();
  
  return this.save();
};

// Method to spend coins
walletSchema.methods.spendCoins = function(amount, reason) {
  if (this.balance < amount) {
    throw new Error('Insufficient coins');
  }
  
  this.balance -= amount;
  this.totalSpent += amount;
  
  return this.save();
};

// Static method to get or create wallet
walletSchema.statics.getOrCreateWallet = async function(userId) {
  let wallet = await this.findOne({ userId });
  
  if (!wallet) {
    wallet = new this({ userId });
    await wallet.save();
  }
  
  return wallet;
};

module.exports = mongoose.model('Wallet', walletSchema);
