const mongoose = require('mongoose');

const notificationCampaignSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  templates: {
    whatsapp: {
      templateId: {
        type: String,
        default: null
      },
      templateName: {
        type: String,
        default: null
      }
    },
    push: {
      templateId: {
        type: String,
        default: null
      },
      templateName: {
        type: String,
        default: null
      }
    },
    inapp: {
      templateId: {
        type: String,
        default: null
      },
      templateName: {
        type: String,
        default: null
      }
    }
  },
  targeting: {
    rules: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    audience: {
      type: String,
      enum: ['all', 'active', 'inactive', 'tribe', 'custom'],
      default: 'all'
    },
    customAudience: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  },
  throttle: {
    perUserCooldownMin: {
      type: Number,
      default: 120
    },
    maxPerDay: {
      type: Number,
      default: 3
    },
    maxPerHour: {
      type: Number,
      default: 1
    }
  },
  schedule: {
    type: {
      type: String,
      enum: ['immediate', 'scheduled', 'recurring'],
      default: 'immediate'
    },
    cronExpression: {
      type: String,
      default: null
    },
    timezone: {
      type: String,
      default: 'Africa/Johannesburg'
    }
  },
  abTesting: {
    enabled: {
      type: Boolean,
      default: false
    },
    variants: [{
      name: {
        type: String,
        required: true
      },
      weight: {
        type: Number,
        default: 1
      },
      templates: {
        whatsapp: String,
        push: String,
        inapp: String
      }
    }]
  },
  active: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 1
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
notificationCampaignSchema.index({ key: 1 }, { unique: true });
notificationCampaignSchema.index({ active: 1 });
notificationCampaignSchema.index({ priority: -1 });

// Method to get template for channel
notificationCampaignSchema.methods.getTemplateForChannel = function(channel, variant = null) {
  if (this.abTesting.enabled && variant) {
    const variantData = this.abTesting.variants.find(v => v.name === variant);
    if (variantData && variantData.templates[channel]) {
      return variantData.templates[channel];
    }
  }
  
  return this.templates[channel]?.templateId || null;
};

// Method to get variant for user
notificationCampaignSchema.methods.getVariantForUser = function(userId) {
  if (!this.abTesting.enabled || this.abTesting.variants.length <= 1) {
    return null;
  }
  
  // Simple hash-based variant assignment
  const hash = this.hashString(userId.toString() + this.key);
  const totalWeight = this.abTesting.variants.reduce((sum, v) => sum + v.weight, 0);
  let random = hash % totalWeight;
  
  for (const variant of this.abTesting.variants) {
    random -= variant.weight;
    if (random < 0) {
      return variant.name;
    }
  }
  
  return this.abTesting.variants[0].name;
};

