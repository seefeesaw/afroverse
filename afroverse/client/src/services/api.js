import axios from 'axios';
import { handleMockRequest } from './mockApi';

const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:5000/api';
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

// Log mock mode status
if (USE_MOCK_DATA) {
  console.log('🎭 Mock Mode Enabled - Using dummy data for all API calls');
}

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies for refresh token
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
          withCredentials: true,
        });

        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);

        // Update the Authorization header
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        window.location.href = '/auth';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Convenience methods with mock support
const createMockableMethod = (method) => {
  return async (url, dataOrConfig, config) => {
    if (USE_MOCK_DATA) {
      // Use mock API
      const data = method !== 'GET' && method !== 'DELETE' ? dataOrConfig : null;
      const response = await handleMockRequest(method, url, data);
      return { data: response };
    }

    // Use real API
    switch (method) {
      case 'GET':
        return axios.get(`${API_BASE_URL}${url}`, { ...dataOrConfig, withCredentials: true });
      case 'POST':
        return axios.post(`${API_BASE_URL}${url}`, dataOrConfig, { ...config, withCredentials: true });
      case 'PUT':
        return axios.put(`${API_BASE_URL}${url}`, dataOrConfig, { ...config, withCredentials: true });
      case 'PATCH':
        return axios.patch(`${API_BASE_URL}${url}`, dataOrConfig, { ...config, withCredentials: true });
      case 'DELETE':
        return axios.delete(`${API_BASE_URL}${url}`, { ...dataOrConfig, withCredentials: true });
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
  };
};

api.get = createMockableMethod('GET');
api.post = createMockableMethod('POST');
api.put = createMockableMethod('PUT');
api.patch = createMockableMethod('PATCH');
api.delete = createMockableMethod('DELETE');

export default api;


