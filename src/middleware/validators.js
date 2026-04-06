const { body, query, param, validationResult } = require('express-validator');
const { RECORD_TYPES, CATEGORIES } = require('../models/record.model');
const { ROLES } = require('../config/roles');

/**
 * Runs after validation rules and returns errors if any exist.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array().map((e) => e.msg) });
  }
  next();
};

const authValidators = {
  register: [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role')
      .optional()
      .isIn(Object.values(ROLES))
      .withMessage(`Role must be one of: ${Object.values(ROLES).join(', ')}`),
    validate,
  ],
  login: [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
    validate,
  ],
};

const recordValidators = {
  create: [
    body('amount')
      .isFloat({ min: 0.01 })
      .withMessage('Amount must be a positive number'),
    body('type')
      .isIn(RECORD_TYPES)
      .withMessage(`Type must be one of: ${RECORD_TYPES.join(', ')}`),
    body('category')
      .isIn(CATEGORIES)
      .withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`),
    body('date').optional().isISO8601().withMessage('Date must be a valid ISO 8601 date'),
    body('notes').optional().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
    validate,
  ],
  update: [
    body('amount').optional().isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
    body('type').optional().isIn(RECORD_TYPES).withMessage(`Type must be one of: ${RECORD_TYPES.join(', ')}`),
    body('category').optional().isIn(CATEGORIES).withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`),
    body('date').optional().isISO8601().withMessage('Date must be a valid ISO 8601 date'),
    body('notes').optional().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
    validate,
  ],
  filters: [
    query('type').optional().isIn(RECORD_TYPES).withMessage(`Type must be one of: ${RECORD_TYPES.join(', ')}`),
    query('category').optional().isIn(CATEGORIES).withMessage(`Invalid category`),
    query('startDate').optional().isISO8601().withMessage('startDate must be a valid date'),
    query('endDate').optional().isISO8601().withMessage('endDate must be a valid date'),
    query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
    validate,
  ],
};

const userValidators = {
  updateRole: [
    body('role')
      .isIn(Object.values(ROLES))
      .withMessage(`Role must be one of: ${Object.values(ROLES).join(', ')}`),
    validate,
  ],
  updateStatus: [
    body('isActive').isBoolean().withMessage('isActive must be a boolean'),
    validate,
  ],
};

module.exports = { authValidators, recordValidators, userValidators };
