const { body } = require('express-validator');

const createCustomerValidator = [
  body('companyName')
    .trim()
    .notEmpty()
    .withMessage('Company name is required'),
  body('contactName')
    .optional()
    .trim(),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('phone')
    .optional()
    .trim(),
  body('address')
    .optional()
    .trim(),
  body('status')
    .optional()
    .trim()
    .isIn(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'CLOSED'])
    .withMessage('Status must be NEW, CONTACTED, QUALIFIED, PROPOSAL, or CLOSED'),
];

const updateCustomerValidator = [
  body('companyName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Company name cannot be empty'),
  body('contactName')
    .optional()
    .trim(),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('phone')
    .optional()
    .trim(),
  body('address')
    .optional()
    .trim(),
  body('status')
    .optional()
    .trim()
    .isIn(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'CLOSED'])
    .withMessage('Status must be NEW, CONTACTED, QUALIFIED, PROPOSAL, or CLOSED'),
];

const updateCustomerStatusValidator = [
  body('status')
    .trim()
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'CLOSED'])
    .withMessage('Status must be NEW, CONTACTED, QUALIFIED, PROPOSAL, or CLOSED'),
];

module.exports = {
  createCustomerValidator,
  updateCustomerValidator,
  updateCustomerStatusValidator,
};
