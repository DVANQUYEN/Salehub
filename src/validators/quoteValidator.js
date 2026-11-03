const { body } = require('express-validator');

const quoteStatuses = ['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED'];

function validateItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Items must be a non-empty array');
  }

  items.forEach((item, index) => {
    if (!item || typeof item !== 'object') {
      throw new Error(`Item at index ${index} must be an object`);
    }
    if (!item.productId && !item.name) {
      throw new Error(`Item at index ${index} must have either productId or name`);
    }
    if (item.productId && typeof item.productId !== 'string') {
      throw new Error(`Item at index ${index} productId must be a string`);
    }
    if (item.name && typeof item.name !== 'string') {
      throw new Error(`Item at index ${index} name must be a string`);
    }
    if (typeof item.quantity !== 'number' || item.quantity <= 0) {
      throw new Error(`Item at index ${index} quantity must be greater than 0`);
    }
    if (typeof item.unitPrice !== 'number' || item.unitPrice < 0) {
      throw new Error(`Item at index ${index} unitPrice must be at least 0`);
    }
  });

  return true;
}

const createQuoteValidator = [
  body('dealId')
    .trim()
    .notEmpty()
    .withMessage('Deal ID is required')
    .isUUID()
    .withMessage('Deal ID must be a valid UUID'),
  body('items')
    .notEmpty()
    .withMessage('Items are required')
    .custom(validateItems),
  body('validUntil')
    .optional()
    .isISO8601()
    .withMessage('Valid until must be a valid ISO date'),
];

const updateQuoteValidator = [
  body('items')
    .optional()
    .custom(validateItems),
  body('status')
    .not()
    .exists()
    .withMessage('Quote status must be changed through the status endpoint'),
  body('totalAmount')
    .not()
    .exists()
    .withMessage('Total amount is calculated from items'),
  body('validUntil')
    .optional()
    .isISO8601()
    .withMessage('Valid until must be a valid ISO date'),
];

const updateQuoteStatusValidator = [
  body('status')
    .trim()
    .notEmpty()
    .withMessage('Status is required')
    .isIn(quoteStatuses)
    .withMessage(`Status must be ${quoteStatuses.join(', ')}`),
];

module.exports = {
  createQuoteValidator,
  updateQuoteValidator,
  updateQuoteStatusValidator,
};
