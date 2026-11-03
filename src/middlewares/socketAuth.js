const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

/**
 * Socket.IO authentication middleware.
 * Verifies the JWT token from the socket handshake and attaches user info.
 */
function socketAuth(socket, next) {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.query?.token ||
      socket.handshake.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      logger.warn('Socket connection rejected: missing token');
      return next(new Error('Authentication error: missing token'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (error) {
    logger.error(`Socket authentication error: ${error.message}`);
    next(new Error('Authentication error: invalid token'));
  }
}

module.exports = socketAuth;
