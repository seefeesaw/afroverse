const multer = require('multer');
const path = require('path');
const fs = require('fs');
const imageService = require('../services/imageService');
const { logger } = require('../utils/logger');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, and WebP images are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only one file at a time
  }
});

// Middleware for single image upload
const uploadSingleImage = upload.single('image');

// Enhanced upload middleware with validation
const uploadImageMiddleware = (req, res, next) => {
  uploadSingleImage(req, res, async (err) => {
    if (err) {
      logger.error('Upload error:', err);
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    try {
      // Validate image
      const validation = await imageService.validateImage(req.file);
      
      if (!validation.isValid) {
        // Clean up uploaded file
        await imageService.cleanupTempFiles([req.file.path]);
        
        return res.status(400).json({
          success: false,
          message: 'Image validation failed',
          errors: validation.errors
        });
      }

      // Detect faces
      const faceDetection = await imageService.detectFaces(req.file.path);
      
      if (!faceDetection.hasFace) {
        // Clean up uploaded file
        await imageService.cleanupTempFiles([req.file.path]);
        
        return res.status(400).json({
          success: false,
          message: 'No face detected in image. Please upload a clear selfie.'
        });
      }

      if (faceDetection.multipleFaces) {
        // Clean up uploaded file
        await imageService.cleanupTempFiles([req.file.path]);
        
        return res.status(400).json({
          success: false,
          message: 'Multiple faces detected. Please upload a selfie with only one person.'
        });
      }

      // Check for NSFW content
      const nsfwCheck = await imageService.checkNSFW(req.file.path);
      
      if (nsfwCheck.isNSFW) {
        // Clean up uploaded file
        await imageService.cleanupTempFiles([req.file.path]);
        
        return res.status(400).json({
          success: false,
          message: 'Inappropriate content detected. Please upload a suitable image.'
        });
      }

      // Process image (resize to 1024x1024)
      const processedFilename = imageService.generateFilename(req.file.filename, '_processed');
      const processedPath = path.join(uploadsDir, processedFilename);
      
      const processResult = await imageService.processImage(
        req.file.path,
        processedPath,
        {
          width: 1024,
          height: 1024,
          quality: 90,
          format: 'jpeg'
        }
      );

      if (!processResult.success) {
        // Clean up files
        await imageService.cleanupTempFiles([req.file.path]);
        
        return res.status(500).json({
          success: false,
          message: 'Image processing failed',
          error: processResult.error
        });
      }

      // Add processed file info to request
      req.processedImage = {
        path: processedPath,
        filename: processedFilename,
        metadata: processResult.metadata
      };

      // Add face detection results
      req.faceDetection = faceDetection;

      // Add NSFW check results
      req.nsfwCheck = nsfwCheck;

      next();
    } catch (error) {
      logger.error('Image processing middleware error:', error);
      
      // Clean up files
      if (req.file) {
        await imageService.cleanupTempFiles([req.file.path]);
      }
      if (req.processedImage) {
        await imageService.cleanupTempFiles([req.processedImage.path]);
      }
      
      return res.status(500).json({
        success: false,
        message: 'Image processing failed',
        error: error.message
      });
    }
  });
};

// Cleanup middleware to remove temp files after request
const cleanupTempFiles = (req, res, next) => {
  const originalCleanup = res.end;
  
  res.end = function(...args) {
    // Clean up temp files
    const filesToCleanup = [];
    
    if (req.file) {
      filesToCleanup.push(req.file.path);
    }
    
    if (req.processedImage) {
      filesToCleanup.push(req.processedImage.path);
    }
    
    if (filesToCleanup.length > 0) {
      imageService.cleanupTempFiles(filesToCleanup).catch(err => {
        logger.warn('Failed to cleanup temp files:', err);
      });
    }
    
    // Call original end method
    originalCleanup.apply(this, args);
  };
  
  next();
};

module.exports = {
  uploadImageMiddleware,
  cleanupTempFiles,
  upload
};
