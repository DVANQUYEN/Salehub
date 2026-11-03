const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Middleware to protect routes with JWT authentication.
 * Expects Authorization: Bearer <token> header.
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized: missing token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verify the user still exists in the database
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user || user.isActive === false) {
      return res.status(401).json({ success: false, message: 'Unauthorized: user not found or inactive' });
    }

    req.user = { userId: user.id, email: user.email, role: user.role };
    next();
  } catch (error) {
    logger.error(`Authentication error: ${error.message}`);
    return res.status(401).json({ success: false, message: 'Unauthorized: invalid token' });
  }
}

/**
 * Middleware factory to restrict routes to specific roles.
 * @param  {...string} allowedRoles
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden: insufficient permissions' });
    }

    next();
  };
}

module.exports = {
  authenticate,
  authorize,
};
