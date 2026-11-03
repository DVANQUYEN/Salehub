const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

let io = null;

/**
 * Initialize Socket.IO instance.
 * @param {Server} socketIoInstance
 */
function initialize(socketIoInstance) {
  io = socketIoInstance;

  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.query?.token;

      if (!token) {
        return next(new Error('Authentication error: token required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (error) {
      logger.error(`Socket authentication error: ${error.message}`);
      next(new Error('Authentication error: invalid token'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id} (user: ${socket.user?.userId || 'unknown'})`);

    if (socket.user?.userId) {
      socket.join(`user:${socket.user.userId}`);
      logger.info(`User ${socket.user.userId} joined personal room`);
    }

    if (socket.user?.role === 'ADMIN') {
      socket.join('role:ADMIN');
    }

    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${socket.id} (${reason})`);
    });

    socket.on('error', (error) => {
      logger.error(`Socket error: ${error.message}`);
    });
  });

  logger.info('Socket.IO service initialized');
}

/**
 * Get the Socket.IO instance. Must call initialize first.
 * @returns {Server}
 */
function getIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
}

/**
 * Emit a notification to a specific user.
 * @param {string} userId
 * @param {string} event
 * @param {Object} payload
 */
function notifyUser(socketServer, userId, event, data) {
  socketServer.to(`user:${userId}`).emit(event, data);
}

function notifyAdmins(socketServer, event, data) {
  socketServer.to('role:ADMIN').emit(event, data);
}

function notifyDealOwner(socketServer, deal, event, data) {
  socketServer.to(`user:${deal.salesRepId}`).emit(event, data);
}

function notifyCustomer(socketServer, customerId, event, data) {
  socketServer.to(`user:customer:${customerId}`).emit(event, data);
}

function emitToUser(userId, event, payload) {
  try {
    notifyUser(getIO(), userId, event, payload);
    logger.info(`Emitted ${event} to user ${userId}`);
  } catch (error) {
    logger.error(`Failed to emit ${event} to user ${userId}: ${error.message}`);
  }
}

/**
 * Notify a sales rep that a deal has been assigned to them.
 * @param {string} salesRepId
 * @param {Object} deal
 */
function notifyDealAssigned(salesRepId, deal) {
  emitToUser(salesRepId, 'deal:assigned', {
    type: 'deal:assigned',
    message: `You have been assigned a new deal: ${deal.title}`,
    deal,
  });
}

/**
 * Notify relevant users that a deal stage has changed.
 * @param {string} salesRepId
 * @param {Object} deal
 * @param {string} previousStage
 * @param {string} newStage
 */
function notifyDealStageChanged(salesRepId, deal, previousStage, newStage) {
  emitToUser(salesRepId, 'deal:stageChanged', {
    type: 'deal:stageChanged',
    message: `Deal "${deal.title}" moved from ${previousStage} to ${newStage}`,
    deal,
    previousStage,
    newStage,
  });
}

/**
 * Notify a customer that a quote has been sent to them.
 * @param {string} customerId
 * @param {Object} quote
 */
function notifyQuoteSent(customerId, quote) {
  emitToUser(customerId, 'quote:sent', {
    type: 'quote:sent',
    message: `A new quote has been sent to you`,
    quote,
  });
}

/**
 * Notify relevant users that a quote status has changed.
 * @param {string} userId
 * @param {Object} quote
 * @param {string} previousStatus
 * @param {string} newStatus
 */
function notifyQuoteStatusChanged(userId, quote, previousStatus, newStatus) {
  emitToUser(userId, 'quote:statusChanged', {
    type: 'quote:statusChanged',
    message: `Quote status changed from ${previousStatus} to ${newStatus}`,
    quote,
    previousStatus,
    newStatus,
  });
}

module.exports = {
  initialize,
  getIO,
  notifyUser,
  notifyAdmins,
  notifyDealOwner,
  notifyCustomer,
  emitToUser,
  notifyDealAssigned,
  notifyDealStageChanged,
  notifyQuoteSent,
  notifyQuoteStatusChanged,
};
