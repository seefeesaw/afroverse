const axios = require('axios');
const { logger } = require('../utils/logger');

class AIService {
  constructor() {
    this.replicateApiUrl = 'https://api.replicate.com/v1';
    this.apiToken = process.env.REPLICATE_API_TOKEN;
    this.modelVersion = process.env.REPLICATE_MODEL_VERSION || 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b';
  }

  // Style prompts for different cultural styles
  getStylePrompts() {
    return {
      maasai: {
        prompt: 'portrait of a Maasai warrior, traditional red shuka cloth, beaded jewelry, ceremonial face paint, proud expression, African savanna background, vibrant colors, detailed traditional attire, cultural authenticity, professional photography',
        negativePrompt: 'western clothing, modern fashion, non-African features, cartoon, anime, low quality, blurry, distorted'
      },
      zulu: {
        prompt: 'portrait of Zulu royalty, traditional isicholo headdress, colorful beadwork, ceremonial regalia, dignified pose, South African landscape, rich cultural heritage, traditional Zulu attire, authentic African features, ceremonial jewelry',
        negativePrompt: 'western clothing, modern fashion, non-African features, cartoon, anime, low quality, blurry, distorted'
      },
      pharaoh: {
        prompt: 'portrait of an Egyptian pharaoh, golden nemes headdress, elaborate jewelry, hieroglyphic background, regal pose, ancient Egyptian style, golden accessories, traditional pharaonic attire, majestic expression, historical accuracy',
        negativePrompt: 'modern clothing, contemporary fashion, non-Egyptian features, cartoon, anime, low quality, blurry, distorted'
      },
      afrofuturistic: {
        prompt: 'afrofuturistic portrait, futuristic African warrior, cyberpunk elements, traditional patterns with modern tech, glowing tribal markings, futuristic armor, neon colors, African features, sci-fi aesthetic, Wakanda-inspired style',
        negativePrompt: 'western clothing, modern fashion, non-African features, cartoon, anime, low quality, blurry, distorted, outdated technology'
      }
    };
  }

  // Generate transformation using Replicate
  async generateTransformation(imageUrl, style, intensity = 0.8) {
    try {
      const stylePrompts = this.getStylePrompts();
      const styleConfig = stylePrompts[style];

      if (!styleConfig) {
        throw new Error(`Unknown style: ${style}`);
      }

      const input = {
        image: imageUrl,
        prompt: styleConfig.prompt,
        negative_prompt: styleConfig.negativePrompt,
        num_inference_steps: 20,
        guidance_scale: 7.5,
        strength: intensity,
        seed: Math.floor(Math.random() * 1000000)
      };

      logger.info('Starting Replicate generation:', { style, intensity });

      const response = await axios.post(
        `${this.replicateApiUrl}/predictions`,
        {
          version: this.modelVersion,
          input
        },
        {
          headers: {
            'Authorization': `Token ${this.apiToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const predictionId = response.data.id;
      logger.info('Replicate prediction started:', predictionId);

      return {
        success: true,
        predictionId,
        status: 'processing'
      };
    } catch (error) {
      logger.error('Replicate generation error:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message
      };
    }
  }

  // Check prediction status
  async checkPredictionStatus(predictionId) {
    try {
      const response = await axios.get(
        `${this.replicateApiUrl}/predictions/${predictionId}`,
        {
          headers: {
            'Authorization': `Token ${this.apiToken}`
          }
        }
      );

      const prediction = response.data;
      
      return {
        success: true,
        status: prediction.status,
        result: prediction.output,
        error: prediction.error,
        logs: prediction.logs
      };
    } catch (error) {
      logger.error('Prediction status check error:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message
      };
    }
  }

  // Wait for prediction completion
  async waitForCompletion(predictionId, maxWaitTime = 300000) { // 5 minutes max
    const startTime = Date.now();
    const pollInterval = 5000; // 5 seconds

    while (Date.now() - startTime < maxWaitTime) {
      const statusCheck = await this.checkPredictionStatus(predictionId);
      
      if (!statusCheck.success) {
        return statusCheck;
      }

      if (statusCheck.status === 'succeeded') {
        return {
          success: true,
          status: 'completed',
          result: statusCheck.result
        };
      }

      if (statusCheck.status === 'failed') {
        return {
          success: false,
          status: 'failed',
          error: statusCheck.error || 'Prediction failed'
        };
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    return {
      success: false,
      status: 'timeout',
      error: 'Prediction timed out'
    };
  }

  // Get available styles
  getAvailableStyles() {
    return {
      free: ['maasai', 'zulu'],
      premium: ['pharaoh', 'afrofuturistic']
    };
  }

  // Check if style is premium
  isPremiumStyle(style) {
    const styles = this.getAvailableStyles();
    return styles.premium.includes(style);
  }

  // Get style display information
  getStyleInfo(style) {
    const styleInfo = {
      maasai: {
        name: 'Maasai Warrior',
        description: 'Transform into a proud Maasai warrior with traditional red shuka and beaded jewelry',
        emoji: '🦁',
        isPremium: false
      },
      zulu: {
        name: 'Zulu Royalty',
        description: 'Become Zulu royalty with ceremonial headdress and colorful beadwork',
        emoji: '👑',
        isPremium: false
      },
      pharaoh: {
        name: 'Egyptian Pharaoh',
        description: 'Rule as an Egyptian pharaoh with golden nemes and hieroglyphic majesty',
        emoji: '🏺',
        isPremium: true
      },
      afrofuturistic: {
        name: 'Afro-Futuristic Wakanda Style',
        description: 'Embrace the future with cyberpunk African warrior aesthetics',
        emoji: '🚀',
        isPremium: true
      }
    };

    return styleInfo[style] || null;
  }
}

module.exports = new AIService();
