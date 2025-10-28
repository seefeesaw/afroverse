const axios = require('axios');
const { logger } = require('../utils/logger');

class WhatsAppNotificationService {
  constructor() {
    this.baseUrl = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v17.0';
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.initialized = !!this.accessToken && !!this.phoneNumberId;
  }

  /**
   * Send WhatsApp notification using template
   * @param {object} notification - Notification object
   * @param {object} userSettings - User settings object
   */
  async send(notification, userSettings) {
    try {
      if (!this.initialized) {
        throw new Error('WhatsApp service not initialized');
      }

      if (!userSettings.whatsappPhone) {
        return { success: false, error: 'No WhatsApp phone number' };
      }

      // Get template name based on notification type
      const templateName = this.getTemplateName(notification.type);
      if (!templateName) {
        return { success: false, error: 'No WhatsApp template available' };
      }

      // Prepare template parameters
      const parameters = this.prepareTemplateParameters(notification);

      const messageData = {
        messaging_product: 'whatsapp',
        to: userSettings.whatsappPhone,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: 'en'
          },
          components: [
            {
              type: 'body',
              parameters: parameters
            }
          ]
        }
      };

      const response = await axios.post(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        messageData,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      logger.info(`WhatsApp notification sent successfully: ${response.data.messages[0].id}`);
      return { success: true, messageId: response.data.messages[0].id };

    } catch (error) {
      logger.error('Error sending WhatsApp notification:', error);
      
      if (error.response) {
        const errorData = error.response.data;
        logger.error('WhatsApp API error:', errorData);
        
        // Handle specific WhatsApp API errors
        if (errorData.error && errorData.error.code === 100) {
          return { success: false, error: 'Invalid phone number' };
        } else if (errorData.error && errorData.error.code === 131026) {
          return { success: false, error: 'Template not found' };
        }
      }
      
      return { success: false, error: error.message };
    }
  }

  /**
   * Get template name for notification type
   * @param {string} type - Notification type
   */
  getTemplateName(type) {
    const templateMap = {
      'battle_challenge': 'battle_challenge_template',
      'battle_live': 'battle_live_template',
      'battle_result': 'battle_result_template',
      'streak_reminder': 'streak_reminder_template',
      'tribe_alert': 'tribe_alert_template',
      'daily_challenge': 'daily_challenge_template',
      'coin_earned': 'coin_earned_template',
      'referral_join': 'referral_join_template'
    };

    return templateMap[type] || null;
  }

  /**
   * Prepare template parameters from notification
   * @param {object} notification - Notification object
   */
  prepareTemplateParameters(notification) {
    const parameters = [];
    
    // Extract parameters from notification metadata
    if (notification.metadata) {
      const { variables } = notification.metadata;
      if (variables) {
        // Add parameters in order (WhatsApp templates require ordered parameters)
        const paramOrder = this.getParameterOrder(notification.type);
        paramOrder.forEach(paramName => {
          if (variables[paramName]) {
            parameters.push({
              type: 'text',
              text: variables[paramName]
            });
          }
        });
      }
    }

    return parameters;
  }

  /**
   * Get parameter order for template type
   * @param {string} type - Notification type
   */
  getParameterOrder(type) {
    const parameterOrders = {
      'battle_challenge': ['challengerName', 'battleId'],
      'battle_live': ['battleId', 'timeLeft'],
      'battle_result': ['result', 'resultPercentage', 'coinsEarned'],
      'streak_reminder': ['streakDays', 'timeLeft'],
      'tribe_alert': ['tribeName', 'rank'],
      'daily_challenge': ['challengeName', 'coinReward'],
      'coin_earned': ['amount', 'reason'],
      'referral_join': ['referrerName', 'coinsEarned']
    };

    return parameterOrders[type] || [];
  }

  /**
   * Send interactive WhatsApp message
   * @param {string} phoneNumber - Phone number
   * @param {string} message - Message text
   * @param {Array} buttons - Array of button objects
   */
  async sendInteractiveMessage(phoneNumber, message, buttons = []) {
    try {
      if (!this.initialized) {
        throw new Error('WhatsApp service not initialized');
      }

      const messageData = {
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'interactive',
        interactive: {
          type: 'button',
          body: {
            text: message
          },
          action: {
            buttons: buttons.map((button, index) => ({
              type: 'reply',
              reply: {
                id: button.id || `btn_${index}`,
                title: button.title
              }
            }))
          }
        }
      };

      const response = await axios.post(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        messageData,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      logger.info(`Interactive WhatsApp message sent: ${response.data.messages[0].id}`);
      return { success: true, messageId: response.data.messages[0].id };

    } catch (error) {
      logger.error('Error sending interactive WhatsApp message:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send media message
   * @param {string} phoneNumber - Phone number
   * @param {string} mediaType - Type of media (image, document, etc.)
   * @param {string} mediaUrl - URL of the media
   * @param {string} caption - Optional caption
   */
  async sendMediaMessage(phoneNumber, mediaType, mediaUrl, caption = '') {
    try {
      if (!this.initialized) {
        throw new Error('WhatsApp service not initialized');
      }

      const messageData = {
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: mediaType,
        [mediaType]: {
          link: mediaUrl,
          caption: caption
        }
      };

      const response = await axios.post(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        messageData,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      logger.info(`WhatsApp media message sent: ${response.data.messages[0].id}`);
      return { success: true, messageId: response.data.messages[0].id };

    } catch (error) {
      logger.error('Error sending WhatsApp media message:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Verify webhook signature
   * @param {string} signature - Webhook signature
   * @param {string} payload - Webhook payload
   */
  verifyWebhook(signature, payload) {
    try {
      const crypto = require('crypto');
      const webhookSecret = process.env.WHATSAPP_WEBHOOK_SECRET;
      
      if (!webhookSecret) {
        logger.warn('WhatsApp webhook secret not configured');
        return false;
      }

      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(payload)
        .digest('hex');

      return signature === expectedSignature;
    } catch (error) {
      logger.error('Error verifying WhatsApp webhook:', error);
      return false;
    }
  }

  /**
   * Process incoming WhatsApp message
   * @param {object} message - Incoming message object
   */
  async processIncomingMessage(message) {
    try {
      const { from, type, text, interactive, button } = message;
      
      logger.info(`Received WhatsApp message from ${from}: ${type}`);

      // Handle different message types
      switch (type) {
        case 'text':
          return await this.handleTextMessage(from, text.body);
        
        case 'interactive':
          if (interactive && interactive.type === 'button_reply') {
            return await this.handleButtonReply(from, interactive.button_reply);
          }
          break;
        
        case 'image':
        case 'document':
          return await this.handleMediaMessage(from, type, message);
        
        default:
          logger.info(`Unhandled WhatsApp message type: ${type}`);
      }

      return { success: true };

    } catch (error) {
      logger.error('Error processing incoming WhatsApp message:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle text message
   * @param {string} from - Phone number
   * @param {string} text - Message text
   */
  async handleTextMessage(from, text) {
    // Implement text message handling logic
    logger.info(`Text message from ${from}: ${text}`);
    return { success: true };
  }

  /**
   * Handle button reply
   * @param {string} from - Phone number
   * @param {object} buttonReply - Button reply object
   */
  async handleButtonReply(from, buttonReply) {
    // Implement button reply handling logic
    logger.info(`Button reply from ${from}: ${buttonReply.id}`);
    return { success: true };
  }

  /**
   * Handle media message
   * @param {string} from - Phone number
   * @param {string} type - Media type
   * @param {object} message - Message object
   */
  async handleMediaMessage(from, type, message) {
    // Implement media message handling logic
    logger.info(`Media message from ${from}: ${type}`);
    return { success: true };
  }
}

module.exports = new WhatsAppNotificationService();