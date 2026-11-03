const { prisma } = require('../config/database');
const { apiResponse } = require('../utils/helpers');
const logger = require('../utils/logger');
const emailService = require('../services/emailService');
const socketService = require('../services/socketService');

const dealSelect = {
  id: true,
  title: true,
  customerId: true,
  salesRepId: true,
  stage: true,
  value: true,
  probability: true,
  expectedCloseDate: true,
  createdAt: true,
  updatedAt: true,
};

function buildDealWhere(req) {
  const { role, email, userId } = req.user;
  const where = { deletedAt: null };
  const conditions = [];

  if (role === 'SALES') {
    conditions.push({ salesRepId: userId });
  } else if (role === 'CUSTOMER') {
    conditions.push({ customer: { email } });
  }

  if (req.query.stage && ['LEAD', 'QUALIFICATION', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'].includes(req.query.stage)) {
    conditions.push({ stage: req.query.stage });
  }

  if (req.query.customerId) {
    conditions.push({ customerId: req.query.customerId });
  }

  if (req.query.salesRepId) {
    conditions.push({ salesRepId: req.query.salesRepId });
  }

  if (conditions.length > 0) {
    where.AND = conditions;
  }

  return where;
}

async function getAllDeals(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(Math.max(1, parseInt(req.query.limit, 10) || 10), 100);
    const where = buildDealWhere(req);

    const [deals, total] = await Promise.all([
      prisma.deal.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          ...dealSelect,
          customer: {
            select: { companyName: true },
          },
          salesRep: {
            select: { fullName: true },
          },
        },
      }),
      prisma.deal.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    res.status(200).json(
      apiResponse({
        success: true,
        message: 'Deals retrieved',
        data: deals,
        meta: { page, limit, total, totalPages },
      })
    );
  } catch (error) {
    next(error);
  }
}

