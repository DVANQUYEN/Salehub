require('dotenv').config();

const logger = require('./utils/logger');
const { validateConfig } = require('./config/validate');

try {
  validateConfig();
} catch (err) {
  logger.error(err.message);
  process.exit(1);
}

const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const swaggerUi = require('swagger-ui-express');
const { Server } = require('socket.io');

const swaggerSpecs = require('./config/swagger');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

// Security middlewares
const { sanitizeInput, preventHPP } = require('./middlewares/security');
const requestLogger = require('./middlewares/requestLogger');
const { generalLimiter, authLimiter, apiLimiter } = require('./middlewares/rateLimiter');

const app = express();
app.set('trust proxy', 1);

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
  path: process.env.SOCKET_PATH || '/socket.io',
});

// Initialize Socket.IO service
const socketService = require('./services/socketService');
socketService.initialize(io);

/**
 * Middleware setup
 */
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(compression()); // Compress response bodies
app.use(express.json({ limit: '10mb' })); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies

// Security middlewares
app.use(preventHPP);
app.use(sanitizeInput);
app.use(requestLogger);

// Rate limiting
app.use('/api/auth', authLimiter);
app.use('/api/', apiLimiter);
app.use(generalLimiter);

// Attach io to each request for controller access
app.use((req, res, next) => {
  req.io = io;
  next();
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SalesHub API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

/**
 * Swagger API documentation
 * Available at /api-docs
 */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

/**
 * API routes
 */
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/deals', require('./routes/dealRoutes'));
app.use('/api/activities', require('./routes/activityRoutes'));
app.use('/api/quotes', require('./routes/quoteRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/files', require('./routes/fileRoutes'));

/**
 * 404 handler for unknown routes
 */
app.use(notFoundHandler);

/**
 * Global error handler
 */
app.use(errorHandler);

/**
 * Start the server when this file is run directly (not imported for tests).
 */
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    logger.info(`SalesHub server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

module.exports = { app, server };
