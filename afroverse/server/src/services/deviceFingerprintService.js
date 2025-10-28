const DeviceFingerprint = require('../models/DeviceFingerprint');
const { logger } = require('../utils/logger');

class DeviceFingerprintService {
  constructor() {
    this.platforms = {
      web: 'web',
      android: 'android',
      ios: 'ios'
    };
    
    this.flags = {
      isSuspicious: 'isSuspicious',
      isBlocked: 'isBlocked',
      isMultiAccount: 'isMultiAccount',
      isBot: 'isBot'
    };
  }

  // Create device fingerprint
  async createDeviceFingerprint(fingerprint, userId, deviceInfo, ipAddress, geoData = {}) {
    try {
      const deviceFingerprint = await DeviceFingerprint.createDeviceFingerprint(
        fingerprint, userId, deviceInfo, ipAddress, geoData
      );
      
      logger.info(`Device fingerprint created: ${fingerprint} for user ${userId}`);
      
      return {
        success: true,
        deviceFingerprint: deviceFingerprint.getSummary()
      };
    } catch (error) {
      logger.error('Error creating device fingerprint:', error);
      throw error;
    }
  }

  // Update device fingerprint
  async updateDeviceFingerprint(fingerprint, userId, deviceInfo, ipAddress, geoData = {}) {
    try {
      let deviceFingerprint = await DeviceFingerprint.getDeviceFingerprintByFingerprint(fingerprint);
      
      if (!deviceFingerprint) {
        // Create new device fingerprint
        return await this.createDeviceFingerprint(fingerprint, userId, deviceInfo, ipAddress, geoData);
      }
      
      // Update existing device fingerprint
      await deviceFingerprint.addUser(userId);
      await deviceFingerprint.addIPAddress(ipAddress, geoData);
      
      // Update device info
      deviceFingerprint.deviceInfo = { ...deviceFingerprint.deviceInfo, ...deviceInfo };
      await deviceFingerprint.save();
      
      logger.info(`Device fingerprint updated: ${fingerprint} for user ${userId}`);
      
      return {
        success: true,
        deviceFingerprint: deviceFingerprint.getSummary()
      };
    } catch (error) {
      logger.error('Error updating device fingerprint:', error);
      throw error;
    }
  }

  // Get device fingerprint by fingerprint
  async getDeviceFingerprintByFingerprint(fingerprint) {
    try {
      const deviceFingerprint = await DeviceFingerprint.getDeviceFingerprintByFingerprint(fingerprint);
      
      if (!deviceFingerprint) {
        return { success: false, message: 'Device fingerprint not found' };
      }
      
      return {
        success: true,
        deviceFingerprint: deviceFingerprint.getSummary()
      };
    } catch (error) {
      logger.error('Error getting device fingerprint by fingerprint:', error);
      throw error;
    }
  }

  // Get device fingerprints by user
  async getDeviceFingerprintsByUser(userId) {
    try {
      const deviceFingerprints = await DeviceFingerprint.getDeviceFingerprintsByUser(userId);
      
      return {
        success: true,
        deviceFingerprints: deviceFingerprints.map(df => df.getSummary())
      };
    } catch (error) {
      logger.error('Error getting device fingerprints by user:', error);
      throw error;
    }
  }

  // Get suspicious devices
  async getSuspiciousDevices(limit = 100) {
    try {
      const devices = await DeviceFingerprint.getSuspiciousDevices(limit);
      
      return {
        success: true,
        devices: devices.map(device => device.getSummary())
      };
    } catch (error) {
      logger.error('Error getting suspicious devices:', error);
      throw error;
    }
  }

  // Get multi-account devices
  async getMultiAccountDevices(limit = 100) {
    try {
      const devices = await DeviceFingerprint.getMultiAccountDevices(limit);
      
      return {
        success: true,
        devices: devices.map(device => device.getSummary())
      };
    } catch (error) {
      logger.error('Error getting multi-account devices:', error);
      throw error;
    }
  }

  // Get blocked devices
  async getBlockedDevices(limit = 100) {
    try {
      const devices = await DeviceFingerprint.getBlockedDevices(limit);
      
      return {
        success: true,
        devices: devices.map(device => device.getSummary())
      };
    } catch (error) {
      logger.error('Error getting blocked devices:', error);
      throw error;
    }
  }

