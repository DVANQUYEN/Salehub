const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

/**
 * Sanitize user-supplied data to prevent NoSQL injection.
 * Removes keys starting with $ or containing . from req.body, req.query and req.params.
 *
 * Express 5 makes req.query a read-only getter, so we create a writable copy
 * before running the sanitizer to avoid "Cannot set property query" errors.
 */
const mongoSanitizeMiddleware = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    if (req && req.logger && typeof req.logger.warn === 'function') {
      req.logger.warn(`Sanitized potentially malicious key: ${key}`);
    }
  },
});

const sanitizeInput = (req, res, next) => {
  // Express 5 defines req.query as a read-only getter on the prototype.
  // Define a writable own-property copy so express-mongo-sanitize can sanitize it.
  Object.defineProperty(req, 'query', {
    value: { ...req.query },
    writable: true,
    configurable: true,
    enumerable: true,
  });
  mongoSanitizeMiddleware(req, res, next);
};

/**
 * Prevent HTTP Parameter Pollution (HPP).
 * Uses hpp() whitelist for arrays that the API intentionally accepts.
 */
const preventHPP = hpp({
  whitelist: [],
});

module.exports = {
  sanitizeInput,
  preventHPP,
};
