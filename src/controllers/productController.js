const { prisma } = require('../config/database');
const { apiResponse } = require('../utils/helpers');
const logger = require('../utils/logger');

const productSelect = {
  id: true,
  name: true,
  description: true,
  category: true,
  price: true,
  specifications: true,
  createdAt: true,
  updatedAt: true,
};

async function getAllProducts(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(Math.max(1, parseInt(req.query.limit, 10) || 10), 100);
    const where = {};
    const conditions = [];

    if (req.query.search) {
      conditions.push({
        name: { contains: req.query.search, mode: 'insensitive' },
      });
    }

    if (req.query.category) {
      conditions.push({ category: req.query.category });
    }

    if (conditions.length > 0) {
      where.AND = conditions;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: productSelect,
      }),
      prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    res.status(200).json(
      apiResponse({
        success: true,
        message: 'Products retrieved',
        data: products,
        meta: { page, limit, total, totalPages },
      })
    );
  } catch (error) {
    next(error);
  }
}

async function getProductById(req, res, next) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      select: productSelect,
    });

    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json(
      apiResponse({
        success: true,
        message: 'Product retrieved',
        data: product,
      })
    );
  } catch (error) {
    next(error);
  }
}

async function createProduct(req, res, next) {
  try {
    const { name, description, category, price, specifications } = req.body;

    const data = {
      name,
      price,
      specifications: specifications || {},
    };

    if (description !== undefined) data.description = description;
    if (category !== undefined) data.category = category;

    const product = await prisma.product.create({
      data,
      select: productSelect,
    });

    logger.info(`Product created: ${product.name} by ${req.user.email}`);
    res.status(201).json(
      apiResponse({
        success: true,
        message: 'Product created',
        data: product,
      })
    );
  } catch (error) {
    next(error);
  }
}

async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description, category, price, specifications } = req.body;

    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      return next(error);
    }

    const data = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (category !== undefined) data.category = category;
    if (price !== undefined) data.price = price;
    if (specifications !== undefined) data.specifications = specifications;

    const product = await prisma.product.update({
      where: { id },
      data,
      select: productSelect,
    });

    logger.info(`Product updated: ${product.name} by ${req.user.email}`);
    res.status(200).json(
      apiResponse({
        success: true,
        message: 'Product updated',
        data: product,
      })
    );
  } catch (error) {
    next(error);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      select: productSelect,
    });

    if (!existingProduct) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      return next(error);
    }

    await prisma.product.delete({ where: { id } });

    logger.info(`Product deleted: ${existingProduct.name} by ${req.user.email}`);
    res.status(200).json(
      apiResponse({
        success: true,
        message: 'Product deleted',
        data: existingProduct,
      })
    );
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
