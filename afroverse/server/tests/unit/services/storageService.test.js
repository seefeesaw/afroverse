const storageService = require('../../../src/services/storageService');
const { uploadFileToS3, deleteFileFromS3 } = require('../../../src/config/s3');
const { logger } = require('../../../src/utils/logger');

jest.mock('../../../src/config/s3', () => ({
  uploadFileToS3: jest.fn(),
  deleteFileFromS3: jest.fn(),
  getSignedUrl: jest.fn()
}));
jest.mock('../../../src/utils/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn()
  }
}));

describe('Storage Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadToS3', () => {
    it('should upload file to S3 successfully', async () => {
      const filePath = '/tmp/test.jpg';
      const s3Key = 'uploads/test.jpg';
      const mockUrl = 'https://s3.amazonaws.com/bucket/uploads/test.jpg';

      uploadFileToS3.mockResolvedValue(mockUrl);

      const result = await storageService.uploadToS3(filePath, s3Key);

      expect(uploadFileToS3).toHaveBeenCalledWith(
        filePath,
        s3Key,
        expect.any(Object)
      );
      expect(result).toBe(mockUrl);
    });

    it('should handle upload errors', async () => {
      const error = new Error('Upload failed');
      uploadFileToS3.mockRejectedValue(error);

      await expect(
        storageService.uploadToS3('/tmp/test.jpg', 'uploads/test.jpg')
      ).rejects.toThrow('Upload failed');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('deleteFromS3', () => {
    it('should delete file from S3 successfully', async () => {
      deleteFileFromS3.mockResolvedValue(undefined);

      await storageService.deleteFromS3('uploads/test.jpg');

      expect(deleteFileFromS3).toHaveBeenCalledWith(
        'uploads/test.jpg',
        expect.any(Object)
      );
    });

    it('should handle delete errors gracefully', async () => {
      const error = new Error('Delete failed');
      deleteFileFromS3.mockRejectedValue(error);

      // Should not throw, just log error
      await expect(
        storageService.deleteFromS3('uploads/test.jpg')
      ).resolves.not.toThrow();
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('getSignedUrl', () => {
    it('should get signed URL successfully', async () => {
      const { getSignedUrl } = require('../../../src/config/s3');
      const mockUrl = 'https://s3.amazonaws.com/bucket/file.jpg?signature=abc123';
      getSignedUrl.mockResolvedValue(mockUrl);

      const result = await storageService.getSignedUrl('uploads/test.jpg');

      expect(result).toBe(mockUrl);
    });
  });
});

