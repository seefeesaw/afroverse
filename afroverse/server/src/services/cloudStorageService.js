const AWS = require('aws-sdk');
const axios = require('axios');
const { logger } = require('../utils/logger');

class CloudStorageService {
  constructor() {
    // Configure AWS S3
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1'
    });
    
    this.bucketName = process.env.AWS_S3_BUCKET || 'afroverse-images';
    this.baseUrl = process.env.CLOUD_STORAGE_URL || `https://${this.bucketName}.s3.amazonaws.com`;
  }

  // Upload file to S3
  async uploadFile(filePath, key, contentType = 'image/jpeg') {
    try {
      const fs = require('fs');
      const fileContent = fs.readFileSync(filePath);
      
      const params = {
        Bucket: this.bucketName,
        Key: key,
        Body: fileContent,
        ContentType: contentType,
        ACL: 'public-read'
      };
      
      const result = await this.s3.upload(params).promise();
      
      logger.info(`File uploaded to S3: ${key}`);
      
      return {
        success: true,
        url: result.Location,
        key: result.Key
      };
    } catch (error) {
      logger.error('S3 upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Upload from URL (for AI-generated images)
  async uploadFromUrl(imageUrl, key) {
    try {
      // Download image from URL
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 30000
      });
      
      const params = {
        Bucket: this.bucketName,
        Key: key,
        Body: Buffer.from(response.data),
        ContentType: 'image/jpeg',
        ACL: 'public-read'
      };
      
      const result = await this.s3.upload(params).promise();
      
      logger.info(`Image uploaded from URL to S3: ${key}`);
      
      return {
        success: true,
        url: result.Location,
        key: result.Key
      };
    } catch (error) {
      logger.error('S3 upload from URL error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Create thumbnail
  async createThumbnail(imageUrl, thumbnailKey) {
    try {
      const sharp = require('sharp');
      
      // Download image
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 30000
      });
      
      // Create thumbnail
      const thumbnailBuffer = await sharp(Buffer.from(response.data))
        .resize(256, 256, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 80 })
        .toBuffer();
      
      // Upload thumbnail
      const params = {
        Bucket: this.bucketName,
        Key: thumbnailKey,
        Body: thumbnailBuffer,
        ContentType: 'image/jpeg',
        ACL: 'public-read'
      };
      
      const result = await this.s3.upload(params).promise();
      
      logger.info(`Thumbnail created and uploaded: ${thumbnailKey}`);
      
      return {
        success: true,
        url: result.Location,
        key: result.Key
      };
    } catch (error) {
      logger.error('Thumbnail creation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Delete file from S3
  async deleteFile(key) {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: key
      };
      
      await this.s3.deleteObject(params).promise();
      
      logger.info(`File deleted from S3: ${key}`);
      
      return {
        success: true
      };
    } catch (error) {
      logger.error('S3 delete error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Generate signed URL for private access
  async generateSignedUrl(key, expiresIn = 3600) {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: key,
        Expires: expiresIn
      };
      
      const url = this.s3.getSignedUrl('getObject', params);
      
      return {
        success: true,
        url
      };
    } catch (error) {
      logger.error('Signed URL generation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get file metadata
  async getFileMetadata(key) {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: key
      };
      
      const result = await this.s3.headObject(params).promise();
      
      return {
        success: true,
        metadata: {
          size: result.ContentLength,
          contentType: result.ContentType,
          lastModified: result.LastModified,
          etag: result.ETag
        }
      };
    } catch (error) {
      logger.error('File metadata error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // List files in directory
  async listFiles(prefix, maxKeys = 100) {
    try {
      const params = {
        Bucket: this.bucketName,
        Prefix: prefix,
        MaxKeys: maxKeys
      };
      
      const result = await this.s3.listObjectsV2(params).promise();
      
      return {
        success: true,
        files: result.Contents.map(item => ({
          key: item.Key,
          size: item.Size,
          lastModified: item.LastModified,
          etag: item.ETag
        }))
      };
    } catch (error) {
      logger.error('List files error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new CloudStorageService();
