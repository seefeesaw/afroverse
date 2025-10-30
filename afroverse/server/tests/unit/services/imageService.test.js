const ImageProcessingService = require('../../../src/services/imageService');
const sharp = require('sharp');
const fs = require('fs').promises;
const { logger } = require('../../../src/utils/logger');

jest.mock('sharp');
jest.mock('fs', () => ({
  promises: {
    access: jest.fn(),
    unlink: jest.fn()
  },
  existsSync: jest.fn(() => true),
  readFileSync: jest.fn()
}));
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn()
  }
}));

describe('Image Processing Service', () => {
  let imageService;
  let mockSharpInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    imageService = new ImageProcessingService();

    mockSharpInstance = {
      metadata: jest.fn(),
      resize: jest.fn().mockReturnThis(),
      jpeg: jest.fn().mockReturnThis(),
      png: jest.fn().mockReturnThis(),
      webp: jest.fn().mockReturnThis(),
      toFile: jest.fn()
    };

    sharp.mockReturnValue(mockSharpInstance);
  });

  describe('validateImage', () => {
    it('should validate correct image', async () => {
      const file = {
        size: 2 * 1024 * 1024, // 2MB
        mimetype: 'image/jpeg',
        path: '/tmp/test.jpg'
      };

      fs.access.mockResolvedValue(undefined);

      const result = await imageService.validateImage(file);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject oversized image', async () => {
      const file = {
        size: 6 * 1024 * 1024, // 6MB
        mimetype: 'image/jpeg',
        path: '/tmp/test.jpg'
      };

      const result = await imageService.validateImage(file);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Image size must be less than 5MB');
    });

    it('should reject unsupported format', async () => {
      const file = {
        size: 1 * 1024 * 1024,
        mimetype: 'image/gif',
        path: '/tmp/test.gif'
      };

      const result = await imageService.validateImage(file);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Image must be JPG, PNG, or WebP format');
    });

    it('should reject inaccessible file', async () => {
      const file = {
        size: 1 * 1024 * 1024,
        mimetype: 'image/jpeg',
        path: '/tmp/nonexistent.jpg'
      };

      fs.access.mockRejectedValue(new Error('File not found'));

      const result = await imageService.validateImage(file);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Image file is not accessible');
    });
  });

  describe('processImage', () => {
    it('should process image successfully', async () => {
      mockSharpInstance.metadata
        .mockResolvedValueOnce({ width: 2000, height: 2000 })
        .mockResolvedValueOnce({ width: 1024, height: 1024, size: 50000, format: 'jpeg' });
      mockSharpInstance.toFile.mockResolvedValue({});

      const result = await imageService.processImage('/tmp/input.jpg', '/tmp/output.jpg');

      expect(result.success).toBe(true);
      expect(result.metadata).toBeDefined();
      expect(mockSharpInstance.resize).toHaveBeenCalled();
      expect(mockSharpInstance.toFile).toHaveBeenCalledWith('/tmp/output.jpg');
    });

    it('should handle processing errors', async () => {
      mockSharpInstance.metadata.mockRejectedValue(new Error('Processing failed'));

      const result = await imageService.processImage('/tmp/input.jpg', '/tmp/output.jpg');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Processing failed');
    });

    it('should use custom options', async () => {
      mockSharpInstance.metadata
        .mockResolvedValueOnce({ width: 500, height: 500 })
        .mockResolvedValueOnce({ width: 512, height: 512, size: 25000, format: 'png' });
      mockSharpInstance.toFile.mockResolvedValue({});

      const options = {
        width: 512,
        height: 512,
        quality: 80,
        format: 'png'
      };

      await imageService.processImage('/tmp/input.jpg', '/tmp/output.jpg', options);

      expect(mockSharpInstance.resize).toHaveBeenCalledWith(512, 512, expect.any(Object));
      expect(mockSharpInstance.png).toHaveBeenCalled();
    });
  });

  describe('createThumbnail', () => {
    it('should create thumbnail successfully', async () => {
      mockSharpInstance.toFile.mockResolvedValue({});

      const result = await imageService.createThumbnail('/tmp/input.jpg', '/tmp/thumb.jpg');

      expect(result.success).toBe(true);
      expect(mockSharpInstance.resize).toHaveBeenCalledWith(
        imageService.thumbnailSize,
        imageService.thumbnailSize,
        expect.any(Object)
      );
    });

    it('should handle thumbnail creation errors', async () => {
      mockSharpInstance.toFile.mockRejectedValue(new Error('Thumbnail failed'));

      const result = await imageService.createThumbnail('/tmp/input.jpg', '/tmp/thumb.jpg');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Thumbnail failed');
    });
  });

  describe('detectFaces', () => {
    it('should detect faces', async () => {
      mockSharpInstance.metadata.mockResolvedValue({ width: 1024, height: 1024 });

      const result = await imageService.detectFaces('/tmp/test.jpg');

      expect(result.hasFace).toBe(true);
      expect(result.faceCount).toBe(1);
    });

    it('should handle detection errors', async () => {
      mockSharpInstance.metadata.mockRejectedValue(new Error('Detection failed'));

      const result = await imageService.detectFaces('/tmp/test.jpg');

      expect(result.hasFace).toBe(false);
      expect(result.faceCount).toBe(0);
    });
  });

  describe('checkNSFW', () => {
    it('should check NSFW content', async () => {
      mockSharpInstance.metadata.mockResolvedValue({ width: 1024, height: 1024 });

      const result = await imageService.checkNSFW('/tmp/test.jpg');

      expect(result).toHaveProperty('isNSFW');
      expect(result).toHaveProperty('confidence');
    });

    it('should handle NSFW check errors', async () => {
      mockSharpInstance.metadata.mockRejectedValue(new Error('NSFW check failed'));

      const result = await imageService.checkNSFW('/tmp/test.jpg');

      expect(result.isNSFW).toBe(false);
    });
  });
});

