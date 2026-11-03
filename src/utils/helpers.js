const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Hash a plain text password.
 * @param {string} password
 * @returns {Promise<string>} hashed password
 */
async function hashPassword(password) {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compare a plain text password with a stored hash.
 * @param {string} password
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a JWT token for a user.
 * @param {Object} payload
 * @returns {string} JWT token
 */
function generateToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

/**
 * Format API response with consistent shape.
 * @param {Object} options
 * @returns {Object}
 */
function apiResponse({ success = true, message = '', data = null, meta = null }) {
  const response = { success, message };
  if (data !== null) response.data = data;
  if (meta !== null) response.meta = meta;
  return response;
}

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  apiResponse,
};
