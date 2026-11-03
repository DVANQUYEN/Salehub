const { validationResult } = require('express-validator');

/**
 * Middleware to validate request using express-validator rules.
 * Must be placed after the validation rules in the route definition.
 */
function validate(schema) {
  return async (req, res, next) => {
    // Run all validations in the schema
    await Promise.all(schema.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Format validation errors
    const extractedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: extractedErrors,
    });
  };
}

module.exports = validate;
