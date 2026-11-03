require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../src/utils/helpers');

const prisma = new PrismaClient();

async function main() {
  const isDevelopment = (process.env.NODE_ENV || 'development') === 'development';
  const password = process.env.ADMIN_PASSWORD || (isDevelopment ? 'Admin@123' : null);

  if (!password) {
    throw new Error('ADMIN_PASSWORD must be set when seeding an admin outside development');
  }
  if (password.length < 8) {
    throw new Error('ADMIN_PASSWORD must be at least 8 characters');
  }

  const email = process.env.ADMIN_EMAIL || 'admin@salehub.com';
  const fullName = process.env.ADMIN_FULL_NAME || 'System Admin';

  const existingAdmin = await prisma.user.findUnique({ where: { email } });
  if (existingAdmin) {
    console.log(`Admin already exists: ${email}`);
    return;
  }

  const admin = await prisma.user.create({
    data: {
      fullName,
      email,
      password: await hashPassword(password),
      role: 'ADMIN',
    },
    select: { id: true, email: true, role: true },
  });

  console.log(`Admin seeded successfully: ${admin.email}`);
}

main()
  .catch((error) => {
    console.error(`Admin seed failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
