const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  walletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    required: true,
  },
  type: {
    type: String,
    enum: ['earn', 'spend', 'purchase', 'refund', 'bonus'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  reason: {
    type: String,
    enum: [
      // Earning reasons
      'daily_checkin',
      'streak_maintain_3',
      'streak_maintain_7',
      'streak_maintain_14',
      'streak_maintain_30',
      'streak_maintain_90',
      'battle_win',
      'battle_participation',
      'vote_10_battles',
      'share_transformation',
      'referral_join',
      'tribe_win',
      'level_up',
      'achievement_unlock',
      'first_transformation',
      'first_battle',
      'weekly_challenge',
      'monthly_challenge',
      
      // Spending reasons
      'streak_save',
      'battle_boost',
      'priority_transformation',
      'retry_transformation',
      'premium_filter',
      'tribe_support',
      'rematch_battle',
      'skip_ad',
      'unlock_style',
      
      // Purchase reasons
      'coin_pack_small',
      'coin_pack_medium',
      'coin_pack_large',
      'coin_pack_mega',
      
      // Other reasons
      'admin_grant',
      'system_bonus',
      'compensation',
      'refund'
    ],
    required: true,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  balanceBefore: {
    type: Number,
    required: true,
  },
  balanceAfter: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'completed',
  },
  paymentId: {
    type: String, // For purchase transactions
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for efficient queries
walletTransactionSchema.index({ userId: 1, createdAt: -1 });
walletTransactionSchema.index({ walletId: 1, createdAt: -1 });
walletTransactionSchema.index({ type: 1, createdAt: -1 });
walletTransactionSchema.index({ reason: 1, createdAt: -1 });
walletTransactionSchema.index({ status: 1 });

// Virtual for transaction description
walletTransactionSchema.virtual('description').get(function() {
  const descriptions = {
    // Earning descriptions
    daily_checkin: 'Daily Check-in Bonus',
    streak_maintain_3: '3-Day Streak Bonus',
    streak_maintain_7: '7-Day Streak Bonus',
    streak_maintain_14: '14-Day Streak Bonus',
    streak_maintain_30: '30-Day Streak Bonus',
    streak_maintain_90: '90-Day Streak Bonus',
    battle_win: 'Battle Victory',
    battle_participation: 'Battle Participation',
    vote_10_battles: 'Voting Milestone',
    share_transformation: 'Transformation Shared',
    referral_join: 'Friend Referral',
    tribe_win: 'Tribe Victory',
    level_up: 'Level Up Bonus',
    achievement_unlock: 'Achievement Unlocked',
    first_transformation: 'First Transformation',
    first_battle: 'First Battle',
    weekly_challenge: 'Weekly Challenge',
    monthly_challenge: 'Monthly Challenge',
    
    // Spending descriptions
    streak_save: 'Streak Protection',
    battle_boost: 'Battle Boost',
    priority_transformation: 'Priority Processing',
    retry_transformation: 'Transformation Retry',
    premium_filter: 'Premium Filter',
    tribe_support: 'Tribe Support',
    rematch_battle: 'Battle Rematch',
    skip_ad: 'Skip Advertisement',
    unlock_style: 'Style Unlock',
    
    // Purchase descriptions
    coin_pack_small: 'Small Coin Pack',
    coin_pack_medium: 'Medium Coin Pack',
    coin_pack_large: 'Large Coin Pack',
    coin_pack_mega: 'Mega Coin Pack',
    
    // Other descriptions
    admin_grant: 'Admin Grant',
    system_bonus: 'System Bonus',
    compensation: 'Compensation',
    refund: 'Refund'
  };
  
  return descriptions[this.reason] || this.reason;
});

// Virtual for transaction icon
walletTransactionSchema.virtual('icon').get(function() {
  const icons = {
    // Earning icons
    daily_checkin: '🎯',
    streak_maintain_3: '🔥',
    streak_maintain_7: '🔥',
    streak_maintain_14: '🔥',
    streak_maintain_30: '🔥',
    streak_maintain_90: '🔥',
    battle_win: '⚔️',
    battle_participation: '👥',
    vote_10_battles: '🗳️',
    share_transformation: '📤',
    referral_join: '👥',
    tribe_win: '🏆',
    level_up: '⬆️',
    achievement_unlock: '🏅',
    first_transformation: '✨',
    first_battle: '⚔️',
    weekly_challenge: '📅',
    monthly_challenge: '📅',
    
    // Spending icons
    streak_save: '🛡️',
    battle_boost: '⚡',
    priority_transformation: '⚡',
    retry_transformation: '🔄',
    premium_filter: '✨',
    tribe_support: '🤝',
    rematch_battle: '🔄',
    skip_ad: '⏭️',
    unlock_style: '🎨',
    
    // Purchase icons
    coin_pack_small: '💰',
    coin_pack_medium: '💰',
    coin_pack_large: '💰',
    coin_pack_mega: '💰',
    
    // Other icons
    admin_grant: '👨‍💼',
    system_bonus: '🎁',
    compensation: '💸',
    refund: '↩️'
  };
  
  return icons[this.reason] || '💰';
});

// Method to get transaction summary
walletTransactionSchema.methods.getSummary = function() {
  return {
    id: this._id,
    type: this.type,
    amount: this.amount,
    reason: this.reason,
    description: this.description,
    icon: this.icon,
    balanceBefore: this.balanceBefore,
    balanceAfter: this.balanceAfter,
    metadata: this.metadata,
    createdAt: this.createdAt,
    status: this.status
  };
};

module.exports = mongoose.model('WalletTransaction', walletTransactionSchema);
