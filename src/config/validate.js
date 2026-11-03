const logger = require('../utils/logger');

function validateConfig() {
  const errors = [];

  if (!process.env.DATABASE_URL) {
    errors.push('DATABASE_URL is required');
  }

  if (!process.env.JWT_SECRET) {
    errors.push('JWT_SECRET is required');
  } else if (process.env.JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters');
  } else if (process.env.JWT_SECRET === 'your-super-secret-jwt-key-change-this') {
    if (process.env.NODE_ENV === 'production') {
      errors.push('JWT_SECRET must not be the default value in production');
    } else {
      logger.warn('Using default JWT_SECRET - change this in production!');
    }
  }

  if (errors.length > 0) {
    throw new Error(`Configuration errors:\n${errors.join('\n')}`);
  }
}

module.exports = { validateConfig };
