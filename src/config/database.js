const { PrismaClient } = require('@prisma/client');

// Singleton pattern: reuse the same PrismaClient instance across the app
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

/**
 * Gracefully disconnect from the database.
 * Call this when the application shuts down.
 */
async function disconnectDatabase() {
  await prisma.$disconnect();
}

/**
 * Connect to the database.
 * Prisma lazy-connects, but this helper can be used for explicit checks.
 */
async function connectDatabase() {
  await prisma.$connect();
}

module.exports = {
  prisma,
  connectDatabase,
  disconnectDatabase,
};
