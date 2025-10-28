const axios = require('axios');
const { logger } = require('../utils/logger');

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v18.0';
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

// Send OTP via WhatsApp Cloud API
const sendWhatsAppOTP = async (phoneNumber, otpCode) => {
  try {
    if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
      logger.warn('WhatsApp credentials not configured, skipping OTP send');
      return;
    }

    const message = {
      messaging_product: 'whatsapp',
      to: phoneNumber,
      type: 'text',
      text: {
        body: `Your Afroverse verification code is: ${otpCode}\n\nThis code expires in 5 minutes. Do not share this code with anyone.`
      }
    };

    const response = await axios.post(
      `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      message,
      {
        headers: {
          'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    logger.info(`WhatsApp OTP sent successfully to ${phoneNumber}`, {
      messageId: response.data.messages?.[0]?.id
    });

    return response.data;
  } catch (error) {
    logger.error('Failed to send WhatsApp OTP:', {
      phoneNumber,
      error: error.response?.data || error.message
    });
    throw error;
  }
};

// Send template message (for future use)
const sendTemplateMessage = async (phoneNumber, templateName, parameters = []) => {
  try {
    if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
      logger.warn('WhatsApp credentials not configured, skipping template send');
      return;
    }

    const message = {
      messaging_product: 'whatsapp',
      to: phoneNumber,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: 'en'
        },
        components: parameters.length > 0 ? [{
          type: 'body',
          parameters: parameters.map(param => ({
            type: 'text',
            text: param
          }))
        }] : []
      }
    };

    const response = await axios.post(
      `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      message,
      {
        headers: {
          'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    logger.info(`WhatsApp template sent successfully to ${phoneNumber}`, {
      templateName,
      messageId: response.data.messages?.[0]?.id
    });

    return response.data;
  } catch (error) {
    logger.error('Failed to send WhatsApp template:', {
      phoneNumber,
      templateName,
      error: error.response?.data || error.message
    });
    throw error;
  }
};

// Send battle challenge notification
const sendWhatsAppBattleChallenge = async (phoneNumber, battleData) => {
  try {
    if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
      logger.warn('WhatsApp credentials not configured, skipping battle challenge');
      return;
    }

    const message = {
      messaging_product: 'whatsapp',
      to: phoneNumber,
      type: 'text',
      text: {
        body: `⚔️ Battle Challenge!\n\n${battleData.challengerUsername} has challenged you to a transformation battle!\n\n"${battleData.message}"\n\nAccept the challenge: ${battleData.battleUrl}\n\nShow them who wears it better! 🔥`
      }
    };

    const response = await axios.post(
      `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      message,
      {
        headers: {
          'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    logger.info(`WhatsApp battle challenge sent successfully to ${phoneNumber}`, {
      messageId: response.data.messages?.[0]?.id
    });

    return response.data;
  } catch (error) {
    logger.error('Failed to send WhatsApp battle challenge:', {
      phoneNumber,
      error: error.response?.data || error.message
    });
    throw error;
  }
};

// Send battle notification
const sendWhatsAppBattleNotification = async (phoneNumber, notificationData) => {
  try {
    if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
      logger.warn('WhatsApp credentials not configured, skipping battle notification');
      return;
    }

    let messageBody = '';
    
    switch (notificationData.type) {
      case 'expired':
        messageBody = `⏰ Battle Expired\n\nYour battle challenge ${notificationData.battleCode} expired without acceptance.\n\nTry challenging someone else!`;
        break;
      case 'completed':
        if (notificationData.isWinner) {
          messageBody = `🏆 Victory!\n\nYou won battle ${notificationData.battleCode} by ${notificationData.marginPct}%!\n\n+100 tribe points earned! 🎉`;
        } else {
          messageBody = `💪 Battle Complete\n\nBattle ${notificationData.battleCode} finished.\n\nYou earned 25 tribe points for participating!`;
        }
        break;
      default:
        messageBody = notificationData.message || 'Battle update from Afroverse!';
    }

    const message = {
      messaging_product: 'whatsapp',
      to: phoneNumber,
      type: 'text',
      text: {
        body: messageBody
      }
    };

    const response = await axios.post(
      `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      message,
      {
        headers: {
          'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    logger.info(`WhatsApp battle notification sent successfully to ${phoneNumber}`, {
      type: notificationData.type,
      messageId: response.data.messages?.[0]?.id
    });

    return response.data;
  } catch (error) {
    logger.error('Failed to send WhatsApp battle notification:', {
      phoneNumber,
      type: notificationData.type,
      error: error.response?.data || error.message
    });
    throw error;
  }
};

module.exports = {
  sendWhatsAppOTP,
  sendTemplateMessage,
  sendWhatsAppBattleChallenge,
  sendWhatsAppBattleNotification
};
