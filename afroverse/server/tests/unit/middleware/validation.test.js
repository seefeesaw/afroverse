const { validationResult } = require('express-validator');
const {
  handleValidationErrors,
  validateAuthStart,
  validateAuthVerify,
  validateProfileUpdate
} = require('../../../src/middleware/validation');

jest.mock('express-validator', () => ({
  body: jest.fn(() => ({
    isString: jest.fn().mockReturnThis(),
    notEmpty: jest.fn().mockReturnThis(),
    matches: jest.fn().mockReturnThis(),
    isLength: jest.fn().mockReturnThis(),
    isURL: jest.fn().mockReturnThis(),
    optional: jest.fn().mockReturnThis(),
    withMessage: jest.fn().mockReturnThis()
  })),
  validationResult: jest.fn()
}));

describe('Validation Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  describe('handleValidationErrors', () => {
    it('should call next() when validation passes', () => {
      validationResult.mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(true),
        array: jest.fn().mockReturnValue([])
      });

      handleValidationErrors(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 400 with errors when validation fails', () => {
      const errors = [
        { path: 'phone', msg: 'Phone is required', value: '' },
        { path: 'otp', msg: 'OTP must be 6 digits', value: '123' }
      ];

      validationResult.mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue(errors)
      });

      handleValidationErrors(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation failed',
        errors: [
          { field: 'phone', message: 'Phone is required', value: '' },
          { field: 'otp', message: 'OTP must be 6 digits', value: '123' }
        ]
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('validateAuthStart', () => {
    it('should be an array with validators and handler', () => {
      expect(Array.isArray(validateAuthStart)).toBe(true);
      expect(validateAuthStart.length).toBeGreaterThan(0);
    });
  });

  describe('validateAuthVerify', () => {
    it('should be an array with manually and handler', () => {
      expect(Array.isArray(validateAuthVerify)).toBe(true);
      expect(validateAuthVerify.length).toBeGreaterThan(0);
    });
  });

  describe('validateProfileUpdate', () => {
    it('should be an array with validators and handler', () => {
      expect(Array.isArray(validateProfileUpdate)).toBe(true);
      expect(validateProfileUpdate.length).toBeGreaterThan(0);
    });
  });
});


