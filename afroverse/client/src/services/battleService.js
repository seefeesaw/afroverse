const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class BattleService {
  constructor() {
    this.accessToken = null;
  }

  // Set access token
  setAccessToken(token) {
    this.accessToken = token;
  }

  // Get access token
  getAccessToken() {
    return this.accessToken;
  }

  // Make authenticated request
  async makeAuthenticatedRequest(url, options = {}) {
    const token = this.getAccessToken();
    
    if (!token) {
      throw new Error('No access token available');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
      credentials: 'include',
    });

    // If token expired, try to refresh
    if (response.status === 401) {
      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          this.setAccessToken(refreshData.accessToken);
          
          // Retry the request with new token
          return this.makeAuthenticatedRequest(url, options);
        } else {
          throw new Error('Authentication failed');
        }
      } catch (refreshError) {
        throw new Error('Authentication failed');
      }
    }

    return response;
  }

  // Generate browser fingerprint
  generateFingerprint() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Browser fingerprint', 2, 2);
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return hash.toString(36);
  }

  // Create a new battle
  async createBattle(transformId, challengeMethod, challengeTarget, message) {
    try {
      const response = await this.makeAuthenticatedRequest(`${API_BASE_URL}/battles/create`, {
        method: 'POST',
        body: JSON.stringify({
          transformId,
          challengeMethod,
          challengeTarget,
          message
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create battle');
      }

      return data;
    } catch (error) {
      console.error('Create battle error:', error);
      throw error;
    }
  }

  // Accept a battle
  async acceptBattle(battleId, transformId) {
    try {
      const response = await this.makeAuthenticatedRequest(`${API_BASE_URL}/battles/accept/${battleId}`, {
        method: 'POST',
        body: JSON.stringify({ transformId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to accept battle');
      }

      return data;
    } catch (error) {
      console.error('Accept battle error:', error);
      throw error;
    }
  }

  // Get battle by short code
  async getBattle(shortCode) {
    try {
      const response = await fetch(`${API_BASE_URL}/battles/${shortCode}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get battle');
      }

      return data;
    } catch (error) {
      console.error('Get battle error:', error);
      throw error;
    }
  }

  // Vote on a battle
  async voteOnBattle(battleId, votedFor) {
    try {
      const fingerprint = this.generateFingerprint();
      
      const response = await fetch(`${API_BASE_URL}/battles/vote/${battleId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-fingerprint': fingerprint,
        },
        credentials: 'include',
        body: JSON.stringify({ votedFor }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to vote');
      }

      return data;
    } catch (error) {
      console.error('Vote error:', error);
      throw error;
    }
  }

  // List active battles
  async listActiveBattles(cursor = null, limit = 10) {
    try {
      const params = new URLSearchParams();
      if (cursor) params.append('cursor', cursor);
      params.append('limit', limit.toString());

      const response = await fetch(`${API_BASE_URL}/battles/active/list?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get active battles');
      }

      return data;
    } catch (error) {
      console.error('List active battles error:', error);
      throw error;
    }
  }

  // Report a battle
  async reportBattle(battleId, reason, details) {
    try {
      const response = await fetch(`${API_BASE_URL}/battles/${battleId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason, details }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to report battle');
      }

      return data;
    } catch (error) {
      console.error('Report battle error:', error);
      throw error;
    }
  }

  // Share battle to social media
  shareToSocial(platform, battleUrl, battleText) {
    const encodedUrl = encodeURIComponent(battleUrl);
    const encodedText = encodeURIComponent(battleText);
    
    const shareUrls = {
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      instagram: `https://www.instagram.com/`, // Instagram doesn't support direct sharing
      tiktok: `https://www.tiktok.com/`, // TikTok doesn't support direct sharing
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  }

  // Copy battle link to clipboard
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Copy to clipboard error:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    }
  }

  // Format time remaining
  formatTimeRemaining(milliseconds) {
    if (milliseconds <= 0) return '0:00';
    
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  }

  // Calculate vote percentage
  calculateVotePercentage(votes, choice) {
    if (votes.total === 0) return 0;
    return Math.round((votes[choice] / votes.total) * 100);
  }

  // Get battle status color
  getBattleStatusColor(status) {
    const colors = {
      pending: 'yellow',
      active: 'green',
      completed: 'blue',
      expired: 'gray'
    };
    return colors[status] || 'gray';
  }

  // Get battle status text
  getBattleStatusText(status) {
    const texts = {
      pending: 'Waiting for acceptance',
      active: 'Battle in progress',
      completed: 'Battle completed',
      expired: 'Battle expired'
    };
    return texts[status] || 'Unknown status';
  }
}

// Create singleton instance
const battleService = new BattleService();

export default battleService;
