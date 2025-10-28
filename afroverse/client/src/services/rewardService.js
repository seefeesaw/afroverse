import api from './api';

class RewardService {
  constructor() {
    this.baseURL = '/api/rewards';
  }

  // Get user achievements
  async getUserAchievements() {
    try {
      const response = await api.get(`${this.baseURL}/achievements`);
      return response.data;
    } catch (error) {
      console.error('Error getting user achievements:', error);
      throw error;
    }
  }

  // Get unclaimed rewards (inbox)
  async getUnclaimedRewards() {
    try {
      const response = await api.get(`${this.baseURL}/inbox`);
      return response.data;
    } catch (error) {
      console.error('Error getting unclaimed rewards:', error);
      throw error;
    }
  }

  // Claim reward
  async claimReward(rewardId) {
    try {
      const response = await api.post(`${this.baseURL}/claim`, {
        rewardId
      });
      return response.data;
    } catch (error) {
      console.error('Error claiming reward:', error);
      throw error;
    }
  }

  // Equip cosmetic
  async equipCosmetic(slot, key) {
    try {
      const response = await api.post(`${this.baseURL}/equip`, {
        slot,
        key
      });
      return response.data;
    } catch (error) {
      console.error('Error equipping cosmetic:', error);
      throw error;
    }
  }

  // Get user inventory
  async getUserInventory() {
    try {
      const response = await api.get(`${this.baseURL}/inventory`);
      return response.data;
    } catch (error) {
      console.error('Error getting user inventory:', error);
      throw error;
    }
  }

  // Get equipped cosmetics
  async getEquippedCosmetics() {
    try {
      const response = await api.get(`${this.baseURL}/equipped`);
      return response.data;
    } catch (error) {
      console.error('Error getting equipped cosmetics:', error);
      throw error;
    }
  }

  // Get achievements by category
  async getAchievementsByCategory(category) {
    try {
      const response = await api.get(`${this.baseURL}/achievements/category/${category}`);
      return response.data;
    } catch (error) {
      console.error('Error getting achievements by category:', error);
      throw error;
    }
  }

  // Get achievements by rarity
  async getAchievementsByRarity(rarity) {
    try {
      const response = await api.get(`${this.baseURL}/achievements/rarity/${rarity}`);
      return response.data;
    } catch (error) {
      console.error('Error getting achievements by rarity:', error);
      throw error;
    }
  }

  // Get all achievements
  async getAllAchievements() {
    try {
      const response = await api.get(`${this.baseURL}/achievements/all`);
      return response.data;
    } catch (error) {
      console.error('Error getting all achievements:', error);
      throw error;
    }
  }

  // Get achievement by key
  async getAchievementByKey(key) {
    try {
      const response = await api.get(`${this.baseURL}/achievements/${key}`);
      return response.data;
    } catch (error) {
      console.error('Error getting achievement by key:', error);
      throw error;
    }
  }

  // Get user achievement statistics
  async getUserAchievementStatistics() {
    try {
      const response = await api.get(`${this.baseURL}/achievements/statistics/user`);
      return response.data;
    } catch (error) {
      console.error('Error getting user achievement statistics:', error);
      throw error;
    }
  }

