const { prisma } = require('../config/database');
const { apiResponse } = require('../utils/helpers');
const logger = require('../utils/logger');

const customerSelect = {
  id: true,
  companyName: true,
  contactName: true,
  email: true,
  phone: true,
  address: true,
  status: true,
  createdAt: true,
  updatedAt: true,
};

async function getAllCustomers(req, res, next) {
  try {
    const { role, email, userId } = req.user;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(Math.max(1, parseInt(req.query.limit, 10) || 10), 100);
    const where = { deletedAt: null };
    const conditions = [];

    if (role === 'CUSTOMER') {
      conditions.push({ email });
    }

    if (req.query.status && ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'CLOSED'].includes(req.query.status)) {
      conditions.push({ status: req.query.status });
    }

    if (req.query.search) {
      const searchTerm = req.query.search;
      conditions.push({
        OR: [
          { companyName: { contains: searchTerm, mode: 'insensitive' } },
          { contactName: { contains: searchTerm, mode: 'insensitive' } },
        ],
      });
    }

    if (conditions.length > 0) {
      where.AND = conditions;
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          ...customerSelect,
          _count: { select: { deals: true } },
        },
      }),
      prisma.customer.count({ where }),
    ]);

    const data = customers.map((customer) => ({
      ...customer,
      dealCount: customer._count.deals,
      _count: undefined,
    }));

    const totalPages = Math.ceil(total / limit);
    res.status(200).json(
      apiResponse({
        success: true,
        message: 'Customers retrieved',
        data,
        meta: { page, limit, total, totalPages },
      })
    );
  } catch (error) {
    next(error);
  }
}

async function getCustomerById(req, res, next) {
  try {
    const { role, email } = req.user;
    const { id } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        deals: {
          orderBy: { createdAt: 'desc' },
          include: {
            activities: {
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    });

    if (!customer) {
      const error = new Error('Customer not found');
      error.statusCode = 404;
      return next(error);
    }

    if (role === 'CUSTOMER' && customer.email !== email) {
      const error = new Error('Forbidden: cannot access this customer');
      error.statusCode = 403;
      return next(error);
    }

    res.status(200).json(
      apiResponse({
        success: true,
        message: 'Customer retrieved',
        data: customer,
      })
    );
  } catch (error) {
    next(error);
  }
}

async function createCustomer(req, res, next) {
  try {
    const { companyName, contactName, email, phone, address, status } = req.body;

    const data = { companyName };
    if (contactName !== undefined) data.contactName = contactName;
    if (email !== undefined) data.email = email;
    if (phone !== undefined) data.phone = phone;
    if (address !== undefined) data.address = address;
    if (status !== undefined) data.status = status;

    const customer = await prisma.customer.create({
      data,
      select: customerSelect,
    });

    logger.info(`Customer created: ${customer.companyName} by ${req.user.email}`);
    res.status(201).json(
      apiResponse({
        success: true,
        message: 'Customer created',
        data: customer,
      })
    );
  } catch (error) {
    next(error);
  }
}

async function updateCustomer(req, res, next) {
  try {
    const { id } = req.params;
    const { companyName, contactName, email, phone, address, status } = req.body;

    const existingCustomer = await prisma.customer.findUnique({ where: { id } });
    if (!existingCustomer) {
      const error = new Error('Customer not found');
      error.statusCode = 404;
      return next(error);
    }

    const data = {};
    if (companyName !== undefined) data.companyName = companyName;
    if (contactName !== undefined) data.contactName = contactName;
    if (email !== undefined) data.email = email;
    if (phone !== undefined) data.phone = phone;
    if (address !== undefined) data.address = address;
    if (status !== undefined) data.status = status;

    const customer = await prisma.customer.update({
      where: { id },
      data,
      select: customerSelect,
    });

    logger.info(`Customer updated: ${customer.companyName} by ${req.user.email}`);
    res.status(200).json(
      apiResponse({
        success: true,
        message: 'Customer updated',
        data: customer,
      })
    );
  } catch (error) {
    next(error);
  }
}

async function updateCustomerStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const existingCustomer = await prisma.customer.findUnique({ where: { id } });
    if (!existingCustomer) {
      const error = new Error('Customer not found');
      error.statusCode = 404;
      return next(error);
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: { status },
      select: customerSelect,
    });

    logger.info(`Customer status updated: ${customer.companyName} -> ${status} by ${req.user.email}`);
    res.status(200).json(
      apiResponse({
        success: true,
        message: 'Customer status updated',
        data: customer,
      })
    );
  } catch (error) {
    next(error);
  }
}

async function deleteCustomer(req, res, next) {
  try {
    const { id } = req.params;

    const existingCustomer = await prisma.customer.findUnique({
      where: { id },
      select: customerSelect,
    });

    if (!existingCustomer) {
      const error = new Error('Customer not found');
      error.statusCode = 404;
      return next(error);
    }

    await prisma.customer.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    logger.info(`Customer deleted: ${existingCustomer.companyName} by ${req.user.email}`);
    res.status(200).json(
      apiResponse({
        success: true,
        message: 'Customer deleted',
        data: existingCustomer,
      })
    );
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  updateCustomerStatus,
  deleteCustomer,
};
