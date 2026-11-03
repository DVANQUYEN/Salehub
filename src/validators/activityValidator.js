const { body, param } = require('express-validator');

const createActivityValidator = [
  body('type')
    .trim()
    .notEmpty()
    .withMessage('Activity type is required')
    .isIn(['CALL', 'EMAIL', 'MEETING'])
    .withMessage('Type must be CALL, EMAIL, or MEETING'),
  body('notes')
    .optional()
    .trim(),
];

const activityIdParam = [
  param('id').isUUID().withMessage('Invalid activity ID'),
];

module.exports = {
  createActivityValidator,
  activityIdParam,
};
