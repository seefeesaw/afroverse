import { handleMockRequest } from './mockApi';
import mockData from './mockData';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

class AuthService {
  constructor() {
    this.accessToken = null;
    this.refreshPromise = null;
    
    // Auto-login in mock mode
    if (USE_MOCK_DATA) {
      this.accessToken = 'mock_access_token_' + Date.now();
      console.log('🎭 AuthService: Mock mode enabled, auto-logged in');
    }
  }

  // Set access token
  setAccessToken(token) {
    this.accessToken = token;
  }

  // Get access token
  getAccessToken() {
    return this.accessToken;
  }

  // Clear tokens
  clearTokens() {
    this.accessToken = null;
    this.refreshPromise = null;
  }

  // Make authenticated request
  async makeAuthenticatedRequest(url, options = {}) {
    if (USE_MOCK_DATA) {
      // Mock response
      const method = options.method || 'GET';
      const data = options.body ? JSON.parse(options.body) : null;
      const mockResponse = await handleMockRequest(method, url.replace(API_BASE_URL, ''), data);
      
      return {
        ok: true,
        status: 200,
        json: async () => mockResponse,
      };
    }

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
      credentials: 'include', // Include cookies for refresh token
    });

    // If token expired, try to refresh
    if (response.status === 401) {
      try {
        await this.refreshAccessToken();
        // Retry the request with new token
        return this.makeAuthenticatedRequest(url, options);
      } catch (refreshError) {
        this.clearTokens();
        throw new Error('Authentication failed');
      }
    }

    return response;
  }

  // Start authentication process
  async startAuth(phone) {
    if (USE_MOCK_DATA) {
      const mockResponse = await handleMockRequest('POST', '/auth/start', { phone });
      return mockResponse;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to start authentication');
      }

      return data;
    } catch (error) {
      console.error('Start auth error:', error);
      throw error;
    }
  }

  // Verify OTP
  async verifyAuth(phone, otp) {
    if (USE_MOCK_DATA) {
      const mockResponse = await handleMockRequest('POST', '/auth/verify', { phone, otp });
      this.setAccessToken(mockResponse.accessToken);
      return mockResponse;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for refresh token
        body: JSON.stringify({ phone, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to verify OTP');
      }

      // Store access token
      this.setAccessToken(data.accessToken);

      return data;
    } catch (error) {
      console.error('Verify auth error:', error);
      throw error;
    }
  }

  // Refresh access token
  async refreshAccessToken() {
    // Prevent multiple simultaneous refresh requests
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this._performRefresh();

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.refreshPromise = null;
    }
  }

  async _performRefresh() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include', // Include refresh token cookie
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to refresh token');
      }

      this.setAccessToken(data.accessToken);
      return data;
    } catch (error) {
      console.error('Refresh token error:', error);
      throw error;
    }
  }

  // Get current user profile
  async getMe() {
    if (USE_MOCK_DATA) {
      return {
        success: true,
        user: mockData.currentUser,
      };
    }

    try {
      const response = await this.makeAuthenticatedRequest(`${API_BASE_URL}/auth/me`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get user profile');
      }

      return data;
    } catch (error) {
      console.error('Get me error:', error);
      throw error;
    }
  }

  // Logout
  async logout() {
    try {
      await this.makeAuthenticatedRequest(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
      });

      this.clearTokens();
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      // Clear tokens anyway
      this.clearTokens();
      throw error;
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.accessToken;
  }

  // Validate phone number format
  validatePhoneNumber(phone) {
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  }

  // Format phone number for display
  formatPhoneNumber(phone) {
    if (!phone) return '';
    
    // Remove all non-digit characters except +
    const cleaned = phone.replace(/[^\d+]/g, '');
    
    // Add spaces for readability
    if (cleaned.startsWith('+')) {
      const countryCode = cleaned.slice(0, 3);
      const number = cleaned.slice(3);
      
      if (number.length > 0) {
        return `${countryCode} ${number}`;
      }
    }
    
    return cleaned;
  }

  // Get country code from phone number
  getCountryCode(phone) {
    if (!phone || !phone.startsWith('+')) return '';
    
    // Extract country code (first 1-3 digits after +)
    const match = phone.match(/^\+(\d{1,3})/);
    return match ? `+${match[1]}` : '';
  }

  // Get phone number without country code
  getPhoneNumberWithoutCountryCode(phone) {
    if (!phone || !phone.startsWith('+')) return phone;
    
    const countryCode = this.getCountryCode(phone);
    return phone.replace(countryCode, '').trim();
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;
