const { logger } = require('../utils/logger');

/**
 * Full Body Video Generation Service
 * This is a placeholder implementation
 */
class FullBodyVideoGenerationService {
  constructor() {
    this.isConfigured = false;
    logger.warn('FullBodyVideoGenerationService is running in stub mode');
  }

  async generateVideo(options) {
    logger.warn('FullBodyVideoGenerationService.generateVideo called but not configured');
    throw new Error('FullBodyVideoGenerationService is not configured. Please set up AI service credentials.');
  }

  async getMotionPacks() {
    return [
      { id: 'amapiano', name: 'Amapiano', description: 'Dance to Afrobeats' },
      { id: 'maasai_jump', name: 'Maasai Jump', description: 'Traditional dance' },
      { id: 'zulu_hero', name: 'Zulu Hero', description: 'Warrior pose' },
      { id: 'afrofusion', name: 'Afro Fusion', description: 'Modern African dance' }
    ];
  }
}

module.exports = new FullBodyVideoGenerationService();
