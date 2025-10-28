import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const eventService = {
  /**
   * Get current active event
   */
  async getCurrentEvent() {
    try {
      const response = await axios.get(`${API_BASE_URL}/events/current`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch current event');
    }
  },

  /**
   * Get upcoming event
   */
  async getUpcomingEvent() {
    try {
      const response = await axios.get(`${API_BASE_URL}/events/upcoming`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch upcoming event');
    }
  },

  /**
   * Get clan war standings
   */
  async getClanWarStandings() {
    try {
      const response = await axios.get(`${API_BASE_URL}/events/war/standings`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch clan war standings');
    }
  },

  /**
   * Get power hour status
   */
  async getPowerHourStatus() {
    try {
      const response = await axios.get(`${API_BASE_URL}/events/power-hour`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch power hour status');
    }
  },

  /**
   * Update clan war score
   */
  async updateClanWarScore(activityType, value = 1, metadata = {}) {
    try {
      const response = await axios.post(`${API_BASE_URL}/events/war/score`, {
        activityType,
        value,
        metadata,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update clan war score');
    }
  },

  /**
   * Get user's event participation statistics
   */
  async getUserEventStats() {
    try {
      const response = await axios.get(`${API_BASE_URL}/events/stats`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user event stats');
    }
  },

  /**
   * Get user's event participation history
   */
  async getUserEventHistory(limit = 50, offset = 0) {
    try {
      const response = await axios.get(`${API_BASE_URL}/events/history`, {
        params: { limit, offset },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user event history');
    }
  },

  /**
   * Get event participation leaderboard
   */
  async getEventLeaderboard(eventType = 'clan_war', limit = 50) {
    try {
      const response = await axios.get(`${API_BASE_URL}/events/leaderboard`, {
        params: { eventType, limit },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch event leaderboard');
    }
  },

  /**
   * Get user's tribe war status
   */
  async getTribeWarStatus() {
    try {
      const response = await axios.get(`${API_BASE_URL}/events/tribe-war`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch tribe war status');
    }
  },
};

export default eventService;
