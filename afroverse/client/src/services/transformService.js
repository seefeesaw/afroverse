const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class TransformService {
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

  // Get available styles
  async getAvailableStyles() {
    try {
      const response = await this.makeAuthenticatedRequest(`${API_BASE_URL}/transform/styles`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get available styles');
      }

      return data;
    } catch (error) {
      console.error('Get styles error:', error);
      throw error;
    }
  }

  // Create transformation
  async createTransformation(imageFile, style, intensity = 0.8) {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('style', style);
      formData.append('intensity', intensity.toString());

      const response = await this.makeAuthenticatedRequest(`${API_BASE_URL}/transform/create`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create transformation');
      }

      return data;
    } catch (error) {
      console.error('Create transformation error:', error);
      throw error;
    }
  }

  // Get transformation status
  async getTransformationStatus(jobId) {
    try {
      const response = await this.makeAuthenticatedRequest(`${API_BASE_URL}/transform/status/${jobId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get transformation status');
      }

      return data;
    } catch (error) {
      console.error('Get transformation status error:', error);
      throw error;
    }
  }

  // Get transformation history
  async getTransformationHistory(cursor = null, limit = 20) {
    try {
      const params = new URLSearchParams();
      if (cursor) params.append('cursor', cursor);
      params.append('limit', limit.toString());

      const response = await this.makeAuthenticatedRequest(`${API_BASE_URL}/transform/history?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get transformation history');
      }

      return data;
    } catch (error) {
      console.error('Get transformation history error:', error);
      throw error;
    }
  }

  // Get public transformation by share code
  async getPublicTransformation(shareCode) {
    try {
      const response = await fetch(`${API_BASE_URL}/transform/public/${shareCode}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get public transformation');
      }

      return data;
    } catch (error) {
      console.error('Get public transformation error:', error);
      throw error;
    }
  }

  // Validate image file
  validateImageFile(file) {
    const errors = [];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!file) {
      errors.push('Please select an image file');
      return { isValid: false, errors };
    }

    if (file.size > maxSize) {
      errors.push('Image size must be less than 5MB');
    }

    if (!allowedTypes.includes(file.type)) {
      errors.push('Image must be JPG, PNG, or WebP format');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Create image preview URL
  createImagePreview(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  }

  // Download image
  async downloadImage(imageUrl, filename) {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  }

  // Share to social media
  shareToSocial(platform, url, text = 'Check out my Afroverse transformation!') {
    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(text);
    
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

  // Copy link to clipboard
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
}

// Create singleton instance
const transformService = new TransformService();

export default transformService;
