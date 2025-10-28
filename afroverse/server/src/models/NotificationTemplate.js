const mongoose = require('mongoose');

const notificationTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  type: {
    type: String,
    enum: [
      'battle_challenge',
      'battle_live',
      'battle_vote',
      'battle_result',
      'streak_reminder',
      'streak_saved',
      'tribe_alert',
      'tribe_weekly_reset',
      'daily_challenge',
      'coin_earned',
      'coin_low',
      'referral_join',
      'system_update',
      'moderation_action'
    ],
    required: true,
    index: true
  },
  channel: {
    type: String,
    enum: ['push', 'inapp', 'whatsapp', 'email'],
    required: true,
    index: true
  },
  language: {
    type: String,
    default: 'en',
    index: true
  },
  template: {
    title: {
      type: String,
      required: true,
      maxlength: 100
    },
    message: {
      type: String,
      required: true,
      maxlength: 200
    },
    actionText: {
      type: String,
      maxlength: 50
    },
    actionUrl: {
      type: String
    }
  },
  variables: [{
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    required: {
      type: Boolean,
      default: false
    },
    defaultValue: {
      type: String
    }
  }],
  conditions: {
    minLevel: {
      type: Number,
      default: 0
    },
    maxLevel: {
      type: Number
    },
    tribes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tribe'
    }],
    countries: [{
      type: String
    }],
    userTypes: [{
      type: String,
      enum: ['new', 'active', 'inactive', 'premium']
    }]
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  version: {
    type: Number,
    default: 1
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastUsed: {
    type: Date
  },
  usageCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Instance methods
notificationTemplateSchema.methods.render = function(variables = {}) {
  let title = this.template.title;
  let message = this.template.message;
  let actionText = this.template.actionText;
  let actionUrl = this.template.actionUrl;

  // Replace variables in template strings
  this.variables.forEach(variable => {
    const value = variables[variable.name] || variable.defaultValue || '';
    const placeholder = `{{${variable.name}}}`;
    
    title = title.replace(new RegExp(placeholder, 'g'), value);
    message = message.replace(new RegExp(placeholder, 'g'), value);
    if (actionText) {
      actionText = actionText.replace(new RegExp(placeholder, 'g'), value);
    }
    if (actionUrl) {
      actionUrl = actionUrl.replace(new RegExp(placeholder, 'g'), value);
    }
  });

  return {
    title,
    message,
    actionText,
    actionUrl
  };
};

notificationTemplateSchema.methods.validateVariables = function(variables) {
  const errors = [];
  
  this.variables.forEach(variable => {
    if (variable.required && !variables[variable.name]) {
      errors.push(`Required variable '${variable.name}' is missing`);
    }
  });
  
  return errors;
};

notificationTemplateSchema.methods.incrementUsage = function() {
  this.usageCount += 1;
  this.lastUsed = new Date();
  return this.save();
};

// Static methods
notificationTemplateSchema.statics.getTemplate = function(type, channel, language = 'en') {
  return this.findOne({
    type,
    channel,
    language,
    isActive: true
  }).sort({ version: -1 });
};

notificationTemplateSchema.statics.getTemplatesByType = function(type) {
  return this.find({
    type,
    isActive: true
  }).sort({ channel: 1, language: 1 });
};

notificationTemplateSchema.statics.createDefaultTemplates = async function() {
  const defaultTemplates = [
    // Battle Challenge
    {
      name: 'battle_challenge_push',
      type: 'battle_challenge',
      channel: 'push',
      template: {
        title: '🔥 You\'ve been challenged!',
        message: '{{challengerName}} wants to battle you! Accept the challenge?',
        actionText: 'Accept Challenge',
        actionUrl: '/battle/{{battleId}}/accept'
      },
      variables: [
        { name: 'challengerName', description: 'Name of the challenger', required: true },
        { name: 'battleId', description: 'Battle ID', required: true }
      ]
    },
    {
      name: 'battle_challenge_whatsapp',
      type: 'battle_challenge',
      channel: 'whatsapp',
      template: {
        title: 'Battle Challenge',
        message: '🔥 {{challengerName}} has challenged you to a battle! Tap to accept: {{actionUrl}}',
        actionText: 'Accept Battle',
        actionUrl: 'https://afroverse.app/battle/{{battleId}}/accept'
      },
      variables: [
        { name: 'challengerName', description: 'Name of the challenger', required: true },
        { name: 'battleId', description: 'Battle ID', required: true }
      ]
    },
    // Streak Reminder
    {
      name: 'streak_reminder_push',
      type: 'streak_reminder',
      channel: 'push',
      template: {
        title: '⏰ Streak Alert!',
        message: 'Your {{streakDays}}-day streak will break in {{timeLeft}}! Quick selfie to save it?',
        actionText: 'Save Streak',
        actionUrl: '/transform/quick'
      },
      variables: [
        { name: 'streakDays', description: 'Current streak days', required: true },
        { name: 'timeLeft', description: 'Time left to save streak', required: true }
      ]
    },
    // Tribe Alert
    {
      name: 'tribe_alert_push',
      type: 'tribe_alert',
      channel: 'push',
      template: {
        title: '⚔️ {{tribeName}} needs you!',
        message: 'Your tribe dropped to #{{rank}}! Battle now to climb back up!',
        actionText: 'Battle Now',
        actionUrl: '/battle/create'
      },
      variables: [
        { name: 'tribeName', description: 'Tribe name', required: true },
        { name: 'rank', description: 'Current tribe rank', required: true }
      ]
    },
    // Daily Challenge
    {
      name: 'daily_challenge_push',
      type: 'daily_challenge',
      channel: 'push',
      template: {
        title: '🎯 Daily Challenge is live!',
        message: '{{challengeName}} - Complete it to earn {{coinReward}} AF-Coins!',
        actionText: 'Start Challenge',
        actionUrl: '/challenges/daily'
      },
      variables: [
        { name: 'challengeName', description: 'Challenge name', required: true },
        { name: 'coinReward', description: 'Coin reward amount', required: true }
      ]
    },
    // Battle Result
    {
      name: 'battle_result_push',
      type: 'battle_result',
      channel: 'push',
      template: {
        title: '🏆 {{result}}!',
        message: 'You {{result}} the battle {{resultPercentage}}%! Earned {{coinsEarned}} AF-Coins!',
        actionText: 'View Result',
        actionUrl: '/battle/{{battleId}}/result'
      },
      variables: [
        { name: 'result', description: 'Win/Lose', required: true },
        { name: 'resultPercentage', description: 'Result percentage', required: true },
        { name: 'coinsEarned', description: 'Coins earned', required: true },
        { name: 'battleId', description: 'Battle ID', required: true }
      ]
    }
  ];

  for (const template of defaultTemplates) {
    const existing = await this.findOne({ name: template.name });
    if (!existing) {
      await this.create(template);
    }
  }
};

module.exports = mongoose.model('NotificationTemplate', notificationTemplateSchema);