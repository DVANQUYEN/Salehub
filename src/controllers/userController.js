const { prisma } = require('../config/database');
const { apiResponse, hashPassword } = require('../utils/helpers');
const logger = require('../utils/logger');

const userSelect = {
  id: true,
  email: true,
  fullName: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

async function createUser(req, res, next) {
  try {
    const { fullName, email, password, role = 'SALES' } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      const error = new Error('Email already exists');
      error.statusCode = 409;
      return next(error);
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        role,
      },
      select: userSelect,
    });

    logger.info(`User created: ${user.email} (${user.role}) by ${req.user.email}`);
    res.status(201).json(
      apiResponse({
        success: true,
        message: 'User created successfully',
        data: user,
      })
    );
  } catch (error) {
    next(error);
  }
}

async function getAllUsers(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(Math.max(1, parseInt(req.query.limit, 10) || 10), 100);
    const where = {};

    if (req.query.isActive !== undefined) {
      where.isActive = req.query.isActive === 'true';
    } else {
      where.isActive = true;
    }

    if (req.query.role && ['ADMIN', 'SALES', 'CUSTOMER'].includes(req.query.role)) {
      where.role = req.query.role;
    }

    if (req.query.search) {
      const search = req.query.search.trim();
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: userSelect,
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    res.status(200).json(
      apiResponse({
        success: true,
        message: 'Users retrieved',
        data: users,
        meta: { page, limit, total, totalPages },
      })
    );
  } catch (error) {
    next(error);
  }
}

async function getUserById(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: userSelect,
    });

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json(
      apiResponse({
        success: true,
        message: 'User retrieved',
        data: user,
      })
    );
  } catch (error) {
    next(error);
  }
}

async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const { fullName, email, role } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      const error = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }

    if (email && email !== existingUser.email) {
      const duplicate = await prisma.user.findUnique({ where: { email } });
      if (duplicate) {
        const error = new Error('Email already in use');
        error.statusCode = 409;
        return next(error);
      }
    }

    const data = {};
    if (fullName !== undefined) data.fullName = fullName;
    if (email !== undefined) data.email = email;
    if (role !== undefined) data.role = role;

    const user = await prisma.user.update({
      where: { id },
      data,
      select: userSelect,
    });

    logger.info(`User updated: ${user.email} by ${req.user.email}`);
    res.status(200).json(
      apiResponse({
        success: true,
        message: 'User updated',
        data: user,
      })
    );
  } catch (error) {
    next(error);
  }
}

async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;

    if (id === req.user.userId) {
      const error = new Error('Cannot delete your own account');
      error.statusCode = 403;
      return next(error);
    }

    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });

    if (!existingUser) {
      const error = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }

    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    logger.info(`User deleted: ${existingUser.email} by ${req.user.email}`);
    res.status(200).json(
      apiResponse({
        success: true,
        message: 'User deleted successfully',
        data: existingUser,
      })
    );
  } catch (error) {
    next(error);
  }
}

async function toggleUserActive(req, res, next) {
  try {
    const { id } = req.params;

    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: { ...userSelect, password: false },
    });

    if (!existingUser) {
      const error = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }

    const user = await prisma.user.update({
      where: { id },
      data: { isActive: !existingUser.isActive },
      select: userSelect,
    });

    const statusText = user.isActive ? 'activated' : 'deactivated';
    logger.info(`User ${statusText}: ${user.email} by ${req.user.email}`);
    res.status(200).json(
      apiResponse({
        success: true,
        message: `User ${statusText}`,
        data: user,
      })
    );
  } catch (error) {
    next(error);
  }
}

async function resetUserPassword(req, res, next) {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      const error = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }

    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    logger.info(`Password reset for user: ${existingUser.email} by ${req.user.email}`);
    res.status(200).json(
      apiResponse({
        success: true,
        message: 'Password reset successfully',
      })
    );
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserActive,
  resetUserPassword,
};
