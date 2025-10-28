const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const { logger } = require('../utils/logger');

class ImageProcessingService {
  constructor() {
    this.maxFileSize = 5 * 1024 * 1024; // 5MB
    this.allowedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    this.targetSize = 1024;
    this.thumbnailSize = 256;
  }

  // Validate uploaded image
  async validateImage(file) {
    const errors = [];

    // Check file size
    if (file.size > this.maxFileSize) {
      errors.push('Image size must be less than 5MB');
    }

    // Check file type
    if (!this.allowedFormats.includes(file.mimetype)) {
      errors.push('Image must be JPG, PNG, or WebP format');
    }

    // Check if file exists and is readable
    try {
      await fs.access(file.path);
    } catch (error) {
      errors.push('Image file is not accessible');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Process and resize image
  async processImage(inputPath, outputPath, options = {}) {
    try {
      const {
        width = this.targetSize,
        height = this.targetSize,
        quality = 90,
        format = 'jpeg'
      } = options;

      // Get image metadata
      const metadata = await sharp(inputPath).metadata();
      
      // Resize image maintaining aspect ratio
      const processedImage = sharp(inputPath)
        .resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality });

      // Apply format conversion if needed
      if (format === 'png') {
        processedImage.png({ quality });
      } else if (format === 'webp') {
        processedImage.webp({ quality });
      }

      await processedImage.toFile(outputPath);

      // Get final metadata
      const finalMetadata = await sharp(outputPath).metadata();

      return {
        success: true,
        metadata: {
          width: finalMetadata.width,
          height: finalMetadata.height,
          size: finalMetadata.size,
          format: finalMetadata.format
        }
      };
    } catch (error) {
      logger.error('Image processing error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Create thumbnail
  async createThumbnail(inputPath, outputPath) {
    try {
      await sharp(inputPath)
        .resize(this.thumbnailSize, this.thumbnailSize, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 80 })
        .toFile(outputPath);

      return { success: true };
    } catch (error) {
      logger.error('Thumbnail creation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Detect faces in image (simplified - in production, use proper face detection)
  async detectFaces(imagePath) {
    try {
      // This is a simplified implementation
      // In production, you would use a proper face detection library like:
      // - OpenCV with face detection
      // - AWS Rekognition
      // - Google Vision API
      // - Face-api.js
      
      const metadata = await sharp(imagePath).metadata();
      
      // For now, we'll assume all images have faces
      // In production, implement actual face detection
      return {
        faceCount: 1,
        hasFace: true,
        multipleFaces: false,
        confidence: 0.95
      };
    } catch (error) {
      logger.error('Face detection error:', error);
      return {
        faceCount: 0,
        hasFace: false,
        multipleFaces: false,
        confidence: 0
      };
    }
  }

  // Check for NSFW content (simplified - in production, use proper NSFW detection)
  async checkNSFW(imagePath) {
    try {
      // This is a simplified implementation
      // In production, you would use a proper NSFW detection service like:
      // - AWS Rekognition
      // - Google Vision API
      // - TensorFlow NSFW model
      // - Cloudinary's NSFW detection
      
      // For now, we'll assume all images are safe
      // In production, implement actual NSFW detection
      return {
        isNSFW: false,
        confidence: 0.95,
        categories: []
      };
    } catch (error) {
      logger.error('NSFW detection error:', error);
      return {
        isNSFW: false,
        confidence: 0,
        categories: []
      };
    }
  }

  // Add watermark to image
  async addWatermark(imagePath, outputPath, watermarkText = 'AFROVERSE') {
    try {
      const image = sharp(imagePath);
      const metadata = await image.metadata();

      // Create watermark SVG
      const watermarkSvg = `
        <svg width="${metadata.width}" height="${metadata.height}">
          <text x="${metadata.width - 200}" y="${metadata.height - 20}" 
                font-family="Arial, sans-serif" 
                font-size="24" 
                font-weight="bold" 
                fill="rgba(255,255,255,0.8)" 
                stroke="rgba(0,0,0,0.5)" 
                stroke-width="1">
            ${watermarkText}
          </text>
        </svg>
      `;

      await image
        .composite([{
          input: Buffer.from(watermarkSvg),
          top: 0,
          left: 0
        }])
        .jpeg({ quality: 90 })
        .toFile(outputPath);

      return { success: true };
    } catch (error) {
      logger.error('Watermark addition error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Clean up temporary files
  async cleanupTempFiles(filePaths) {
    try {
      await Promise.all(
        filePaths.map(filePath => 
          fs.unlink(filePath).catch(err => 
            logger.warn(`Failed to delete temp file ${filePath}:`, err)
          )
        )
      );
    } catch (error) {
      logger.error('Cleanup error:', error);
    }
  }

  // Generate unique filename
  generateFilename(originalName, suffix = '') {
    const ext = path.extname(originalName);
    const name = path.basename(originalName, ext);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    
    return `${name}_${timestamp}_${random}${suffix}${ext}`;
  }
}

module.exports = new ImageProcessingService();
