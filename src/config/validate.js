const logger = require('../utils/logger');

function validateConfig() {
  const errors = [];
  const isProduction = process.env.NODE_ENV === 'production';

  if (!process.env.DATABASE_URL) {
    errors.push('DATABASE_URL is required');
  }

  if (!process.env.JWT_SECRET) {
    errors.push('JWT_SECRET is required');
  } else if (process.env.JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters');
  } else if (process.env.JWT_SECRET === 'your-super-secret-jwt-key-change-this') {
    if (isProduction) {
      errors.push('JWT_SECRET must not be the default value in production');
    } else {
      logger.warn('⚠️  Using default JWT_SECRET - change this in production!');
    }
  }

  if (isProduction) {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
      logger.warn('⚠️  SMTP not configured - emails will not be sent');
    }
  }

  if (errors.length > 0) {
    throw new Error(`Configuration errors:\n${errors.join('\n')}`);
  }

  logger.info(`✅ Environment validated - Running in ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'} mode`);
}

module.exports = { validateConfig };