// Method to hash string
notificationCampaignSchema.methods.hashString = function(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

// Method to check if campaign should run
notificationCampaignSchema.methods.shouldRun = function() {
  if (!this.active) return false;
  
  // Check schedule
  if (this.schedule.type === 'scheduled') {
    const now = new Date();
    const scheduledTime = new Date(this.schedule.scheduledAt);
    return now >= scheduledTime;
  }
  
  return true;
};

// Method to get targeting rules
notificationCampaignSchema.methods.getTargetingRules = function() {
  return this.targeting.rules || {};
};

// Method to get audience criteria
notificationCampaignSchema.methods.getAudienceCriteria = function() {
  return {
    audience: this.targeting.audience,
    customAudience: this.targeting.customAudience
  };
};

// Method to get throttle settings
notificationCampaignSchema.methods.getThrottleSettings = function() {
  return {
    perUserCooldownMin: this.throttle.perUserCooldownMin,
    maxPerDay: this.throttle.maxPerDay,
    maxPerHour: this.throttle.maxPerHour
  };
};

// Static method to get active campaigns
notificationCampaignSchema.statics.getActiveCampaigns = function() {
  return this.find({ active: true }).sort({ priority: -1 });
};

// Static method to get campaign by key
notificationCampaignSchema.statics.getByKey = function(key) {
  return this.findOne({ key, active: true });
};

// Static method to get campaigns for targeting
notificationCampaignSchema.statics.getCampaignsForTargeting = function(targetingRules) {
  const query = { active: true };
  
  // Add targeting rule filters if needed
  if (targetingRules.categories) {
    query['targeting.rules.categories'] = { $in: targetingRules.categories };
  }
  
  return this.find(query).sort({ priority: -1 });
};

// Static method to create default campaigns
notificationCampaignSchema.statics.createDefaultCampaigns = async function() {
  const defaultCampaigns = [
    {
      key: 'streak_at_risk',
      name: 'Streak At Risk',
      description: 'Notify users when their streak is at risk',
      templates: {
        whatsapp: {
          templateId: 'wa_streak_v1',
          templateName: 'Streak At Risk WhatsApp'
        },
        push: {
          templateId: 'push_streak_v1',
          templateName: 'Streak At Risk Push'
        },
        inapp: {
          templateId: 'inapp_streak_v1',
          templateName: 'Streak At Risk In-App'
        }
      },
      targeting: {
        rules: {
          streakNotSafe: true,
          timeToMidnightLE: 120
        },
        audience: 'active'
      },
      throttle: {
        perUserCooldownMin: 120,
        maxPerDay: 2,
        maxPerHour: 1
      }
    },
    {
      key: 'battle_live',
      name: 'Battle Live',
      description: 'Notify users when their battle goes live',
      templates: {
        whatsapp: {
          templateId: 'wa_battle_live_v1',
          templateName: 'Battle Live WhatsApp'
        },
        push: {
          templateId: 'push_battle_live_v1',
          templateName: 'Battle Live Push'
        },
        inapp: {
          templateId: 'inapp_battle_live_v1',
          templateName: 'Battle Live In-App'
        }
      },
      targeting: {
        rules: {
          inBattle: true
        },
        audience: 'custom'
      },
      throttle: {
        perUserCooldownMin: 60,
        maxPerDay: 5,
        maxPerHour: 2
      }
    },
    {
      key: 'battle_2h_left',
      name: 'Battle 2h Left',
      description: 'Notify users when battle has 2 hours left',
      templates: {
        push: {
          templateId: 'push_battle_t2h',
          templateName: 'Battle 2h Left Push'
        },
        inapp: {
          templateId: 'inapp_battle_t2h',
          templateName: 'Battle 2h Left In-App'
        }
      },
      targeting: {
        rules: {
          inBattle: true,
          battleTimeLeftLE: 120
        },
        audience: 'custom'
      },
      throttle: {
        perUserCooldownMin: 60,
        maxPerDay: 3,
        maxPerHour: 1
      }
    },
    {
      key: 'transform_ready',
      name: 'Transformation Ready',
      description: 'Notify users when their transformation is ready',
      templates: {
        push: {
          templateId: 'push_transform',
          templateName: 'Transformation Ready Push'
        },
        inapp: {
          templateId: 'inapp_transform',
          templateName: 'Transformation Ready In-App'
        }
      },
      targeting: {
        rules: {
          transformCompleted: true
        },
        audience: 'custom'
      },
      throttle: {
        perUserCooldownMin: 30,
        maxPerDay: 10,
        maxPerHour: 5
      }
    },
    {
      key: 'tribe_hour',
      name: 'Tribe Hour',
      description: 'Notify users during tribe hour events',
      templates: {
        inapp: {
          templateId: 'inapp_tribe_hour',
          templateName: 'Tribe Hour In-App'
        }
      },
      targeting: {
        rules: {
          tribeHourActive: true
        },
        audience: 'tribe'
      },
      throttle: {
        perUserCooldownMin: 60,
        maxPerDay: 2,
        maxPerHour: 1
      }
    }
  ];
  
  for (const campaignData of defaultCampaigns) {
    await this.findOneAndUpdate(
      { key: campaignData.key },
      campaignData,
      { upsert: true, new: true }
    );
  }
  
  return defaultCampaigns;
};

module.exports = mongoose.model('NotificationCampaign', notificationCampaignSchema);
