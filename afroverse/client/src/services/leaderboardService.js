import api from './api';

class LeaderboardService {
  constructor() {
    this.baseURL = '/api/leaderboard';
  }

  // Get tribe leaderboard
  async getTribeLeaderboard(period = 'weekly', limit = 50, cursor = null) {
    try {
      const params = new URLSearchParams({
        period,
        limit: limit.toString()
      });

      if (cursor) {
        params.append('cursor', cursor);
      }

      const response = await api.get(`${this.baseURL}/tribes?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tribe leaderboard:', error);
      throw error;
    }
  }

  // Get user leaderboard
  async getUserLeaderboard(period = 'weekly', limit = 50, cursor = null) {
    try {
      const params = new URLSearchParams({
        period,
        limit: limit.toString()
      });

      if (cursor) {
        params.append('cursor', cursor);
      }

      const response = await api.get(`${this.baseURL}/users?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user leaderboard:', error);
      throw error;
    }
  }

  // Get country leaderboard
  async getCountryLeaderboard(countryCode, period = 'weekly', limit = 50, cursor = null) {
    try {
      const params = new URLSearchParams({
        period,
        limit: limit.toString()
      });

      if (cursor) {
        params.append('cursor', cursor);
      }

      const response = await api.get(`${this.baseURL}/users/country/${countryCode}?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching country leaderboard:', error);
      throw error;
    }
  }

  // Get user's rank
  async getMyRank(scope = 'users', period = 'weekly', country = null) {
    try {
      const params = new URLSearchParams({
        scope,
        period
      });

      if (country) {
        params.append('country', country);
      }

      const response = await api.get(`${this.baseURL}/me?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user rank:', error);
      throw error;
    }
  }

  // Get weekly champions
  async getWeeklyChampions(weekStart = null) {
    try {
      const params = new URLSearchParams();
      if (weekStart) {
        params.append('weekStart', weekStart.toISOString());
      }

      const response = await api.get(`${this.baseURL}/weekly-champions?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching weekly champions:', error);
      throw error;
    }
  }

  // Get recent champions
  async getRecentChampions(limit = 4) {
    try {
      const params = new URLSearchParams({
        limit: limit.toString()
      });

      const response = await api.get(`${this.baseURL}/recent-champions?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recent champions:', error);
      throw error;
    }
  }

  // Search leaderboard
  async searchLeaderboard(query, scope = 'users', period = 'weekly', country = null) {
    try {
      const params = new URLSearchParams({
        q: query,
        scope,
        period
      });

      if (country) {
        params.append('country', country);
      }

      const response = await api.get(`${this.baseURL}/search?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error searching leaderboard:', error);
      throw error;
    }
  }

  // Generate share URL for rank
  generateRankShareURL(scope, period, rank, points, name, tribe = null) {
    const baseURL = window.location.origin;
    const params = new URLSearchParams({
      scope,
      period,
      rank: rank.toString(),
      points: points.toString(),
      name
    });

    if (tribe) {
      params.append('tribe', tribe);
    }

    return `${baseURL}/share/rank?${params}`;
  }

  // Generate OG image URL for rank sharing
  generateRankOGImageURL(scope, period, rank, points, name, tribe = null) {
    const baseURL = window.location.origin;
    const params = new URLSearchParams({
      scope,
      period,
      rank: rank.toString(),
      points: points.toString(),
      name
    });

    if (tribe) {
      params.append('tribe', tribe);
    }

    return `${baseURL}/api/og/rank?${params}`;
  }

  // Share rank to social media
  async shareRank(scope, period, rank, points, name, tribe = null) {
    try {
      const shareURL = this.generateRankShareURL(scope, period, rank, points, name, tribe);
      const ogImageURL = this.generateRankOGImageURL(scope, period, rank, points, name, tribe);

      const shareData = {
        title: `I'm #${rank} on Afroverse ${scope} leaderboard!`,
        text: `Check out my rank: #${rank} with ${points} points!`,
        url: shareURL,
        image: ogImageURL
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to copying URL
        await navigator.clipboard.writeText(shareURL);
        return { success: true, method: 'clipboard', url: shareURL };
      }

      return { success: true, method: 'native', url: shareURL };
    } catch (error) {
      console.error('Error sharing rank:', error);
      throw error;
    }
  }

  // Get rank medal emoji
  getRankMedal(rank) {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  }

  // Format points with commas
  formatPoints(points) {
    return points.toLocaleString();
  }

  // Get rank change indicator
  getRankChangeIndicator(oldRank, newRank) {
    if (!oldRank || !newRank) return null;
    
    const change = oldRank - newRank;
    if (change > 0) return { direction: 'up', change };
    if (change < 0) return { direction: 'down', change: Math.abs(change) };
    return { direction: 'same', change: 0 };
  }

  // Get motivational message based on rank
  getMotivationalMessage(rank, scope, period) {
    if (rank === 1) {
      return scope === 'tribes' ? '🏆 Your tribe is #1! Keep the crown!' : '👑 You\'re the champion! Stay on top!';
    }
    
    if (rank <= 3) {
      return scope === 'tribes' ? '🔥 Your tribe is in the top 3! Push for #1!' : '⭐ You\'re in the top 3! Go for gold!';
    }
    
    if (rank <= 10) {
      return scope === 'tribes' ? '💪 Your tribe is in the top 10! Keep climbing!' : '🚀 You\'re in the top 10! Keep pushing!';
    }
    
    if (rank <= 50) {
      return scope === 'tribes' ? '📈 Your tribe is climbing! Keep the momentum!' : '📊 You\'re making progress! Keep going!';
    }
    
    return scope === 'tribes' ? '🌟 Your tribe needs you! Start climbing!' : '🎯 Time to climb the leaderboard!';
  }
}

// Create singleton instance
const leaderboardService = new LeaderboardService();

export default leaderboardService;
