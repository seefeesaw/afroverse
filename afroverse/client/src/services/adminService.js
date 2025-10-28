const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class AdminService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/admin`;
  }

  // Authentication methods
  async login(email, password) {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store tokens
      if (data.token) {
        localStorage.setItem('adminToken', data.token);
      }
      if (data.refreshToken) {
        localStorage.setItem('adminRefreshToken', data.refreshToken);
      }

      return data;
    } catch (error) {
      console.error('Admin login error:', error);
      throw error;
    }
  }

  async loginWithMagicLink(token) {
    try {
      const response = await fetch(`${this.baseURL}/auth/magic-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Magic link login failed');
      }

      // Store tokens
      if (data.token) {
        localStorage.setItem('adminToken', data.token);
      }
      if (data.refreshToken) {
        localStorage.setItem('adminRefreshToken', data.refreshToken);
      }

      return data;
    } catch (error) {
      console.error('Admin magic link login error:', error);
      throw error;
    }
  }

  async verifyTwoFA(token) {
    try {
      const response = await fetch(`${this.baseURL}/auth/verify-2fa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || '2FA verification failed');
      }

      return data;
    } catch (error) {
      console.error('Admin 2FA verification error:', error);
      throw error;
    }
  }

  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('adminRefreshToken');
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Token refresh failed');
      }

      // Store new tokens
      if (data.token) {
        localStorage.setItem('adminToken', data.token);
      }
      if (data.refreshToken) {
        localStorage.setItem('adminRefreshToken', data.refreshToken);
      }

      return data;
    } catch (error) {
      console.error('Admin token refresh error:', error);
      throw error;
    }
  }

  async logout() {
    try {
      const response = await fetch(`${this.baseURL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
        },
      });

      // Clear tokens regardless of response
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminRefreshToken');

      return response.json();
    } catch (error) {
      console.error('Admin logout error:', error);
      // Clear tokens even if request fails
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminRefreshToken');
      throw error;
    }
  }

  // Profile methods
  async getProfile() {
    try {
      const response = await fetch(`${this.baseURL}/profile`, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get profile');
      }

      return data;
    } catch (error) {
      console.error('Get admin profile error:', error);
      throw error;
    }
  }

  async updateProfile(updates) {
    try {
      const response = await fetch(`${this.baseURL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      return data;
    } catch (error) {
      console.error('Update admin profile error:', error);
      throw error;
    }
  }

  // Dashboard methods
  async getDashboard() {
    try {
      const response = await fetch(`${this.baseURL}/dashboard`, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get dashboard');
      }

      return data;
    } catch (error) {
      console.error('Get admin dashboard error:', error);
      throw error;
    }
  }

  // Moderation methods
  async getModerationQueue(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${this.baseURL}/moderation/queue?${queryString}`, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get moderation queue');
      }

      return data;
    } catch (error) {
      console.error('Get moderation queue error:', error);
      throw error;
    }
  }

  async getModerationJob(jobId) {
    try {
      const response = await fetch(`${this.baseURL}/moderation/jobs/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get moderation job');
      }

      return data;
    } catch (error) {
      console.error('Get moderation job error:', error);
      throw error;
    }
  }

  async assignModerationJob(jobId) {
    try {
      const response = await fetch(`${this.baseURL}/moderation/jobs/${jobId}/assign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to assign moderation job');
      }

      return data;
    } catch (error) {
      console.error('Assign moderation job error:', error);
      throw error;
    }
  }

  async makeModerationDecision(jobId, decision, reason, notes) {
    try {
      const response = await fetch(`${this.baseURL}/moderation/jobs/${jobId}/decision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify({ decision, reason, notes }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to make moderation decision');
      }

      return data;
    } catch (error) {
      console.error('Make moderation decision error:', error);
      throw error;
    }
  }

  async escalateModerationJob(jobId, reason, priority) {
    try {
      const response = await fetch(`${this.baseURL}/moderation/jobs/${jobId}/escalate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify({ reason, priority }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to escalate moderation job');
      }

      return data;
    } catch (error) {
      console.error('Escalate moderation job error:', error);
      throw error;
    }
  }

  async resolveAppeal(jobId, resolution, reason) {
    try {
      const response = await fetch(`${this.baseURL}/moderation/jobs/${jobId}/appeal/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify({ resolution, reason }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to resolve appeal');
      }

      return data;
    } catch (error) {
      console.error('Resolve appeal error:', error);
      throw error;
    }
  }

  // Fraud detection methods
  async getFraudDetections(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${this.baseURL}/fraud/detections?${queryString}`, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get fraud detections');
      }

      return data;
    } catch (error) {
      console.error('Get fraud detections error:', error);
      throw error;
    }
  }

  async getFraudDetection(fraudDetectionId) {
    try {
      const response = await fetch(`${this.baseURL}/fraud/detections/${fraudDetectionId}`, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get fraud detection');
      }

      return data;
    } catch (error) {
      console.error('Get fraud detection error:', error);
      throw error;
    }
  }

  async reviewFraudDetection(fraudDetectionId, action, notes) {
    try {
      const response = await fetch(`${this.baseURL}/fraud/detections/${fraudDetectionId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify({ action, notes }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to review fraud detection');
      }

      return data;
    } catch (error) {
      console.error('Review fraud detection error:', error);
      throw error;
    }
  }

  async shadowbanUser(userId, reason) {
    try {
      const response = await fetch(`${this.baseURL}/fraud/users/${userId}/shadowban`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify({ reason }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to shadowban user');
      }

      return data;
    } catch (error) {
      console.error('Shadowban user error:', error);
      throw error;
    }
  }

  async liftShadowban(userId, reason) {
    try {
      const response = await fetch(`${this.baseURL}/fraud/users/${userId}/lift-shadowban`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify({ reason }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to lift shadowban');
      }

      return data;
    } catch (error) {
      console.error('Lift shadowban error:', error);
      throw error;
    }
  }

  // User management methods
  async getUsers(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${this.baseURL}/users?${queryString}`, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get users');
      }

      return data;
    } catch (error) {
      console.error('Get users error:', error);
      throw error;
    }
  }

  async getUser(userId) {
    try {
      const response = await fetch(`${this.baseURL}/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get user');
      }

      return data;
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  }

  async getUserDetails(userId) {
    try {
      const response = await fetch(`${this.baseURL}/users/${userId}/details`, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get user details');
      }

      return data;
    } catch (error) {
      console.error('Get user details error:', error);
      throw error;
    }
  }

  async applyEnforcement(userId, type, scope, reason, expiresAt) {
    try {
      const response = await fetch(`${this.baseURL}/users/${userId}/enforcement`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify({ type, scope, reason, expiresAt }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to apply enforcement');
      }

      return data;
    } catch (error) {
      console.error('Apply enforcement error:', error);
      throw error;
    }
  }

  async banUser(userId, reason, duration) {
    try {
      const response = await fetch(`${this.baseURL}/users/${userId}/ban`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify({ reason, duration }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to ban user');
      }

      return data;
    } catch (error) {
      console.error('Ban user error:', error);
      throw error;
    }
  }

  async unbanUser(userId, reason) {
    try {
      const response = await fetch(`${this.baseURL}/users/${userId}/unban`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify({ reason }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to unban user');
      }

      return data;
    } catch (error) {
      console.error('Unban user error:', error);
      throw error;
    }
  }

  // Tribe management methods
  async getTribes(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${this.baseURL}/tribes?${queryString}`, {
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

  async getTribe(tribeId) {
    try {
      const response = await fetch(`${this.baseURL}/tribes/${tribeId}`, {
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

  async updateTribe(tribeId, updates) {
    try {
      const response = await fetch(`${this.baseURL}/tribes/${tribeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update tribe');
      }

      return data;
    } catch (error) {
      console.error('Update tribe error:', error);
      throw error;
    }
  }

  async changeTribeCaptain(tribeId, newCaptainId, reason) {
    try {
      const response = await fetch(`${this.baseURL}/tribes/${tribeId}/captain`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify({ newCaptainId, reason }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to change tribe captain');
      }

      return data;
    } catch (error) {
      console.error('Change tribe captain error:', error);
      throw error;
    }
  }

  // Audit log methods
  async getAuditLogs(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${this.baseURL}/audit/logs?${queryString}`, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get audit logs');
      }

      return data;
    } catch (error) {
      console.error('Get audit logs error:', error);
      throw error;
    }
  }

  async getAuditLog(auditLogId) {
    try {
      const response = await fetch(`${this.baseURL}/audit/logs/${auditLogId}`, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get audit log');
      }

      return data;
    } catch (error) {
      console.error('Get audit log error:', error);
      throw error;
    }
  }

  async reverseAuditLog(auditLogId, reason) {
    try {
      const response = await fetch(`${this.baseURL}/audit/logs/${auditLogId}/reverse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify({ reason }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to reverse audit log');
      }

      return data;
    } catch (error) {
      console.error('Reverse audit log error:', error);
      throw error;
    }
  }

  // Utility methods
  getToken() {
    return localStorage.getItem('adminToken');
  }

  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Check if token is expired
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch (error) {
      return false;
    }
  }

  getRole() {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role;
    } catch (error) {
      return null;
    }
  }

  hasRole(requiredRole) {
    const userRole = this.getRole();
    if (!userRole) return false;

    const roleHierarchy = {
      'viewer': 1,
      'moderator': 2,
      'tands': 3,
      'operator': 4,
      'admin': 5
    };

    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  }
}

export default new AdminService();
