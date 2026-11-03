const { body } = require('express-validator');

const createDealValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Deal title is required'),
  body('customerId')
    .trim()
    .notEmpty()
    .withMessage('Customer ID is required')
    .isUUID()
    .withMessage('Customer ID must be a valid UUID'),
  body('value')
    .notEmpty()
    .withMessage('Deal value is required')
    .isFloat({ gt: 0 })
    .withMessage('Deal value must be a positive number')
    .toFloat(),
  body('probability')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Probability must be between 0 and 100')
    .toInt(),
  body('expectedCloseDate')
    .optional()
    .isISO8601()
    .withMessage('Expected close date must be a valid ISO date'),
  body('stage')
    .optional()
    .trim()
    .isIn(['LEAD', 'QUALIFICATION', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'])
    .withMessage('Stage must be LEAD, QUALIFICATION, PROPOSAL, NEGOTIATION, CLOSED_WON, or CLOSED_LOST'),
];

const updateDealValidator = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Deal title cannot be empty'),
  body('customerId')
    .optional()
    .trim()
    .isUUID()
    .withMessage('Customer ID must be a valid UUID'),
  body('value')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Deal value must be a positive number')
    .toFloat(),
  body('probability')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Probability must be between 0 and 100')
    .toInt(),
  body('expectedCloseDate')
    .optional()
    .isISO8601()
    .withMessage('Expected close date must be a valid ISO date'),
  body('stage')
    .optional()
    .trim()
    .isIn(['LEAD', 'QUALIFICATION', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'])
    .withMessage('Stage must be LEAD, QUALIFICATION, PROPOSAL, NEGOTIATION, CLOSED_WON, or CLOSED_LOST'),
];

const updateDealStageValidator = [
  body('stage')
    .trim()
    .notEmpty()
    .withMessage('Stage is required')
    .isIn(['LEAD', 'QUALIFICATION', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'])
    .withMessage('Stage must be LEAD, QUALIFICATION, PROPOSAL, NEGOTIATION, CLOSED_WON, or CLOSED_LOST'),
];

module.exports = {
  createDealValidator,
  updateDealValidator,
  updateDealStageValidator,
};
