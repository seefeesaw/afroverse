import api from './api';

class ProgressionService {
  constructor() {
    this.baseURL = '/api/progression';
  }

  // Get user progression summary
  async getUserProgression() {
    try {
      const response = await api.get(`${this.baseURL}/progression`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user progression:', error);
      throw error;
    }
  }

  // Get streak status
  async getStreakStatus() {
    try {
      const response = await api.get(`${this.baseURL}/streak`);
      return response.data;
    } catch (error) {
      console.error('Error fetching streak status:', error);
      throw error;
    }
  }

  // Get qualifying actions status
  async getQualifyingActionsStatus() {
    try {
      const response = await api.get(`${this.baseURL}/qualifying-actions`);
      return response.data;
    } catch (error) {
      console.error('Error fetching qualifying actions status:', error);
      throw error;
    }
  }

  // Use freeze
  async useFreeze(confirm = true) {
    try {
      const response = await api.post(`${this.baseURL}/freeze/use`, { confirm });
      return response.data;
    } catch (error) {
      console.error('Error using freeze:', error);
      throw error;
    }
  }

  // Claim reward
  async claimReward(rewardId) {
    try {
      const response = await api.post(`${this.baseURL}/reward/claim`, { rewardId });
      return response.data;
    } catch (error) {
      console.error('Error claiming reward:', error);
      throw error;
    }
  }

  // Handle daily login
  async handleDailyLogin() {
    try {
      const response = await api.post(`${this.baseURL}/daily-login`);
      return response.data;
    } catch (error) {
      console.error('Error handling daily login:', error);
      throw error;
    }
  }

  // Grant XP (internal service endpoint)
  async grantXp(userId, xp, reason, context = {}) {
    try {
      const response = await api.post(`${this.baseURL}/xp`, {
        userId,
        xp,
        reason,
        context
      });
      return response.data;
    } catch (error) {
      console.error('Error granting XP:', error);
      throw error;
    }
  }

  // Mark qualifying action (internal)
  async markQualifyingAction(userId, action) {
    try {
      const response = await api.post(`${this.baseURL}/qualify`, {
        userId,
        action
      });
      return response.data;
    } catch (error) {
      console.error('Error marking qualifying action:', error);
      throw error;
    }
  }

  // Grant freeze (admin/payment endpoint)
  async grantFreeze(userId, count = 1, source = 'admin') {
    try {
      const response = await api.post(`${this.baseURL}/freeze/grant`, {
        userId,
        count,
        source
      });
      return response.data;
    } catch (error) {
      console.error('Error granting freeze:', error);
      throw error;
    }
  }

  // Format time until midnight
  formatTimeUntilMidnight(seconds) {
    if (seconds <= 0) return '0m';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

  // Get streak status message
  getStreakStatusMessage(streak, safeToday, timeToMidnightSec) {
    if (safeToday) {
      return `You're safe today! 🔥 ${streak} day streak`;
    } else {
      const timeLeft = this.formatTimeUntilMidnight(timeToMidnightSec);
      return `Don't lose your ${streak} day streak! ${timeLeft} left`;
    }
  }

  // Get level progress percentage
  getLevelProgressPercentage(currentXp, nextLevelXp) {
    if (!nextLevelXp || nextLevelXp <= 0) return 0;
    
    const previousLevelXp = this.getPreviousLevelXp(currentXp);
    const progressXp = currentXp - previousLevelXp;
    const requiredXp = nextLevelXp - previousLevelXp;
    
    return Math.min(100, Math.max(0, (progressXp / requiredXp) * 100));
  }

  // Get previous level XP (approximate)
  getPreviousLevelXp(currentXp) {
    if (currentXp <= 100) return 0;
    if (currentXp <= 300) return 100;
    if (currentXp <= 700) return 300;
    if (currentXp <= 1500) return 700;
    
    // For higher levels, use a more complex calculation
    let level = 1;
    let xp = 0;
    
    while (xp < currentXp) {
      level++;
      xp = Math.floor(xp * 1.5 + 50);
    }
    
    return Math.floor((xp / 1.5) - 50);
  }

  // Get milestone status
  getMilestoneStatus(streak, milestone) {
    const isUnlocked = streak >= milestone.threshold;
    const progress = Math.min(100, (streak / milestone.threshold) * 100);
    
    return {
      isUnlocked,
      progress,
      remaining: Math.max(0, milestone.threshold - streak)
    };
  }

  // Get reward type display name
  getRewardTypeDisplayName(type) {
    const names = {
      voucher: 'Voucher',
      cosmetic: 'Cosmetic',
      boost: 'Boost'
    };
    return names[type] || type;
  }

  // Get reward description
  getRewardDescription(rewardId) {
    const descriptions = {
      premium_style_pass_1: '1 Premium Style Pass',
      xp_boost_24h: '24h XP Boost',
      diamond_title: 'Diamond Title',
      mythic_frame: 'Mythic Frame'
    };
    return descriptions[rewardId] || rewardId;
  }

  // Get streak emoji
  getStreakEmoji(streak) {
    if (streak >= 365) return '🏆';
    if (streak >= 100) return '💎';
    if (streak >= 30) return '🥇';
    if (streak >= 7) return '🥈';
    if (streak >= 3) return '🥉';
    return '🔥';
  }

  // Get level emoji
  getLevelEmoji(level) {
    if (level >= 50) return '👑';
    if (level >= 25) return '🏆';
    if (level >= 10) return '⭐';
    if (level >= 5) return '🌟';
    return '⭐';
  }

  // Get motivational message
  getMotivationalMessage(streak, level) {
    if (streak >= 365) {
      return 'You\'re a legend! Keep the mythic streak alive!';
    } else if (streak >= 100) {
      return 'Diamond status! You\'re unstoppable!';
    } else if (streak >= 30) {
      return 'Gold streak! You\'re on fire!';
    } else if (streak >= 7) {
      return 'Silver streak! Keep the momentum!';
    } else if (streak >= 3) {
      return 'Bronze streak! You\'re getting started!';
    } else if (streak > 0) {
      return 'Keep it up! Every day counts!';
    } else {
      return 'Start your streak today!';
    }
  }

  // Get at-risk message
  getAtRiskMessage(streak, timeToMidnightSec) {
    const timeLeft = this.formatTimeUntilMidnight(timeToMidnightSec);
    
    if (streak >= 30) {
      return `Don't lose your ${streak} day gold streak! ${timeLeft} left`;
    } else if (streak >= 7) {
      return `Don't lose your ${streak} day silver streak! ${timeLeft} left`;
    } else if (streak >= 3) {
      return `Don't lose your ${streak} day bronze streak! ${timeLeft} left`;
    } else {
      return `Don't lose your ${streak} day streak! ${timeLeft} left`;
    }
  }

  // Get quick action suggestions
  getQuickActionSuggestions(qualifyingActions) {
    const suggestions = [];
    
    if (!qualifyingActions.transform) {
      suggestions.push({
        action: 'transform',
        title: 'Create a Transformation',
        description: 'Upload a selfie and transform it',
        icon: '🎨',
        priority: 1
      });
    }
    
    if (!qualifyingActions.voteBundle && qualifyingActions.votesNeeded > 0) {
      suggestions.push({
        action: 'vote',
        title: `Vote ${qualifyingActions.votesNeeded} More Times`,
        description: 'Vote on battles to complete your daily goal',
        icon: '🗳️',
        priority: 2
      });
    }
    
    if (!qualifyingActions.battleAction) {
      suggestions.push({
        action: 'battle',
        title: 'Start or Accept a Battle',
        description: 'Challenge someone or accept a challenge',
        icon: '⚔️',
        priority: 3
      });
    }
    
    return suggestions.sort((a, b) => a.priority - b.priority);
  }
}

// Create singleton instance
const progressionService = new ProgressionService();

export default progressionService;
