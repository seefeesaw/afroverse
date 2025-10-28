const { body, validationResult } = require('express-validator');

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Auth validation rules
const validateAuthStart = [
  body('phone')
    .isString()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^\+[1-9]\d{1,14}$/)
    .withMessage('Phone number must be in international format (+1234567890)'),
  handleValidationErrors
];

const validateAuthVerify = [
  body('phone')
    .isString()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^\+[1-9]\d{1,14}$/)
    .withMessage('Phone number must be in international format (+1234567890)'),
  body('otp')
    .isString()
    .notEmpty()
    .withMessage('OTP is required')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be exactly 6 digits')
    .matches(/^\d{6}$/)
    .withMessage('OTP must contain only digits'),
  handleValidationErrors
];

// User profile validation rules
const validateProfileUpdate = [
  body('username')
    .optional()
    .isString()
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('avatar')
    .optional()
    .isString()
    .isURL()
    .withMessage('Avatar must be a valid URL'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateRequest: handleValidationErrors, // Alias for backwards compatibility
  validateAuthStart,
  validateAuthVerify,
  validateProfileUpdate
};