async function getDealById(req, res, next) {
  try {
    const { role, email, userId } = req.user;
    const { id } = req.params;

    const deal = await prisma.deal.findUnique({
      where: { id },
      include: {
        customer: true,
        salesRep: {
          select: { id: true, fullName: true, email: true, role: true },
        },
        quotes: {
          orderBy: { createdAt: 'desc' },
        },
        activities: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!deal) {
      const error = new Error('Deal not found');
      error.statusCode = 404;
      return next(error);
    }

    if (role === 'SALES' && deal.salesRepId !== userId) {
      const error = new Error('Forbidden: cannot access this deal');
      error.statusCode = 403;
      return next(error);
    }

    if (role === 'CUSTOMER' && deal.customer.email !== email) {
      const error = new Error('Forbidden: cannot access this deal');
      error.statusCode = 403;
      return next(error);
    }

    res.status(200).json(
      apiResponse({
        success: true,
        message: 'Deal retrieved',
        data: deal,
      })
    );
  } catch (error) {
    next(error);
  }
}

async function createDeal(req, res, next) {
  try {
    const { title, customerId, value, probability, expectedCloseDate, stage } = req.body;
    const { userId } = req.user;

    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      const error = new Error('Customer not found');
      error.statusCode = 404;
      return next(error);
    }

    const data = {
      title,
      customerId,
      salesRepId: userId,
      value,
    };

    if (probability !== undefined) data.probability = probability;
    if (expectedCloseDate !== undefined) data.expectedCloseDate = new Date(expectedCloseDate);
    if (stage !== undefined) data.stage = stage;

    const deal = await prisma.deal.create({
      data,
      select: {
        ...dealSelect,
        customer: {
          select: { companyName: true },
        },
        salesRep: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });

    try {
      await emailService.sendDealAssignedEmail(deal, deal.salesRep);
    } catch (emailError) {
      logger.error(`Failed to send deal assigned email: ${emailError.message}`);
    }

    try {
      socketService.notifyDealAssigned(deal.salesRepId, deal);
    } catch (socketError) {
      logger.error(`Failed to emit deal assigned notification: ${socketError.message}`);
    }

    logger.info(`Deal created: ${deal.title} by ${req.user.email}`);
    res.status(201).json(
      apiResponse({
        success: true,
        message: 'Deal created',
        data: deal,
      })
    );
  } catch (error) {
    next(error);
  }
}

async function updateDeal(req, res, next) {
  try {
    const { id } = req.params;
    const { title, customerId, value, probability, expectedCloseDate, stage } = req.body;
    const { role, userId } = req.user;

    const existingDeal = await prisma.deal.findUnique({ where: { id } });
    if (!existingDeal) {
      const error = new Error('Deal not found');
      error.statusCode = 404;
      return next(error);
    }

    if (role !== 'ADMIN' && existingDeal.salesRepId !== userId) {
      const error = new Error('Forbidden: cannot update this deal');
      error.statusCode = 403;
      return next(error);
    }

    if (customerId !== undefined) {
      const customer = await prisma.customer.findUnique({ where: { id: customerId } });
      if (!customer) {
        const error = new Error('Customer not found');
        error.statusCode = 404;
        return next(error);
      }
    }

    const data = {};
    if (title !== undefined) data.title = title;
    if (customerId !== undefined) data.customerId = customerId;
    if (value !== undefined) data.value = value;
    if (probability !== undefined) data.probability = probability;
    if (expectedCloseDate !== undefined) data.expectedCloseDate = new Date(expectedCloseDate);
    if (stage !== undefined) data.stage = stage;

    const deal = await prisma.deal.update({
      where: { id },
      data,
      select: {
        ...dealSelect,
        customer: {
          select: { companyName: true },
        },
        salesRep: {
          select: { fullName: true },
        },
      },
    });

    logger.info(`Deal updated: ${deal.title} by ${req.user.email}`);
    res.status(200).json(
      apiResponse({
        success: true,
        message: 'Deal updated',
        data: deal,
      })
    );
  } catch (error) {
    next(error);
  }
}

async function updateDealStage(req, res, next) {
  try {
    const { id } = req.params;
    const { stage } = req.body;
    const { role, userId, email } = req.user;

    const existingDeal = await prisma.deal.findUnique({
      where: { id },
      include: {
        activities: { orderBy: { createdAt: 'desc' }, take: 1 },
        salesRep: { select: { id: true, fullName: true, email: true } },
      },
    });

    if (!existingDeal) {
      const error = new Error('Deal not found');
      error.statusCode = 404;
      return next(error);
    }

    if (role !== 'ADMIN' && existingDeal.salesRepId !== userId) {
      const error = new Error('Forbidden: cannot update this deal');
      error.statusCode = 403;
      return next(error);
    }

    const previousStage = existingDeal.stage;

    const [deal] = await prisma.$transaction([
      prisma.deal.update({
        where: { id },
        data: { stage },
        select: {
          ...dealSelect,
          customer: {
            select: { companyName: true },
          },
          salesRep: {
            select: { id: true, fullName: true, email: true },
          },
        },
      }),
      prisma.activity.create({
        data: {
          dealId: id,
          type: 'MEETING',
          notes: `Stage changed from ${previousStage} to ${stage}`,
        },
      }),
    ]);

    try {
      await emailService.sendDealStageChangeEmail(deal, previousStage, stage);
    } catch (emailError) {
      logger.error(`Failed to send deal stage change email: ${emailError.message}`);
    }

    try {
      socketService.notifyDealStageChanged(deal.salesRepId, deal, previousStage, stage);
    } catch (socketError) {
      logger.error(`Failed to emit deal stage changed notification: ${socketError.message}`);
    }

    logger.info(`Deal stage updated: ${deal.title} -> ${stage} by ${email}`);
    res.status(200).json(
      apiResponse({
        success: true,
        message: 'Deal stage updated',
        data: deal,
      })
    );
  } catch (error) {
    next(error);
  }
}

async function deleteDeal(req, res, next) {
  try {
    const { id } = req.params;
    const { role, userId } = req.user;

    const existingDeal = await prisma.deal.findUnique({
      where: { id },
      select: dealSelect,
    });

    if (!existingDeal) {
      const error = new Error('Deal not found');
      error.statusCode = 404;
      return next(error);
    }

    if (role !== 'ADMIN' && existingDeal.salesRepId !== userId) {
      const error = new Error('Forbidden: cannot delete this deal');
      error.statusCode = 403;
      return next(error);
    }

    await prisma.deal.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    logger.info(`Deal deleted: ${existingDeal.title} by ${req.user.email}`);
    res.status(200).json(
      apiResponse({
        success: true,
        message: 'Deal deleted',
        data: existingDeal,
      })
    );
  } catch (error) {
    next(error);
  }
}

async function getDealsByStage(req, res, next) {
  try {
    const where = buildDealWhere(req);

    const deals = await prisma.deal.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        ...dealSelect,
        customer: {
          select: { companyName: true },
        },
        salesRep: {
          select: { fullName: true },
        },
      },
    });

    const grouped = {
      LEAD: [],
      QUALIFICATION: [],
      PROPOSAL: [],
      NEGOTIATION: [],
      CLOSED_WON: [],
      CLOSED_LOST: [],
    };

    deals.forEach((deal) => {
      grouped[deal.stage].push(deal);
    });

    res.status(200).json(
      apiResponse({
        success: true,
        message: 'Deals grouped by stage',
        data: grouped,
      })
    );
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllDeals,
  getDealById,
  createDeal,
  updateDeal,
  updateDealStage,
  deleteDeal,
  getDealsByStage,
};
