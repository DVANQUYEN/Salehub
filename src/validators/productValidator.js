const { body } = require('express-validator');

const createProductValidator = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('description').optional().trim(),
  body('category').optional().trim(),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ gt: 0 })
    .withMessage('Price must be a positive number')
    .toFloat(),
  body('specifications')
    .optional()
    .isObject()
    .withMessage('Specifications must be an object'),
];

const updateProductValidator = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Product name cannot be empty'),
  body('description').optional().trim(),
  body('category').optional().trim(),
  body('price')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Price must be a positive number')
    .toFloat(),
  body('specifications')
    .optional()
    .isObject()
    .withMessage('Specifications must be an object'),
];

module.exports = {
  createProductValidator,
  updateProductValidator,
};
