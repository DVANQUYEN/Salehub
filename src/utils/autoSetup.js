const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function runMigrations() {
  try {
    console.log('Running database migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('Migrations completed successfully');
    return true;
  } catch (error) {
    console.error('Migration failed:', error.message);
    return false;
  }
}

async function checkAndSeed() {
  try {
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      console.log('Database is empty, running seed...');
      execSync('npx prisma db seed', { stdio: 'inherit' });
      console.log('Seed completed successfully');
      return true;
    }
    console.log('Database already has data, skipping seed');
    return false;
  } catch (error) {
    console.error('Seed failed:', error.message);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

async function autoSetup() {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  console.log('Starting auto-setup for production...');
  const migrationOk = await runMigrations();
  if (!migrationOk) {
    throw new Error('Database migration failed');
  }
  await checkAndSeed();
  console.log('Auto-setup completed');
}

module.exports = { autoSetup };
