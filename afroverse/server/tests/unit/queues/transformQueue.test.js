jest.mock('bull');
jest.mock('../../../src/models/Transformation');
jest.mock('../../../src/services/aiService');
jest.mock('../../../src/services/imageService');
jest.mock('../../../src/services/cloudStorageService');
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn()
  }
}));

const Queue = require('bull');
const { logger } = require('../../../src/utils/logger');

describe('Transform Queue', () => {
  let mockQueue;

  beforeAll(() => {
    mockQueue = {
      process: jest.fn(),
      add: jest.fn().mockResolvedValue({ id: 'job123' }),
      close: jest.fn(),
      on: jest.fn()
    };

    Queue.mockReturnValue(mockQueue);
    
    // Now require the module
    require('../../../src/queues/transformQueue');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Queue initialization', () => {
    it('should create transform queue with correct configuration', () => {
      expect(Queue).toHaveBeenCalledWith('transform', expect.objectContaining({
        redis: expect.objectContaining({
          host: expect.any(String)
        }),
        defaultJobOptions: expect.objectContaining({
          attempts: 3,
          backoff: expect.objectContaining({
            type: 'exponential'
          })
        })
      }));
    });
  });

  describe('Job processor', () => {
    it('should register transform-image processor', () => {
      expect(mockQueue.process).toHaveBeenCalledWith(
        'transform-image',
        expect.any(Function)
      );
    });

    it('should process transformation job successfully', async () => {
      const Transformation = require('../../../src/models/Transformation');
      const aiService = require('../../../src/services/aiService');
      const cloudStorageService = require('../../../src/services/cloudStorageService');

      const processor = mockQueue.process.mock.calls.find(
        call => call[0] === 'transform-image'
      )[1];

      const mockJob = {
        data: {
          transformationId: 'trans123',
          imageUrl: 'https://example.com/image.jpg',
          style: 'african_warrior',
          intensity: 0.8
        },
        progress: jest.fn()
      };

      Transformation.findById = jest.fn().mockResolvedValue({
        _id: 'trans123',
        status: 'processing',
        createdAt: new Date(),
        save: jest.fn().mockResolvedValue(true)
      });

      aiService.generateTransformation = jest.fn().mockResolvedValue({
        success: true,
        predictionId: 'pred123'
      });

      aiService.waitForCompletion = jest.fn().mockResolvedValue({
        success: true,
        result: ['https://example.com/result.jpg']
      });

      cloudStorageService.uploadFromUrl = jest.fn().mockResolvedValue({
        success: true,
        url: 'https://storage.example.com/result.jpg'
      });

      cloudStorageService.createThumbnail = jest.fn().mockResolvedValue({
        url: 'https://storage.example.com/thumb.jpg'
      });

      await processor(mockJob);

      expect(mockJob.progress).toHaveBeenCalled();
      expect(aiService.generateTransformation).toHaveBeenCalled();
      expect(cloudStorageService.uploadFromUrl).toHaveBeenCalled();
    });

    it('should handle AI generation failure', async () => {
      const aiService = require('../../../src/services/aiService');

      const processor = mockQueue.process.mock.calls.find(
        call => call[0] === 'transform-image'
      )[1];

      const mockJob = {
        data: {
          transformationId: 'trans123',
          imageUrl: 'https://example.com/image.jpg',
          style: 'african_warrior'
        },
        progress: jest.fn()
      };

      aiService.generateTransformation = jest.fn().mockResolvedValue({
        success: false,
        error: 'AI service unavailable'
      });

      await expect(processor(mockJob)).rejects.toThrow();
      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle missing transformation', async () => {
      const Transformation = require('../../../src/models/Transformation');
      const aiService = require('../../../src/services/aiService');

      const processor = mockQueue.process.mock.calls.find(
        call => call[0] === 'transform-image'
      )[1];

      const mockJob = {
        data: {
          transformationId: 'trans123',
          imageUrl: 'https://example.com/image.jpg',
          style: 'african_warrior'
        },
        progress: jest.fn()
      };

      aiService.generateTransformation = jest.fn().mockResolvedValue({
        success: true,
        predictionId: 'pred123'
      });

      aiService.waitForCompletion = jest.fn().mockResolvedValue({
        success: true,
        result: ['https://example.com/result.jpg']
      });

      Transformation.findById = jest.fn().mockResolvedValue(null);

      await expect(processor(mockJob)).rejects.toThrow('Transformation not found');
    });
  });
});