  // Mark device as suspicious
  async markDeviceAsSuspicious(fingerprint, reason) {
    try {
      const deviceFingerprint = await DeviceFingerprint.getDeviceFingerprintByFingerprint(fingerprint);
      
      if (!deviceFingerprint) {
        return { success: false, message: 'Device fingerprint not found' };
      }
      
      await deviceFingerprint.markAsSuspicious(reason);
      
      logger.info(`Device ${fingerprint} marked as suspicious: ${reason}`);
      
      return {
        success: true,
        deviceFingerprint: deviceFingerprint.getSummary()
      };
    } catch (error) {
      logger.error('Error marking device as suspicious:', error);
      throw error;
    }
  }

  // Mark device as blocked
  async markDeviceAsBlocked(fingerprint, reason) {
    try {
      const deviceFingerprint = await DeviceFingerprint.getDeviceFingerprintByFingerprint(fingerprint);
      
      if (!deviceFingerprint) {
        return { success: false, message: 'Device fingerprint not found' };
      }
      
      await deviceFingerprint.markAsBlocked(reason);
      
      logger.info(`Device ${fingerprint} marked as blocked: ${reason}`);
      
      return {
        success: true,
        deviceFingerprint: deviceFingerprint.getSummary()
      };
    } catch (error) {
      logger.error('Error marking device as blocked:', error);
      throw error;
    }
  }

  // Mark device as bot
  async markDeviceAsBot(fingerprint, reason) {
    try {
      const deviceFingerprint = await DeviceFingerprint.getDeviceFingerprintByFingerprint(fingerprint);
      
      if (!deviceFingerprint) {
        return { success: false, message: 'Device fingerprint not found' };
      }
      
      await deviceFingerprint.markAsBot(reason);
      
      logger.info(`Device ${fingerprint} marked as bot: ${reason}`);
      
      return {
        success: true,
        deviceFingerprint: deviceFingerprint.getSummary()
      };
    } catch (error) {
      logger.error('Error marking device as bot:', error);
      throw error;
    }
  }

  // Update device activity
  async updateDeviceActivity(fingerprint, activityType) {
    try {
      const deviceFingerprint = await DeviceFingerprint.getDeviceFingerprintByFingerprint(fingerprint);
      
      if (!deviceFingerprint) {
        return { success: false, message: 'Device fingerprint not found' };
      }
      
      await deviceFingerprint.updateActivity(activityType);
      
      return {
        success: true,
        deviceFingerprint: deviceFingerprint.getSummary()
      };
    } catch (error) {
      logger.error('Error updating device activity:', error);
      throw error;
    }
  }

  // Calculate risk score
  async calculateRiskScore(fingerprint) {
    try {
      const deviceFingerprint = await DeviceFingerprint.getDeviceFingerprintByFingerprint(fingerprint);
      
      if (!deviceFingerprint) {
        return { success: false, message: 'Device fingerprint not found' };
      }
      
      await deviceFingerprint.calculateRiskScore();
      
      return {
        success: true,
        riskScore: deviceFingerprint.riskScore
      };
    } catch (error) {
      logger.error('Error calculating risk score:', error);
      throw error;
    }
  }

  // Get device fingerprint statistics
  async getDeviceFingerprintStatistics() {
    try {
      const statistics = await DeviceFingerprint.getDeviceFingerprintStatistics();
      
      return {
        success: true,
        statistics
      };
    } catch (error) {
      logger.error('Error getting device fingerprint statistics:', error);
      throw error;
    }
  }

  // Get device fingerprint trends
  async getDeviceFingerprintTrends(days = 30) {
    try {
      const trends = await DeviceFingerprint.getDeviceFingerprintTrends(days);
      
      return {
        success: true,
        trends
      };
    } catch (error) {
      logger.error('Error getting device fingerprint trends:', error);
      throw error;
    }
  }

  // Get device fingerprint summary
  async getDeviceFingerprintSummary() {
    try {
      const summary = await DeviceFingerprint.getDeviceFingerprintSummary();
      
      return {
        success: true,
        summary: summary[0] || {
          total: 0,
          suspicious: 0,
          blocked: 0,
          multiAccount: 0,
          bot: 0,
          avgRiskScore: 0
        }
      };
    } catch (error) {
      logger.error('Error getting device fingerprint summary:', error);
      throw error;
    }
  }

