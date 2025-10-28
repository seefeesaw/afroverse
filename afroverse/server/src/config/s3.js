const AWS = require('aws-sdk');
const { logger } = require('../utils/logger');

// S3 Client initialization
let s3Client = null;
const isS3Configured = !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);

if (isS3Configured) {
  s3Client = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1'
  });
  logger.info('S3 client initialized');
} else {
  logger.warn('AWS credentials not configured - S3 uploads disabled');
}

/**
 * Upload file to S3
 * @param {string} filePath - Local file path
 * @param {string} s3Key - S3 object key
 * @param {Object} options - Upload options
 * @returns {Promise<string>} S3 URL
 */
async function uploadFileToS3(filePath, s3Key, options = {}) {
  if (!isS3Configured) {
    logger.warn('S3 not configured - returning placeholder URL');
    return `https://placeholder.s3.amazonaws.com/${s3Key}`;
  }

  const fs = require('fs');
  const fileContent = fs.readFileSync(filePath);

  const params = {
    Bucket: options.bucket || process.env.S3_BUCKET || 'afroverse-uploads',
    Key: s3Key,
    Body: fileContent,
    ContentType: options.contentType || 'video/mp4',
    ACL: options.acl || 'public-read'
  };

  try {
    const result = await s3Client.upload(params).promise();
    logger.info(`File uploaded to S3: ${result.Location}`);
    return result.Location;
  } catch (error) {
    logger.error('S3 upload error:', error);
    throw error;
  }
}

/**
 * Delete file from S3
 * @param {string} s3Key - S3 object key
 * @param {Object} options - Delete options
 */
async function deleteFileFromS3(s3Key, options = {}) {
  if (!isS3Configured) {
    return;
  }

  const params = {
    Bucket: options.bucket || process.env.S3_BUCKET || 'afroverse-uploads',
    Key: s3Key
  };

  try {
    await s3Client.deleteObject(params).promise();
    logger.info(`File deleted from S3: ${s3Key}`);
  } catch (error) {
    logger.error('S3 delete error:', error);
  }
}

/**
 * Get signed URL for S3 object
 * @param {string} s3Key - S3 object key
 * @param {Object} options - URL options
 * @returns {Promise<string>} Signed URL
 */
async function getSignedUrl(s3Key, options = {}) {
  if (!isS3Configured) {
    return `https://placeholder.s3.amazonaws.com/${s3Key}`;
  }

  const params = {
    Bucket: options.bucket || process.env.S3_BUCKET || 'afroverse-uploads',
    Key: s3Key,
    Expires: options.expires || 3600
  };

  try {
    const url = s3Client.getSignedUrl('getObject', params);
    return url;
  } catch (error) {
    logger.error('Error getting signed URL:', error);
    throw error;
  }
}

module.exports = {
  s3Client,
  isS3Configured,
  uploadFileToS3,
  deleteFileFromS3,
  getSignedUrl
};


