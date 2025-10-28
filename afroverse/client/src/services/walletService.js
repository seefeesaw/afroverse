const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class WalletService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/wallet`;
  }

  // Get wallet balance and info
  async getWallet() {
    try {
      const response = await fetch(`${this.baseURL}`, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get wallet');
      }

      return data;
    } catch (error) {
      console.error('Get wallet error:', error);
      throw error;
    }
  }

  // Earn coins
  async earnCoins(reason, metadata = {}, amount = null) {
    try {
      const response = await fetch(`${this.baseURL}/earn`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify({ reason, metadata, amount }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to earn coins');
      }

      return data;
    } catch (error) {
      console.error('Earn coins error:', error);
      throw error;
    }
  }

  // Spend coins
  async spendCoins(reason, metadata = {}, amount = null) {
    try {
      const response = await fetch(`${this.baseURL}/spend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify({ reason, metadata, amount }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to spend coins');
      }

      return data;
    } catch (error) {
      console.error('Spend coins error:', error);
      throw error;
    }
  }

  // Purchase coins
  async purchaseCoins(packType, paymentId) {
    try {
      const response = await fetch(`${this.baseURL}/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify({ packType, paymentId }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to purchase coins');
      }

      return data;
    } catch (error) {
      console.error('Purchase coins error:', error);
      throw error;
    }
  }

  // Get transaction history
  async getTransactionHistory(options = {}) {
    try {
      const queryString = new URLSearchParams(options).toString();
      const response = await fetch(`${this.baseURL}/history?${queryString}`, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get transaction history');
      }

      return data;
    } catch (error) {
      console.error('Get transaction history error:', error);
      throw error;
    }
  }

  // Get earning opportunities
  async getEarningOpportunities() {
    try {
      const response = await fetch(`${this.baseURL}/opportunities`, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get earning opportunities');
      }

      return data;
    } catch (error) {
      console.error('Get earning opportunities error:', error);
      throw error;
    }
  }

  // Get spending options
  async getSpendingOptions() {
    try {
      const response = await fetch(`${this.baseURL}/spending-options`, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get spending options');
      }

      return data;
    } catch (error) {
      console.error('Get spending options error:', error);
      throw error;
    }
  }

  // Get coin packs
  async getCoinPacks() {
    try {
      const response = await fetch(`${this.baseURL}/coin-packs`, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get coin packs');
      }

      return data;
    } catch (error) {
      console.error('Get coin packs error:', error);
      throw error;
    }
  }

  // Check if user can perform action
  async checkAction(action) {
    try {
      const response = await fetch(`${this.baseURL}/check-action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to check action');
      }

      return data;
    } catch (error) {
      console.error('Check action error:', error);
      throw error;
    }
  }

  // Save streak
  async saveStreak(reason) {
    try {
      const response = await fetch(`${this.baseURL}/save-streak`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify({ reason }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to save streak');
      }

      return data;
    } catch (error) {
      console.error('Save streak error:', error);
      throw error;
    }
  }

  // Apply battle boost
  async battleBoost(battleId) {
    try {
      const response = await fetch(`${this.baseURL}/battle-boost`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify({ battleId }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to apply battle boost');
      }

      return data;
    } catch (error) {
      console.error('Battle boost error:', error);
      throw error;
    }
  }

  // Priority transformation
  async priorityTransformation(transformationId) {
    try {
      const response = await fetch(`${this.baseURL}/priority-transformation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify({ transformationId }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to apply priority processing');
      }

      return data;
    } catch (error) {
      console.error('Priority transformation error:', error);
      throw error;
    }
  }

  // Retry transformation
  async retryTransformation(transformationId) {
    try {
      const response = await fetch(`${this.baseURL}/retry-transformation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify({ transformationId }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to retry transformation');
      }

      return data;
    } catch (error) {
      console.error('Retry transformation error:', error);
      throw error;
    }
  }

  // Support tribe
  async tribeSupport(tribeId) {
    try {
      const response = await fetch(`${this.baseURL}/tribe-support`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify({ tribeId }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to support tribe');
      }

      return data;
    } catch (error) {
      console.error('Tribe support error:', error);
      throw error;
    }
  }

  // Utility methods
  getToken() {
    return localStorage.getItem('token');
  }

  // Coin earning methods for integration with other features
  async earnDailyCheckin() {
    return this.earnCoins('daily_checkin');
  }

  async earnStreakBonus(dayCount) {
    const reason = `streak_maintain_${dayCount}`;
    return this.earnCoins(reason);
  }

  async earnBattleWin() {
    return this.earnCoins('battle_win');
  }

  async earnBattleParticipation() {
    return this.earnCoins('battle_participation');
  }

  async earnVoteMilestone() {
    return this.earnCoins('vote_10_battles');
  }

  async earnShareTransformation() {
    return this.earnCoins('share_transformation');
  }

  async earnReferralJoin() {
    return this.earnCoins('referral_join');
  }

  async earnTribeWin() {
    return this.earnCoins('tribe_win');
  }

  async earnLevelUp() {
    return this.earnCoins('level_up');
  }

  async earnAchievementUnlock() {
    return this.earnCoins('achievement_unlock');
  }

  async earnFirstTransformation() {
    return this.earnCoins('first_transformation');
  }

  async earnFirstBattle() {
    return this.earnCoins('first_battle');
  }

  async earnWeeklyChallenge() {
    return this.earnCoins('weekly_challenge');
  }

  async earnMonthlyChallenge() {
    return this.earnCoins('monthly_challenge');
  }
}

export default new WalletService();
