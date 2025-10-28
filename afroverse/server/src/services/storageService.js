const AWS = require('aws-sdk');
const { logger } = require('../utils/logger');

// Configure AWS S3
let s3Client = null;
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  s3Client = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1'
  });
} else {
  logger.warn('AWS credentials not configured - S3 uploads disabled');
}

/**
 * Upload file to S3
 * @param {string} filePath - Local file path
 * @param {string} s3Key - S3 object key
 * @param {string} bucket - S3 bucket name
 * @param {string} contentType - File content type
 * @returns {Promise<string>} S3 URL
 */
async function uploadToS3(filePath, s3Key, bucket, contentType = 'image/jpeg') {
  if (!s3Client) {
    throw new Error('S3 client not configured');
  }

  const fs = require('fs');
  const fileContent = fs.readFileSync(filePath);

  const params = {
    Bucket: bucket || process.env.S3_BUCKET || 'afroverse-uploads',
    Key: s3Key,
    Body: fileContent,
    ContentType: contentType,
    ACL: 'public-read'
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
 * @param {string} bucket - S3 bucket name
 */
async function deleteFromS3(s3Key, bucket) {
  if (!s3Client) {
    return;
  }

  const params = {
    Bucket: bucket || process.env.S3_BUCKET || 'afroverse-uploads',
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
 * @param {number} expiresIn - URL expiration in seconds
 * @param {string} bucket - S3 bucket name
 * @returns {Promise<string>} Signed URL
 */
async function getSignedUrl(s3Key, expiresIn = 3600, bucket) {
  if (!s3Client) {
    throw new Error('S3 client not configured');
  }

  const params = {
    Bucket: bucket || process.env.S3_BUCKET || 'afroverse-uploads',
    Key: s3Key,
    Expires: expiresIn
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
  uploadToS3,
  deleteFromS3,
  getSignedUrl
};


