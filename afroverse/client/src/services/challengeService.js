import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const challengeService = {
  /**
   * Get today's daily challenge
   */
  async getDailyChallenge() {
    try {
      const response = await axios.get(`${API_BASE_URL}/challenge/daily`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch daily challenge');
    }
  },

  /**
   * Get this week's weekly challenge
   */
  async getWeeklyChallenge() {
    try {
      const response = await axios.get(`${API_BASE_URL}/challenge/weekly`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch weekly challenge');
    }
  },

  /**
   * Update challenge progress
   */
  async updateProgress(activityType, value = 1, metadata = {}) {
    try {
      const response = await axios.post(`${API_BASE_URL}/challenge/progress`, {
        activityType,
        value,
        metadata,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update challenge progress');
    }
  },

  /**
   * Complete a challenge
   */
  async completeChallenge(userChallengeId, challengeType) {
    try {
      const response = await axios.post(`${API_BASE_URL}/challenge/complete`, {
        userChallengeId,
        challengeType,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to complete challenge');
    }
  },

  /**
   * Get user's challenge statistics
   */
  async getChallengeStats() {
    try {
      const response = await axios.get(`${API_BASE_URL}/challenge/stats`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch challenge stats');
    }
  },

  /**
   * Get user's challenge completion history
   */
  async getChallengeHistory(limit = 50, offset = 0) {
    try {
      const response = await axios.get(`${API_BASE_URL}/challenge/history`, {
        params: { limit, offset },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch challenge history');
    }
  },

  /**
   * Get challenge completion leaderboard
   */
  async getChallengeLeaderboard(type = 'daily', period = 'week') {
    try {
      const response = await axios.get(`${API_BASE_URL}/challenge/leaderboard`, {
        params: { type, period },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch challenge leaderboard');
    }
  },

  /**
   * Get tribe weekly challenge status
   */
  async getTribeWeeklyChallenge() {
    try {
      const response = await axios.get(`${API_BASE_URL}/challenge/tribe-weekly`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch tribe weekly challenge');
    }
  },
};

export default challengeService;