  // Get recent achievements
  async getRecentAchievements(limit = 5) {
    try {
      const response = await api.get(`${this.baseURL}/achievements/recent`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting recent achievements:', error);
      throw error;
    }
  }

  // Get achievement progress summary
  async getAchievementProgressSummary() {
    try {
      const response = await api.get(`${this.baseURL}/achievements/progress`);
      return response.data;
    } catch (error) {
      console.error('Error getting achievement progress summary:', error);
      throw error;
    }
  }

  // Get achievement categories
  async getAchievementCategories() {
    try {
      const response = await api.get(`${this.baseURL}/achievements/categories`);
      return response.data;
    } catch (error) {
      console.error('Error getting achievement categories:', error);
      throw error;
    }
  }

  // Get rarity info
  async getRarityInfo(rarity) {
    try {
      const response = await api.get(`${this.baseURL}/rarity/${rarity}`);
      return response.data;
    } catch (error) {
      console.error('Error getting rarity info:', error);
      throw error;
    }
  }

  // Get reward statistics
  async getRewardStatistics() {
    try {
      const response = await api.get(`${this.baseURL}/statistics/rewards`);
      return response.data;
    } catch (error) {
      console.error('Error getting reward statistics:', error);
      throw error;
    }
  }

  // Get cosmetic statistics
  async getCosmeticStatistics() {
    try {
      const response = await api.get(`${this.baseURL}/statistics/cosmetics`);
      return response.data;
    } catch (error) {
      console.error('Error getting cosmetic statistics:', error);
      throw error;
    }
  }

  // Get top reward earners
  async getTopRewardEarners(limit = 10) {
    try {
      const response = await api.get(`${this.baseURL}/statistics/top-earners`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting top reward earners:', error);
      throw error;
    }
  }

  // Get top cosmetic collectors
  async getTopCosmeticCollectors(limit = 10) {
    try {
      const response = await api.get(`${this.baseURL}/statistics/top-collectors`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting top cosmetic collectors:', error);
      throw error;
    }
  }

  // Get top achievers
  async getTopAchievers(limit = 10) {
    try {
      const response = await api.get(`${this.baseURL}/statistics/top-achievers`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting top achievers:', error);
      throw error;
    }
  }

  // Get achievement completion rates
  async getAchievementCompletionRates() {
    try {
      const response = await api.get(`${this.baseURL}/statistics/completion-rates`);
      return response.data;
    } catch (error) {
      console.error('Error getting achievement completion rates:', error);
      throw error;
    }
  }

  // Utility Methods

  // Get rarity color
  getRarityColor(rarity) {
    const colors = {
      common: '#9CA3AF',    // gray
      rare: '#3B82F6',      // blue
      epic: '#8B5CF6',      // purple
      legendary: '#F59E0B'  // gold
    };
    return colors[rarity] || colors.common;
  }

  // Get rarity icon
  getRarityIcon(rarity) {
    const icons = {
      common: '🔶',
      rare: '🔷',
      epic: '🟡',
      legendary: '💠'
    };
    return icons[rarity] || icons.common;
  }

  // Get category icon
  getCategoryIcon(category) {
    const icons = {
      streak: '🔥',
      battle: '⚔️',
      vote: '🗳️',
      tribe: '🏛️',
      leaderboard: '🏆',
      transform: '✨',
      seasonal: '🎄'
    };
    return icons[category] || '❓';
  }

  // Get category name
  getCategoryName(category) {
    const names = {
      streak: 'Streak',
      battle: 'Battles',
      vote: 'Voting',
      tribe: 'Tribe',
      leaderboard: 'Leaderboard',
      transform: 'Transformations',
      seasonal: 'Seasonal'
    };
    return names[category] || category;
  }

  // Get reward type icon
  getRewardTypeIcon(type) {
    const icons = {
      voucher: '🎫',
      token: '🪙',
      cosmetic: '✨',
      boost: '⚡',
      xp: '⭐',
      title: '👑'
    };
    return icons[type] || '❓';
  }

  // Get reward type name
  getRewardTypeName(type) {
    const names = {
      voucher: 'Voucher',
      token: 'Token',
      cosmetic: 'Cosmetic',
      boost: 'Boost',
      xp: 'XP',
      title: 'Title'
    };
    return names[type] || type;
  }

  // Get cosmetic type name
  getCosmeticTypeName(type) {
    const names = {
      frame: 'Frame',
      title: 'Title',
      confetti: 'Confetti',
      badge: 'Badge'
    };
    return names[type] || type;
  }

  // Get cosmetic slot name
  getCosmeticSlotName(slot) {
    const names = {
      frame: 'Frame',
      title: 'Title',
      confetti: 'Confetti'
    };
    return names[slot] || slot;
  }

  // Format progress percentage
  formatProgress(progress) {
    return Math.round(progress);
  }

  // Get progress color
  getProgressColor(progress) {
    if (progress >= 100) return '#10B981'; // green
    if (progress >= 75) return '#3B82F6';  // blue
    if (progress >= 50) return '#F59E0B';  // yellow
    if (progress >= 25) return '#EF4444';  // red
    return '#6B7280'; // gray
  }

  // Get achievement display info
  getAchievementDisplayInfo(achievement) {
    return {
      ...achievement,
      rarityColor: this.getRarityColor(achievement.rarity),
      rarityIcon: this.getRarityIcon(achievement.rarity),
      categoryIcon: this.getCategoryIcon(achievement.category),
      categoryName: this.getCategoryName(achievement.category)
    };
  }

  // Get reward display info
  getRewardDisplayInfo(reward) {
    return {
      ...reward,
      typeIcon: this.getRewardTypeIcon(reward.type),
      typeName: this.getRewardTypeName(reward.type)
    };
  }

  // Get cosmetic display info
  getCosmeticDisplayInfo(cosmetic) {
    return {
      ...cosmetic,
      typeName: this.getCosmeticTypeName(cosmetic.type)
    };
  }

  // Check if achievement is unlocked
  isAchievementUnlocked(achievement, unlockedAchievements) {
    return unlockedAchievements.some(unlocked => unlocked.key === achievement.key);
  }

  // Get achievement progress
  getAchievementProgress(achievement, progress) {
    if (achievement.progress) {
      return achievement.progress;
    }

    const { metric, target } = achievement.requirements;
    const value = progress[metric] || 0;
    const progressPercent = Math.min((value / target) * 100, 100);

    return {
      metric,
      value,
      target,
      progress: progressPercent
    };
  }

  // Get achievement status
  getAchievementStatus(achievement, unlockedAchievements, progress) {
    const isUnlocked = this.isAchievementUnlocked(achievement, unlockedAchievements);
    
    if (isUnlocked) {
      return 'unlocked';
    }

    const achievementProgress = this.getAchievementProgress(achievement, progress);
    
    if (achievementProgress.progress >= 100) {
      return 'ready';
    }

    if (achievementProgress.progress > 0) {
      return 'in_progress';
    }

    return 'locked';
  }

  // Get achievement status color
  getAchievementStatusColor(status) {
    const colors = {
      unlocked: '#10B981',    // green
      ready: '#3B82F6',       // blue
      in_progress: '#F59E0B', // yellow
      locked: '#6B7280'       // gray
    };
    return colors[status] || colors.locked;
  }

  // Get achievement status text
  getAchievementStatusText(status) {
    const texts = {
      unlocked: 'Unlocked',
      ready: 'Ready to Unlock',
      in_progress: 'In Progress',
      locked: 'Locked'
    };
    return texts[status] || texts.locked;
  }

  // Get achievement status icon
  getAchievementStatusIcon(status) {
    const icons = {
      unlocked: '✅',
      ready: '🎯',
      in_progress: '⏳',
      locked: '🔒'
    };
    return icons[status] || icons.locked;
  }

  // Get achievement unlock date
  getAchievementUnlockDate(achievement, unlockedAchievements) {
    const unlocked = unlockedAchievements.find(unlocked => unlocked.key === achievement.key);
    return unlocked ? unlocked.unlockedAt : null;
  }

  // Format unlock date
  formatUnlockDate(date) {
    if (!date) return null;
    
    const unlockDate = new Date(date);
    return unlockDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Get achievement requirements text
  getAchievementRequirementsText(achievement) {
    const { metric, target, type } = achievement.requirements;
    
    const metricNames = {
      battles_won: 'Win battles',
      votes_cast: 'Cast votes',
      tribe_points: 'Earn tribe points',
      streak_current: 'Maintain streak',
      streak_longest: 'Achieve longest streak',
      transforms_created: 'Create transformations',
      leaderboard_rank: 'Reach leaderboard rank',
      tribe_rank: 'Reach tribe rank'
    };

    const metricName = metricNames[metric] || metric;
    
    switch (type) {
      case 'threshold':
        return `${metricName}: ${target}`;
      case 'compound':
        return 'Multiple requirements';
      case 'weekly':
        return `Weekly: ${metricName}: ${target}`;
      case 'seasonal':
        return `Seasonal: ${metricName}: ${target}`;
      default:
        return `${metricName}: ${target}`;
    }
  }

  // Get achievement rewards text
  getAchievementRewardsText(achievement) {
    if (!achievement.rewards || achievement.rewards.length === 0) {
      return 'No rewards';
    }

    return achievement.rewards.map(reward => {
      const typeName = this.getRewardTypeName(reward.type);
      const qty = reward.qty > 1 ? ` x${reward.qty}` : '';
      return `${typeName}${qty}`;
    }).join(', ');
  }

  // Get achievement description
  getAchievementDescription(achievement) {
    return achievement.description || 'Complete the requirements to unlock this achievement.';
  }

  // Get achievement name
  getAchievementName(achievement) {
    return achievement.name || achievement.key;
  }

  // Get achievement key
  getAchievementKey(achievement) {
    return achievement.key;
  }

  // Get achievement rarity
  getAchievementRarity(achievement) {
    return achievement.rarity;
  }

  // Get achievement category
  getAchievementCategory(achievement) {
    return achievement.category;
  }

  // Get achievement icon
  getAchievementIcon(achievement) {
    return achievement.icon;
  }

  // Get achievement badge
  getAchievementBadge(achievement) {
    return achievement.badge;
  }

  // Get achievement rewards
  getAchievementRewards(achievement) {
    return achievement.rewards || [];
  }

  // Get achievement requirements
  getAchievementRequirements(achievement) {
    return achievement.requirements;
  }

  // Get achievement sort order
  getAchievementSortOrder(achievement) {
    return achievement.sortOrder || 0;
  }

  // Sort achievements
  sortAchievements(achievements, sortBy = 'sortOrder') {
    return achievements.sort((a, b) => {
      switch (sortBy) {
        case 'sortOrder':
          return a.sortOrder - b.sortOrder;
        case 'rarity':
          const rarityOrder = { common: 0, rare: 1, epic: 2, legendary: 3 };
          return rarityOrder[a.rarity] - rarityOrder[b.rarity];
        case 'category':
          return a.category.localeCompare(b.category);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }

  // Filter achievements
  filterAchievements(achievements, filters) {
    return achievements.filter(achievement => {
      if (filters.category && achievement.category !== filters.category) {
        return false;
      }
      
      if (filters.rarity && achievement.rarity !== filters.rarity) {
        return false;
      }
      
      if (filters.status) {
        // This would need to be passed with the achievement data
        // For now, we'll skip this filter
      }
      
      return true;
    });
  }

  // Search achievements
  searchAchievements(achievements, query) {
    if (!query) return achievements;
    
    const lowercaseQuery = query.toLowerCase();
    
    return achievements.filter(achievement => {
      return achievement.name.toLowerCase().includes(lowercaseQuery) ||
             achievement.description.toLowerCase().includes(lowercaseQuery) ||
             achievement.key.toLowerCase().includes(lowercaseQuery);
    });
  }

  // Get achievement count by category
  getAchievementCountByCategory(achievements) {
    const counts = {};
    
    achievements.forEach(achievement => {
      counts[achievement.category] = (counts[achievement.category] || 0) + 1;
    });
    
    return counts;
  }

  // Get achievement count by rarity
  getAchievementCountByRarity(achievements) {
    const counts = {};
    
    achievements.forEach(achievement => {
      counts[achievement.rarity] = (counts[achievement.rarity] || 0) + 1;
    });
    
    return counts;
  }

  // Get achievement count by status
  getAchievementCountByStatus(achievements, unlockedAchievements, progress) {
    const counts = { unlocked: 0, ready: 0, in_progress: 0, locked: 0 };
    
    achievements.forEach(achievement => {
      const status = this.getAchievementStatus(achievement, unlockedAchievements, progress);
      counts[status]++;
    });
    
    return counts;
  }

  // Get achievement completion percentage
  getAchievementCompletionPercentage(achievements, unlockedAchievements) {
    if (achievements.length === 0) return 0;
    
    const unlockedCount = achievements.filter(achievement => 
      this.isAchievementUnlocked(achievement, unlockedAchievements)
    ).length;
    
    return Math.round((unlockedCount / achievements.length) * 100);
  }

  // Get achievement progress summary
  getAchievementProgressSummary(achievements, unlockedAchievements, progress) {
    const total = achievements.length;
    const unlocked = achievements.filter(achievement => 
      this.isAchievementUnlocked(achievement, unlockedAchievements)
    ).length;
    const ready = achievements.filter(achievement => {
      const status = this.getAchievementStatus(achievement, unlockedAchievements, progress);
      return status === 'ready';
    }).length;
    const inProgress = achievements.filter(achievement => {
      const status = this.getAchievementStatus(achievement, unlockedAchievements, progress);
      return status === 'in_progress';
    }).length;
    const locked = total - unlocked - ready - inProgress;
    
    return {
      total,
      unlocked,
      ready,
      inProgress,
      locked,
      completionPercentage: Math.round((unlocked / total) * 100)
    };
  }
}

// Create singleton instance
const rewardService = new RewardService();

export default rewardService;
