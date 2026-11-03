const crypto = require('crypto');
const { prisma } = require('../config/database');
const {
  hashPassword,
  comparePassword,
  generateToken,
  apiResponse,
} = require('../utils/helpers');
const logger = require('../utils/logger');
const emailService = require('../services/emailService');

const userSelect = {
  id: true,
  email: true,
  fullName: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

function sanitizeUser(user) {
  const { password, ...rest } = user;
  return rest;
}

async function register(req, res, next) {
  try {
    const { fullName, email, password } = req.body;

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
        role: 'SALES',
      },
      select: userSelect,
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    logger.info(`User registered: ${user.email} (${user.role})`);

    try {
      await emailService.sendWelcomeEmail(user);
    } catch (emailError) {
      logger.error(`Failed to send welcome email to ${user.email}: ${emailError.message}`);
    }

    res.status(201).json(
      apiResponse({
        success: true,
        message: 'User registered successfully',
        data: { token, user },
      })
    );
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.isActive === false) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      return next(error);
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      return next(error);
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    logger.info(`User logged in: ${user.email}`);
    res.status(200).json(
      apiResponse({
        success: true,
        message: 'Login successful',
        data: { token, user: sanitizeUser(user) },
      })
    );
  } catch (error) {
    next(error);
  }
}

async function getMe(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
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
        message: 'Current user retrieved',
        data: user,
      })
    );
  } catch (error) {
    next(error);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(200).json(
        apiResponse({
          success: true,
          message: 'If an account exists, a reset email has been sent',
        })
      );
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry },
    });

    try {
      await emailService.sendPasswordResetEmail(user, resetToken);
      logger.info(`Password reset email sent to ${user.email}`);
    } catch (emailError) {
      logger.error(`Failed to send password reset email to ${user.email}: ${emailError.message}`);
    }

    res.status(200).json(
      apiResponse({
        success: true,
        message: 'If an account exists, a reset email has been sent',
      })
    );
  } catch (error) {
    next(error);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      const error = new Error('Invalid or expired reset token');
      error.statusCode = 400;
      return next(error);
    }

    const hashedPassword = await hashPassword(password);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    logger.info(`Password reset completed for ${user.email}`);
    res.status(200).json(
      apiResponse({
        success: true,
        message: 'Password reset successful',
      })
    );
  } catch (error) {
    next(error);
  }
}

async function changePassword(req, res, next) {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      return next(error);
    }

    const isValid = await comparePassword(oldPassword, user.password);
    if (!isValid) {
      const error = new Error('Incorrect old password');
      error.statusCode = 400;
      return next(error);
    }

    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    logger.info(`Password changed for user: ${user.email}`);
    res.status(200).json(
      apiResponse({
        success: true,
        message: 'Password changed successfully',
      })
    );
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  getMe,
  changePassword,
  forgotPassword,
  resetPassword,
};
