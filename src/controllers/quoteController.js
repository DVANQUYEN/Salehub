const { prisma } = require('../config/database');
const { apiResponse } = require('../utils/helpers');
const logger = require('../utils/logger');
const emailService = require('../services/emailService');
const pdfService = require('../services/pdfService');
const socketService = require('../services/socketService');

const quoteSelect = {
  id: true,
  quoteNumber: true,
  dealId: true,
  items: true,
  totalAmount: true,
  status: true,
  validUntil: true,
  createdAt: true,
};

const dealStages = {
  ACCEPTED: 'CLOSED_WON',
  REJECTED: 'CLOSED_LOST',
};

function generateQuoteNumber() {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `Q-${datePart}-${randomPart}`;
}

function calculateTotal(items) {
  return items.reduce((sum, item) => {
    const quantity = Number(item.quantity);
    const unitPrice = Number(item.unitPrice);
    return sum + quantity * unitPrice;
  }, 0);
}

function normalizeQuote(quote) {
  return {
    ...quote,
    totalAmount: quote.totalAmount !== undefined && quote.totalAmount !== null
      ? quote.totalAmount.toString()
      : '0',
  };
}

function normalizeQuotes(quotes) {
  return quotes.map((quote) => normalizeQuote(quote));
}

function buildQuoteWhere(req) {
  const { role, email, userId } = req.user;
  const where = {};
  const conditions = [];

  if (role === 'SALES') {
    conditions.push({ deal: { salesRepId: userId } });
  } else if (role === 'CUSTOMER') {
    conditions.push({ deal: { customer: { email } } });
  }

  if (req.query.status && ['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED'].includes(req.query.status)) {
    conditions.push({ status: req.query.status });
  }

  if (req.query.dealId) {
    conditions.push({ dealId: req.query.dealId });
  }

  if (conditions.length > 0) {
    where.AND = conditions;
  }

  return where;
}

async function checkDealAccess(dealId, user) {
  const deal = await prisma.deal.findUnique({
    where: { id: dealId },
    include: { customer: { select: { email: true } } },
  });

  if (!deal) {
    const error = new Error('Deal not found');
    error.statusCode = 404;
    throw error;
  }

  if (user.role === 'SALES' && deal.salesRepId !== user.userId) {
    const error = new Error('Forbidden: cannot access this deal');
    error.statusCode = 403;
    throw error;
  }

  if (user.role === 'CUSTOMER' && deal.customer.email !== user.email) {
    const error = new Error('Forbidden: cannot access this deal');
    error.statusCode = 403;
    throw error;
  }

  return deal;
}

async function checkQuoteAccess(quote, user) {
  if (user.role === 'ADMIN') return true;
  if (user.role === 'SALES' && quote.deal.salesRepId !== user.userId) {
    const error = new Error('Forbidden: cannot access this quote');
    error.statusCode = 403;
    throw error;
  }
  if (user.role === 'CUSTOMER' && quote.deal.customer.email !== user.email) {
    const error = new Error('Forbidden: cannot access this quote');
    error.statusCode = 403;
    throw error;
  }
  return true;
}

function isValidStatusTransition(currentStatus, newStatus) {
  const transitions = {
    DRAFT: ['SENT', 'REJECTED'],
    SENT: ['ACCEPTED', 'REJECTED', 'EXPIRED'],
  };

  if (currentStatus === newStatus) return true;
  return transitions[currentStatus] && transitions[currentStatus].includes(newStatus);
}

async function getAllQuotes(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(Math.max(1, parseInt(req.query.limit, 10) || 10), 100);
    const where = buildQuoteWhere(req);

    const [quotes, total] = await Promise.all([
      prisma.quote.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          ...quoteSelect,
          deal: {
            select: {
              id: true,
              title: true,
              stage: true,
              customer: { select: { companyName: true } },
              salesRep: { select: { fullName: true } },
            },
          },
        },
      }),
      prisma.quote.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    res.status(200).json(
      apiResponse({
        success: true,
        message: 'Quotes retrieved',
        data: normalizeQuotes(quotes),
        meta: { page, limit, total, totalPages },
      })
    );
  } catch (error) {
    next(error);
  }
}

