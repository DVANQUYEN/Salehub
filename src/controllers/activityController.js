const { prisma } = require('../config/database');
const { apiResponse } = require('../utils/helpers');
const logger = require('../utils/logger');

const activitySelect = {
  id: true,
  dealId: true,
  type: true,
  notes: true,
  createdAt: true,
};

async function checkDealAccess(dealId, user) {
  const { role, email, userId } = user;

  const deal = await prisma.deal.findUnique({
    where: { id: dealId },
    include: { customer: true },
  });

  if (!deal) {
    const error = new Error('Deal not found');
    error.statusCode = 404;
    throw error;
  }

  if (role === 'SALES' && deal.salesRepId !== userId) {
    const error = new Error('Forbidden: cannot access this deal');
    error.statusCode = 403;
    throw error;
  }

  if (role === 'CUSTOMER' && deal.customer.email !== email) {
    const error = new Error('Forbidden: cannot access this deal');
    error.statusCode = 403;
    throw error;
  }

  return deal;
}

async function getActivitiesByDeal(req, res, next) {
  try {
    const { dealId } = req.params;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(Math.max(1, parseInt(req.query.limit, 10) || 10), 100);

    await checkDealAccess(dealId, req.user);

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where: { dealId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: activitySelect,
      }),
      prisma.activity.count({ where: { dealId } }),
    ]);

    const totalPages = Math.ceil(total / limit);
    res.status(200).json(
      apiResponse({
        success: true,
        message: 'Activities retrieved',
        data: activities,
        meta: { page, limit, total, totalPages },
      })
    );
  } catch (error) {
    next(error);
  }
}

async function createActivity(req, res, next) {
  try {
    const { dealId } = req.params;
    const { type, notes } = req.body;

    await checkDealAccess(dealId, req.user);

    const data = {
      dealId,
      type,
    };
    if (notes !== undefined) data.notes = notes;

    const activity = await prisma.activity.create({
      data,
      select: activitySelect,
    });

    logger.info(`Activity created: ${activity.type} for deal ${dealId} by ${req.user.email}`);
    res.status(201).json(
      apiResponse({
        success: true,
        message: 'Activity created',
        data: activity,
      })
    );
  } catch (error) {
    next(error);
  }
}

async function deleteActivity(req, res, next) {
  try {
    const { id } = req.params;
    const { role, userId, email } = req.user;

    const existingActivity = await prisma.activity.findUnique({
      where: { id },
      include: { deal: true },
    });

    if (!existingActivity) {
      const error = new Error('Activity not found');
      error.statusCode = 404;
      return next(error);
    }

    if (role !== 'ADMIN' && existingActivity.deal.salesRepId !== userId) {
      const error = new Error('Forbidden: cannot delete this activity');
      error.statusCode = 403;
      return next(error);
    }

    await prisma.activity.delete({ where: { id } });

    logger.info(`Activity deleted: ${existingActivity.type} by ${email}`);
    res.status(200).json(
      apiResponse({
        success: true,
        message: 'Activity deleted',
        data: existingActivity,
      })
    );
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getActivitiesByDeal,
  createActivity,
  deleteActivity,
};
