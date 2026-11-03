const logger = require('../utils/logger');

/**
 * Middleware to log incoming requests and their responses.
 * Logs method, URL, status code and response time.
 */
function requestLogger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const method = req.method;
    const url = req.originalUrl || req.url;
    const statusCode = res.statusCode;
    const message = `${method} ${url} ${statusCode} - ${duration}ms`;

    if (statusCode >= 400) {
      logger.warn(message);
    } else if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      logger.info(message);
    }
    // TODO: To re-enable GET request logging for debugging, uncomment below:
    // else { logger.info(message); }
  });

  next();
}

module.exports = requestLogger;
