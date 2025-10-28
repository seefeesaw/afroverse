const UserReward = require('../models/UserReward');
const UserCosmetic = require('../models/UserCosmetic');
const UserAchievement = require('../models/UserAchievement');
const { logger } = require('../utils/logger');

class RewardService {
  constructor() {
    this.rewardTypes = {
      voucher: 'voucher',
      token: 'token',
      cosmetic: 'cosmetic',
      boost: 'boost',
      xp: 'xp',
      title: 'title'
    };
  }

  // Grant reward to user
  async grantReward(userId, reward) {
    try {
      const {
        type,
        key,
        qty = 1,
        ttlDays = null,
        label = null,
        grantedBy,
        metadata = {}
      } = reward;

      // Calculate expiry date
      const expiresAt = ttlDays ? new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000) : null;

      // Create reward record
      const rewardData = {
        type,
        key,
        qty,
        expiresAt,
        label: label || this.deriveLabel(key),
        grantedBy,
        metadata
      };

      // Add to user rewards
      const userReward = await UserReward.grantReward(userId, rewardData);

      // If it's a cosmetic, also add to user cosmetics
      if (type === 'cosmetic') {
        await this.grantCosmetic(userId, {
          key,
          type: this.getCosmeticType(key),
          expiresAt,
          acquiredBy: grantedBy,
          metadata
        });
      }

      logger.info(`Reward granted to user ${userId}: ${type} - ${key} (${qty})`);

      return {
        success: true,
        rewardId: userReward.items[userReward.items.length - 1].id,
        reward: rewardData
      };

    } catch (error) {
      logger.error('Error granting reward:', error);
      throw error;
    }
  }

  // Grant multiple rewards
  async grantRewards(userId, rewards) {
    try {
      const results = [];

      for (const reward of rewards) {
        const result = await this.grantReward(userId, reward);
        results.push(result);
      }

      logger.info(`Granted ${rewards.length} rewards to user ${userId}`);

      return {
        success: true,
        results
      };

    } catch (error) {
      logger.error('Error granting multiple rewards:', error);
      throw error;
    }
  }

  // Grant cosmetic to user
  async grantCosmetic(userId, cosmetic) {
    try {
      const {
        key,
        type,
        expiresAt = null,
        acquiredBy,
        metadata = {}
      } = cosmetic;

      if (expiresAt) {
        // Temporary cosmetic
        await UserCosmetic.addTemporaryCosmetic(userId, {
          key,
          type,
          expiresAt,
          acquiredBy,
          metadata
        });
      } else {
        // Permanent cosmetic
        await UserCosmetic.addCosmetic(userId, {
          key,
          type,
          acquiredBy,
          metadata
        });
      }

      logger.info(`Cosmetic granted to user ${userId}: ${type} - ${key}`);

      return {
        success: true,
        cosmetic: { key, type, expiresAt }
      };

    } catch (error) {
      logger.error('Error granting cosmetic:', error);
      throw error;
    }
  }

  // Claim reward
  async claimReward(userId, rewardId) {
    try {
      const userReward = await UserReward.claimReward(userId, rewardId);
      
      if (!userReward) {
        throw new Error('Reward not found');
      }

      const reward = userReward.items.find(item => item.id === rewardId);
      
      if (!reward) {
        throw new Error('Reward not found');
      }

      logger.info(`Reward claimed by user ${userId}: ${reward.key}`);

      return {
        success: true,
        reward: {
          id: reward.id,
          type: reward.type,
          key: reward.key,
          label: reward.label,
          qty: reward.qty
        }
      };

    } catch (error) {
      logger.error('Error claiming reward:', error);
      throw error;
    }
  }

  // Consume reward
  async consumeReward(userId, rewardId) {
    try {
      const userReward = await UserReward.consumeReward(userId, rewardId);
      
      if (!userReward) {
        throw new Error('Reward not found');
      }

      const reward = userReward.items.find(item => item.id === rewardId);
      
      if (!reward) {
        throw new Error('Reward not found');
      }

      logger.info(`Reward consumed by user ${userId}: ${reward.key}`);

      return {
        success: true,
        reward: {
          id: reward.id,
          type: reward.type,
          key: reward.key,
          label: reward.label,
          qty: reward.qty
        }
      };

    } catch (error) {
      logger.error('Error consuming reward:', error);
      throw error;
    }
  }

  // Equip cosmetic
  async equipCosmetic(userId, slot, key) {
    try {
      // Check if user owns the cosmetic
      const userCosmetic = await UserCosmetic.getUserCosmetics(userId);
      
      if (!userCosmetic) {
        throw new Error('User cosmetics not found');
      }

      if (!userCosmetic.ownsCosmetic(key)) {
        throw new Error('Cosmetic not owned');
      }

      // Equip the cosmetic
      await UserCosmetic.equipCosmetic(userId, slot, key);

      logger.info(`Cosmetic equipped by user ${userId}: ${slot} - ${key}`);

      return {
        success: true,
        equipped: { [slot]: key }
      };

    } catch (error) {
      logger.error('Error equipping cosmetic:', error);
      throw error;
    }
  }

  // Unequip cosmetic
  async unequipCosmetic(userId, slot) {
    try {
      await UserCosmetic.unequipCosmetic(userId, slot);

      logger.info(`Cosmetic unequipped by user ${userId}: ${slot}`);

      return {
        success: true,
        unequipped: slot
      };

    } catch (error) {
      logger.error('Error unequipping cosmetic:', error);
      throw error;
    }
  }

  // Get user's unclaimed rewards
  async getUnclaimedRewards(userId) {
    try {
      const userReward = await UserReward.getUserRewards(userId);
      
      if (!userReward) {
        return [];
      }

      return userReward.getUnclaimedRewards();

    } catch (error) {
      logger.error('Error getting unclaimed rewards:', error);
      throw error;
    }
  }

  // Get user's inventory
  async getUserInventory(userId) {
    try {
      const userReward = await UserReward.getUserRewards(userId);
      const userCosmetic = await UserCosmetic.getUserCosmetics(userId);

      if (!userReward) {
        return {
          vouchers: {},
          tokens: {},
          boosts: [],
          cosmetics: {
            equipped: {},
            owned: [],
            temporary: []
          }
        };
      }

      const inventory = userReward.getInventorySummary();
      
      if (userCosmetic) {
        inventory.cosmetics = userCosmetic.getCosmeticDisplayInfo();
      }

      return inventory;

    } catch (error) {
      logger.error('Error getting user inventory:', error);
      throw error;
    }
  }

  // Get user's equipped cosmetics
  async getEquippedCosmetics(userId) {
    try {
      const userCosmetic = await UserCosmetic.getUserCosmetics(userId);
      
      if (!userCosmetic) {
        return {
          frame: null,
          title: null,
          confetti: null
        };
      }

      return userCosmetic.getEquippedCosmetics();

    } catch (error) {
      logger.error('Error getting equipped cosmetics:', error);
      throw error;
    }
  }

  // Check if user has reward
  async hasReward(userId, key, qty = 1) {
    try {
      const userReward = await UserReward.getUserRewards(userId);
      
      if (!userReward) {
        return false;
      }

      return userReward.hasReward(key, qty);

    } catch (error) {
      logger.error('Error checking reward:', error);
      return false;
    }
  }

  // Get reward quantity
  async getRewardQuantity(userId, key) {
    try {
      const userReward = await UserReward.getUserRewards(userId);
      
      if (!userReward) {
        return 0;
      }

      return userReward.getRewardQuantity(key);

    } catch (error) {
      logger.error('Error getting reward quantity:', error);
      return 0;
    }
  }

  // Clean expired rewards
  async cleanExpiredRewards(userId) {
    try {
      const userReward = await UserReward.getUserRewards(userId);
      
      if (!userReward) {
        return 0;
      }

      const cleaned = userReward.cleanExpiredRewards();
      
      if (cleaned > 0) {
        await userReward.save();
      }

      return cleaned;

    } catch (error) {
      logger.error('Error cleaning expired rewards:', error);
      throw error;
    }
  }

  // Clean expired cosmetics
  async cleanExpiredCosmetics(userId) {
    try {
      const userCosmetic = await UserCosmetic.getUserCosmetics(userId);
      
      if (!userCosmetic) {
        return 0;
      }

      const cleaned = userCosmetic.cleanExpiredCosmetics();
      
      if (cleaned > 0) {
        await userCosmetic.save();
      }

      return cleaned;

    } catch (error) {
      logger.error('Error cleaning expired cosmetics:', error);
      throw error;
    }
  }

  // Get reward statistics
  async getRewardStatistics() {
    try {
      const stats = await UserReward.getRewardStatistics();
      return stats;

    } catch (error) {
      logger.error('Error getting reward statistics:', error);
      throw error;
    }
  }

  // Get cosmetic statistics
  async getCosmeticStatistics() {
    try {
      const stats = await UserCosmetic.getCosmeticStatistics();
      return stats;

    } catch (error) {
      logger.error('Error getting cosmetic statistics:', error);
      throw error;
    }
  }

  // Get top reward earners
  async getTopRewardEarners(limit = 10) {
    try {
      const earners = await UserReward.getTopRewardEarners(limit);
      return earners;

    } catch (error) {
      logger.error('Error getting top reward earners:', error);
      throw error;
    }
  }

  // Get top cosmetic collectors
  async getTopCosmeticCollectors(limit = 10) {
    try {
      const collectors = await UserCosmetic.getTopCollectors(limit);
      return collectors;

    } catch (error) {
      logger.error('Error getting top cosmetic collectors:', error);
      throw error;
    }
  }

  // Derive label from key
  deriveLabel(key) {
    const labels = {
      'style_voucher': 'Premium Style Voucher',
      'freeze': 'Freeze Token',
      'xp_2x': '2× XP Boost',
      'frame_gold': 'Gold Frame',
      'frame_diamond': 'Diamond Frame',
      'frame_mythic': 'Mythic Frame',
      'title_diamond': 'Diamond Elder',
      'title_warrior': 'Warrior',
      'title_unstoppable': 'Unstoppable',
      'confetti_classic': 'Confetti Animation',
      'tribe_pin': 'Tribe Pin',
      'tribe_crown': 'Tribe Crown'
    };
    
    return labels[key] || key;
  }

  // Get cosmetic type from key
  getCosmeticType(key) {
    if (key.startsWith('frame_')) return 'frame';
    if (key.startsWith('title_')) return 'title';
    if (key.startsWith('confetti_')) return 'confetti';
    if (key.startsWith('badge_')) return 'badge';
    return 'cosmetic';
  }

  // Get reward type info
  getRewardTypeInfo(type) {
    const info = {
      voucher: {
        name: 'Voucher',
        description: 'Redeemable for premium items',
        icon: '🎫'
      },
      token: {
        name: 'Token',
        description: 'Special utility item',
        icon: '🪙'
      },
      cosmetic: {
        name: 'Cosmetic',
        description: 'Visual customization item',
        icon: '✨'
      },
      boost: {
        name: 'Boost',
        description: 'Temporary enhancement',
        icon: '⚡'
      },
      xp: {
        name: 'XP',
        description: 'Experience points',
        icon: '⭐'
      },
      title: {
        name: 'Title',
        description: 'Display name modifier',
        icon: '👑'
      }
    };
    
    return info[type] || { name: type, description: '', icon: '❓' };
  }

  // Validate reward data
  validateRewardData(reward) {
    const errors = [];
    
    if (!reward.type || !this.rewardTypes[reward.type]) {
      errors.push('Invalid reward type');
    }
    
    if (!reward.key) {
      errors.push('Reward key is required');
    }
    
    if (!reward.grantedBy || !reward.grantedBy.type) {
      errors.push('Granted by information is required');
    }
    
    if (reward.qty && (typeof reward.qty !== 'number' || reward.qty <= 0)) {
      errors.push('Quantity must be a positive number');
    }
    
    if (reward.ttlDays && (typeof reward.ttlDays !== 'number' || reward.ttlDays <= 0)) {
      errors.push('TTL days must be a positive number');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Get reward display info
  getRewardDisplayInfo(reward) {
    const typeInfo = this.getRewardTypeInfo(reward.type);
    
    return {
      ...reward,
      typeInfo,
      displayName: reward.label || this.deriveLabel(reward.key),
      icon: typeInfo.icon
    };
  }
}

// Create singleton instance
const rewardService = new RewardService();

module.exports = rewardService;