async function getQuoteById(req, res, next) {
  try {
    const { id } = req.params;

    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        deal: {
          include: {
            customer: true,
            salesRep: { select: { id: true, fullName: true, email: true, role: true } },
          },
        },
      },
    });

    if (!quote) {
      const error = new Error('Quote not found');
      error.statusCode = 404;
      return next(error);
    }

    await checkQuoteAccess(quote, req.user);

    res.status(200).json(
      apiResponse({
        success: true,
        message: 'Quote retrieved',
        data: normalizeQuote(quote),
      })
    );
  } catch (error) {
    next(error);
  }
}

async function createQuote(req, res, next) {
  try {
    const { dealId, items, validUntil } = req.body;
    const { userId, role, email } = req.user;

    if (role === 'CUSTOMER') {
      const error = new Error('Forbidden: customers cannot create quotes');
      error.statusCode = 403;
      return next(error);
    }

    await checkDealAccess(dealId, req.user);

    const totalAmount = calculateTotal(items);
    const data = {
      quoteNumber: generateQuoteNumber(),
      dealId,
      items,
      totalAmount,
      status: 'DRAFT',
    };

    if (validUntil !== undefined) {
      data.validUntil = new Date(validUntil);
    } else {
      const defaultValidUntil = new Date();
      defaultValidUntil.setDate(defaultValidUntil.getDate() + 30);
      data.validUntil = defaultValidUntil;
    }

    const quote = await prisma.quote.create({
      data,
      select: {
        ...quoteSelect,
        deal: {
          select: {
            id: true,
            title: true,
            stage: true,
            customer: { select: { id: true, companyName: true, email: true, contactName: true } },
            salesRep: { select: { fullName: true } },
          },
        },
      },
    });

    logger.info(`Quote created: ${quote.id} for deal ${dealId} by ${email}`);
    res.status(201).json(
      apiResponse({
        success: true,
        message: 'Quote created',
        data: normalizeQuote(quote),
      })
    );
  } catch (error) {
    next(error);
  }
}

async function updateQuote(req, res, next) {
  try {
    const { id } = req.params;
    const { items, validUntil } = req.body;
    const { role, userId, email } = req.user;

    if (req.body.status !== undefined) {
      const error = new Error('Quote status must be changed through the status endpoint');
      error.statusCode = 400;
      return next(error);
    }

    if (req.body.totalAmount !== undefined) {
      const error = new Error('Total amount is calculated from items');
      error.statusCode = 400;
      return next(error);
    }

    const existingQuote = await prisma.quote.findUnique({
      where: { id },
      include: {
        deal: {
          include: {
            customer: { select: { id: true, companyName: true, email: true, contactName: true } },
          },
        },
      },
    });

    if (!existingQuote) {
      const error = new Error('Quote not found');
      error.statusCode = 404;
      return next(error);
    }

    if (role !== 'ADMIN' && existingQuote.deal.salesRepId !== userId) {
      const error = new Error('Forbidden: cannot update this quote');
      error.statusCode = 403;
      return next(error);
    }

    if (existingQuote.status !== 'DRAFT' && items !== undefined) {
      const error = new Error('Only draft quote items can be modified');
      error.statusCode = 400;
      return next(error);
    }

    const data = {};
    if (items !== undefined) {
      data.items = items;
      data.totalAmount = calculateTotal(items);
    }
    if (validUntil !== undefined) data.validUntil = new Date(validUntil);

    const quote = await prisma.quote.update({
      where: { id },
      data,
      select: {
        ...quoteSelect,
        deal: {
          select: {
            id: true,
            title: true,
            stage: true,
            salesRepId: true,
            customer: { select: { id: true, companyName: true, email: true, contactName: true } },
            salesRep: { select: { fullName: true } },
          },
        },
      },
    });

    logger.info(`Quote updated: ${quote.id} by ${email}`);
    res.status(200).json(
      apiResponse({
        success: true,
        message: 'Quote updated',
        data: normalizeQuote(quote),
      })
    );
  } catch (error) {
    next(error);
  }
}