  // Generate device fingerprint
  generateDeviceFingerprint(req) {
    try {
      const userAgent = req.headers['user-agent'] || '';
      const platform = req.headers['x-platform'] || 'web';
      const screenResolution = req.headers['x-screen-resolution'] || '';
      const timezone = req.headers['x-timezone'] || '';
      const language = req.headers['x-language'] || '';
      const browser = req.headers['x-browser'] || '';
      const os = req.headers['x-os'] || '';
      
      // Create fingerprint string
      const fingerprintData = [
        userAgent,
        platform,
        screenResolution,
        timezone,
        language,
        browser,
        os
      ].join('|');
      
      // Generate hash (simplified)
      const fingerprint = Buffer.from(fingerprintData).toString('base64');
      
      return fingerprint;
    } catch (error) {
      logger.error('Error generating device fingerprint:', error);
      throw error;
    }
  }

  // Get device info from request
  getDeviceInfoFromRequest(req) {
    try {
      return {
        userAgent: req.headers['user-agent'] || null,
        platform: req.headers['x-platform'] || 'web',
        screenResolution: req.headers['x-screen-resolution'] || null,
        timezone: req.headers['x-timezone'] || null,
        language: req.headers['x-language'] || null,
        browser: req.headers['x-browser'] || null,
        os: req.headers['x-os'] || null
      };
    } catch (error) {
      logger.error('Error getting device info from request:', error);
      throw error;
    }
  }

  // Get geo data from request
  getGeoDataFromRequest(req) {
    try {
      return {
        country: req.headers['x-country'] || null,
        region: req.headers['x-region'] || null,
        city: req.headers['x-city'] || null,
        coordinates: req.headers['x-coordinates'] ? JSON.parse(req.headers['x-coordinates']) : null,
        isp: req.headers['x-isp'] || null
      };
    } catch (error) {
      logger.error('Error getting geo data from request:', error);
      return {
        country: null,
        region: null,
        city: null,
        coordinates: null,
        isp: null
      };
    }
  }

  // Get platforms
  getPlatforms() {
    return Object.keys(this.platforms).map(key => ({
      key,
      name: this.platforms[key]
    }));
  }

  // Get flags
  getFlags() {
    return Object.keys(this.flags).map(key => ({
      key,
      name: this.flags[key]
    }));
  }

  // Validate device fingerprint data
  validateDeviceFingerprintData(data) {
    const errors = [];
    
    if (!data.fingerprint) {
      errors.push('Fingerprint is required');
    }
    
    if (!data.userId) {
      errors.push('User ID is required');
    }
    
    if (!data.deviceInfo) {
      errors.push('Device info is required');
    }
    
    if (!data.ipAddress) {
      errors.push('IP address is required');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Get error message
  getErrorMessage(errorCode) {
    const messages = {
      'DEVICE_FINGERPRINT_NOT_FOUND': 'Device fingerprint not found',
      'UNAUTHORIZED': 'Unauthorized access',
      'INVALID_FINGERPRINT': 'Invalid fingerprint',
      'INVALID_USER_ID': 'Invalid user ID',
      'INVALID_DEVICE_INFO': 'Invalid device info',
      'INVALID_IP_ADDRESS': 'Invalid IP address',
      'DEVICE_ALREADY_BLOCKED': 'Device is already blocked',
      'DEVICE_NOT_BLOCKED': 'Device is not blocked'
    };
    
    return messages[errorCode] || 'Unknown error';
  }

  // Get success message
  getSuccessMessage(action) {
    const messages = {
      'device_fingerprint_created': 'Device fingerprint created successfully',
      'device_fingerprint_updated': 'Device fingerprint updated successfully',
      'device_marked_suspicious': 'Device marked as suspicious successfully',
      'device_marked_blocked': 'Device marked as blocked successfully',
      'device_marked_bot': 'Device marked as bot successfully',
      'device_activity_updated': 'Device activity updated successfully',
      'risk_score_calculated': 'Risk score calculated successfully'
    };
    
    return messages[action] || 'Action completed successfully';
  }
}

// Create singleton instance
const deviceFingerprintService = new DeviceFingerprintService();

module.exports = deviceFingerprintService;
