const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class TribeService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/tribes`;
  }

  getToken() {
    return localStorage.getItem('token');
  }

  // Get all tribes
  async getAllTribes() {
    try {
      const response = await fetch(`${this.baseURL}`, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get tribes');
      }

      return data;
    } catch (error) {
      console.error('Get tribes error:', error);
      throw error;
    }
  }

  // Get specific tribe
  async getTribe(tribeId) {
    try {
      const response = await fetch(`${this.baseURL}/${tribeId}`, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get tribe');
      }

      return data;
    } catch (error) {
      console.error('Get tribe error:', error);
      throw error;
    }
  }

  // Get tribe leaderboard
  async getLeaderboard(period = 'week', limit = 50) {
    try {
      const params = new URLSearchParams();
      params.append('period', period);
      params.append('limit', limit.toString());

      const response = await fetch(`${this.baseURL}/leaderboard?${params}`, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get leaderboard');
      }

      return data;
    } catch (error) {
      console.error('Get leaderboard error:', error);
      throw error;
    }
  }

  // Join a tribe
  async joinTribe(tribeId) {
    try {
      const response = await fetch(`${this.baseURL}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify({ tribeId }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to join tribe');
      }

      return data;
    } catch (error) {
      console.error('Join tribe error:', error);
      throw error;
    }
  }

  // Get user's current tribe
  async getMyTribe() {
    try {
      const response = await fetch(`${this.baseURL}/my-tribe`, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get my tribe');
      }

      return data;
    } catch (error) {
      console.error('Get my tribe error:', error);
      throw error;
    }
  }

  // Award points to tribe (internal use)
  async awardPoints(reason, points) {
    try {
      const response = await fetch(`${this.baseURL}/points/award`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify({ reason, points }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to award points');
      }

      return data;
    } catch (error) {
      console.error('Award points error:', error);
      throw error;
    }
  }
}

const tribeService = new TribeService();
export default tribeService;


