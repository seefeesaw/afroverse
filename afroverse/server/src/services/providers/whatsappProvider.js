const axios = require('axios');
const { logger } = require('../../utils/logger');

class WhatsAppProvider {
  constructor() {
    this.baseURL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v18.0';
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  }

  // Send WhatsApp message
  async send(notification, payload) {
    try {
      if (!this.phoneNumberId || !this.accessToken) {
        throw new Error('WhatsApp credentials not configured');
      }

      // Get user's phone number
      const phoneNumber = await this.getUserPhoneNumber(notification.userId);
      if (!phoneNumber) {
        throw new Error('User phone number not found');
      }

      // Compile WhatsApp message
      const message = await this.compileWhatsAppMessage(notification, payload);
      
      // Send message
      const response = await axios.post(
        `${this.baseURL}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: phoneNumber,
          type: 'template',
          template: {
            name: message.templateName,
            language: {
              code: 'en'
            },
            components: message.components
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const messageId = response.data.messages?.[0]?.id;
      
      logger.info(`WhatsApp message sent: ${messageId}`);
      
      return {
        success: true,
        providerId: messageId
      };

    } catch (error) {
      logger.error('WhatsApp send error:', error);
      
      // Check if it's a rate limit error
      if (error.response?.status === 429) {
        return {
          success: false,
          error: 'Rate limited',
          shouldRetry: true
        };
      }
      
      return {
        success: false,
        error: error.message,
        shouldRetry: false
      };
    }
  }

  // Compile WhatsApp message
  async compileWhatsAppMessage(notification, payload) {
    const templateName = this.getTemplateName(notification.templateId);
    const components = this.buildComponents(notification.message, payload);
    
    return {
      templateName,
      components
    };
  }

  // Get template name from template ID
  getTemplateName(templateId) {
    const templateMap = {
      'wa_streak_v1': 'streak_at_risk',
      'wa_battle_live_v1': 'battle_live',
      'wa_battle_result_v1': 'battle_result',
      'wa_otp_v1': 'otp_verification'
    };
    
    return templateMap[templateId] || 'default_template';
  }

  // Build WhatsApp components
  buildComponents(message, payload) {
    const components = [];
    
    // Add body component with parameters
    if (message.body) {
      const bodyParams = this.extractParameters(message.body, payload);
      if (bodyParams.length > 0) {
        components.push({
          type: 'body',
          parameters: bodyParams.map(param => ({
            type: 'text',
            text: param
          }))
        });
      }
    }
    
    // Add button component if deeplink exists
    if (payload.deeplink) {
      components.push({
        type: 'button',
        sub_type: 'url',
        index: 0,
        parameters: [{
          type: 'text',
          text: payload.deeplink
        }]
      });
    }
    
    return components;
  }

  // Extract parameters from message
  extractParameters(message, payload) {
    const params = [];
    const paramRegex = /\{(\w+)\}/g;
    let match;
    
    while ((match = paramRegex.exec(message)) !== null) {
      const paramName = match[1];
      if (payload[paramName]) {
        params.push(payload[paramName]);
      }
    }
    
    return params;
  }

  // Get user phone number
  async getUserPhoneNumber(userId) {
    try {
      const User = require('../../models/User');
      const user = await User.findById(userId).select('phone').lean();
      return user?.phone;
    } catch (error) {
      logger.error('Error getting user phone number:', error);
      return null;
    }
  }

  // Handle webhook events
  async handleWebhook(event) {
    try {
      const { statuses, messages } = event;
      
      // Handle message status updates
      if (statuses) {
        for (const status of statuses) {
          await this.handleStatusUpdate(status);
        }
      }
      
      // Handle incoming messages
      if (messages) {
        for (const message of messages) {
          await this.handleIncomingMessage(message);
        }
      }
      
      return { success: true };
      
    } catch (error) {
      logger.error('WhatsApp webhook error:', error);
      throw error;
    }
  }

  // Handle status update
  async handleStatusUpdate(status) {
    try {
      const Notification = require('../../models/Notification');
      
      // Find notification by provider ID
      const notification = await Notification.findOne({
        'provider.id': status.id,
        channel: 'whatsapp'
      });
      
      if (!notification) {
        logger.warn(`WhatsApp notification not found: ${status.id}`);
        return;
      }
      
      // Update status based on WhatsApp status
      switch (status.status) {
        case 'delivered':
          await notification.markAsDelivered();
          break;
        case 'read':
          await notification.markAsDelivered();
          break;
        case 'failed':
          await notification.markAsFailed(status.errors?.[0]?.message || 'Delivery failed');
          break;
        default:
          logger.info(`WhatsApp status update: ${status.status} for ${status.id}`);
      }
      
    } catch (error) {
      logger.error('Error handling WhatsApp status update:', error);
    }
  }

  // Handle incoming message
  async handleIncomingMessage(message) {
    try {
      // Handle STOP command
      if (message.text?.body?.toLowerCase() === 'stop') {
        await this.handleStopCommand(message.from);
        return;
      }
      
      // Handle other incoming messages if needed
      logger.info(`WhatsApp message received from ${message.from}: ${message.text?.body}`);
      
    } catch (error) {
      logger.error('Error handling WhatsApp incoming message:', error);
    }
  }

  // Handle STOP command
  async handleStopCommand(phoneNumber) {
    try {
      const User = require('../../models/User');
      const UserNotificationSettings = require('../../models/UserNotificationSettings');
      
      // Find user by phone number
      const user = await User.findOne({ phone: phoneNumber });
      if (!user) {
        logger.warn(`User not found for phone number: ${phoneNumber}`);
        return;
      }
      
      // Disable WhatsApp notifications
      const settings = await UserNotificationSettings.getOrCreate(user._id);
      settings.channels.whatsapp.enabled = false;
      await settings.save();
      
      // Send confirmation message
      await this.sendConfirmationMessage(phoneNumber);
      
      logger.info(`WhatsApp notifications disabled for user ${user._id}`);
      
    } catch (error) {
      logger.error('Error handling STOP command:', error);
    }
  }

  // Send confirmation message
  async sendConfirmationMessage(phoneNumber) {
    try {
      const response = await axios.post(
        `${this.baseURL}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: phoneNumber,
          type: 'text',
          text: {
            body: 'You have successfully unsubscribed from WhatsApp notifications. Reply START to resubscribe.'
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      logger.info(`WhatsApp confirmation message sent to ${phoneNumber}`);
      
    } catch (error) {
      logger.error('Error sending WhatsApp confirmation message:', error);
    }
  }

  // Validate template
  async validateTemplate(templateName) {
    try {
      const response = await axios.get(
        `${this.baseURL}/${this.phoneNumberId}/message_templates`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );
      
      const templates = response.data.data || [];
      return templates.some(template => template.name === templateName);
      
    } catch (error) {
      logger.error('Error validating WhatsApp template:', error);
      return false;
    }
  }
}

module.exports = new WhatsAppProvider();