async function updateQuoteStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { role, userId, email } = req.user;

    const existingQuote = await prisma.quote.findUnique({
      where: { id },
      include: {
        deal: {
          include: {
            customer: { select: { email: true } },
          },
        },
      },
    });

    if (!existingQuote) {
      const error = new Error('Quote not found');
      error.statusCode = 404;
      return next(error);
    }

    if (role !== 'ADMIN' && existingQuote.deal.salesRepId !== userId) {
      const error = new Error('Forbidden: cannot update this quote');
      error.statusCode = 403;
      return next(error);
    }

    if (!isValidStatusTransition(existingQuote.status, status)) {
      const error = new Error(`Invalid status transition from ${existingQuote.status} to ${status}`);
      error.statusCode = 400;
      return next(error);
    }

    const updateOperations = [
      prisma.quote.update({
        where: { id },
        data: { status },
        select: {
          ...quoteSelect,
          deal: {
            select: {
              id: true,
              title: true,
              stage: true,
              salesRepId: true,
              customer: { select: { id: true, companyName: true, email: true, contactName: true } },
              salesRep: { select: { fullName: true } },
            },
          },
        },
      }),
    ];

    if (dealStages[status] && existingQuote.status !== status) {
      updateOperations.push(
        prisma.deal.update({
          where: { id: existingQuote.dealId },
          data: { stage: dealStages[status] },
        })
      );
    }

    const oldStatus = existingQuote.status;
    const [quote] = await prisma.$transaction(updateOperations);

    if (status === 'SENT' && oldStatus !== 'SENT') {
      try {
        await emailService.sendQuoteEmail(quote, quote.deal.customer);
      } catch (emailError) {
        logger.error(`Failed to send quote email: ${emailError.message}`);
      }

      try {
        const customerUser = quote.deal.customer?.email
          ? await prisma.user.findUnique({ where: { email: quote.deal.customer.email } })
          : null;

        if (customerUser) {
          socketService.notifyQuoteSent(customerUser.id, quote);
        }

        socketService.notifyQuoteSent(userId, quote);
      } catch (socketError) {
        logger.error(`Failed to emit quote sent notification: ${socketError.message}`);
      }
    }

    logger.info(`Quote status updated: ${quote.id} -> ${status} by ${email}`);
    res.status(200).json(
      apiResponse({
        success: true,
        message: 'Quote status updated',
        data: normalizeQuote(quote),
      })
    );
  } catch (error) {
    next(error);
  }
}

async function deleteQuote(req, res, next) {
  try {
    const { id } = req.params;
    const { role } = req.user;

    if (role !== 'ADMIN') {
      const error = new Error('Forbidden: admin access required');
      error.statusCode = 403;
      return next(error);
    }

    const existingQuote = await prisma.quote.findUnique({ where: { id } });
    if (!existingQuote) {
      const error = new Error('Quote not found');
      error.statusCode = 404;
      return next(error);
    }

    if (existingQuote.status !== 'DRAFT') {
      const error = new Error('Only draft quotes can be deleted');
      error.statusCode = 400;
      return next(error);
    }

    const quote = await prisma.quote.delete({ where: { id } });

    logger.info(`Quote deleted: ${quote.id} by ${req.user.email}`);
    res.status(200).json(
      apiResponse({
        success: true,
        message: 'Quote deleted',
        data: normalizeQuote(quote),
      })
    );
  } catch (error) {
    next(error);
  }
}

async function downloadQuotePDF(req, res, next) {
  try {
    const { id } = req.params;

    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        deal: {
          include: {
            customer: true,
            salesRep: { select: { id: true, fullName: true, email: true, role: true } },
          },
        },
      },
    });

    if (!quote) {
      const error = new Error('Quote not found');
      error.statusCode = 404;
      return next(error);
    }

    await checkQuoteAccess(quote, req.user);

    const pdfBuffer = await pdfService.generateQuotePDF(quote);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="quote-${id}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    logger.info(`Quote PDF downloaded: ${id} by ${req.user.email}`);
    res.end(pdfBuffer);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllQuotes,
  getQuoteById,
  createQuote,
  updateQuote,
  updateQuoteStatus,
  deleteQuote,
  downloadQuotePDF,
  generateQuoteNumber,
};
