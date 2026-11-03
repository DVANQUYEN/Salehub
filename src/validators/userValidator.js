const { param, body } = require('express-validator');

const userIdParam = [
  param('id').isUUID().withMessage('Invalid user ID'),
];

const createUserValidator = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2 })
    .withMessage('Full name must be at least 2 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .trim()
    .isIn(['ADMIN', 'SALES', 'CUSTOMER'])
    .withMessage('Role must be ADMIN, SALES, or CUSTOMER'),
];

const updateUserValidator = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Full name must be at least 2 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('role')
    .optional()
    .trim()
    .isIn(['ADMIN', 'SALES', 'CUSTOMER'])
    .withMessage('Role must be ADMIN, SALES, or CUSTOMER'),
];

const resetPasswordValidator = [
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters'),
];

module.exports = {
  userIdParam,
  createUserValidator,
  updateUserValidator,
  resetPasswordValidator,
};
