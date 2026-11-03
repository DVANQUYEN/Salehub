const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { app } = require('../src/app');
const { prisma } = require('../src/config/database');
const emailService = require('../src/services/emailService');
const socketService = require('../src/services/socketService');
const { welcomeTemplate } = require('../src/templates/emailTemplates');
const { errorHandler } = require('../src/middlewares/errorHandler');

jest.mock('../src/config/database', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    customer: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    deal: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    activity: {
      create: jest.fn(),
    },
    quote: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    file: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
    product: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $disconnect: jest.fn(),
  },
  connectDatabase: jest.fn(),
  disconnectDatabase: jest.fn(),
}));

jest.mock('../src/services/emailService', () => ({
  sendEmail: jest.fn().mockResolvedValue({ sent: true }),
  sendWelcomeEmail: jest.fn().mockResolvedValue({ sent: true }),
  sendDealAssignedEmail: jest.fn().mockResolvedValue({ sent: true }),
  sendQuoteEmail: jest.fn().mockResolvedValue({ sent: true }),
  sendDealStageChangeEmail: jest.fn().mockResolvedValue({ sent: true }),
  sendPasswordResetEmail: jest.fn().mockResolvedValue({ sent: true }),
}));

function generateToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
}

describe('App Health Check', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /health should return API status', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('SalesHub API is running');
  });

  it('GET /api should return 404 for unknown routes', async () => {
    const res = await request(app).get('/api');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe('Auth Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /api/auth/register should create a new user', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.count.mockResolvedValue(0);
    prisma.user.create.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      fullName: 'Test User',
      role: 'SALES',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const res = await request(app).post('/api/auth/register').send({
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'ADMIN',
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('User registered successfully');
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('test@example.com');
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ role: 'SALES' }),
      })
    );
  });

  it('POST /api/auth/login should return a token for valid credentials', async () => {
    const plainPassword = 'password123';
    const hashedPassword = await bcrypt.hash(plainPassword, 12);

    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      fullName: 'Test User',
      role: 'SALES',
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: plainPassword,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Login successful');
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe('test@example.com');
  });

  it('POST /api/auth/login should reject invalid credentials', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const res = await request(app).post('/api/auth/login').send({
      email: 'unknown@example.com',
      password: 'password123',
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe('Product Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function authHeader(role = 'SALES') {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      role,
    });
    return `Bearer ${generateToken({ userId: 'user-1', email: 'test@example.com', role })}`;
  }

  it('GET /api/products should list products for authenticated users', async () => {
    prisma.product.findMany.mockResolvedValue([
      {
        id: 'prod-1',
        name: 'Cloud Infrastructure',
        description: 'Scalable cloud solutions',
        category: 'Cloud',
        price: 5000,
        specifications: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);
    prisma.product.count.mockResolvedValue(1);

    const res = await request(app)
      .get('/api/products?limit=1000')
      .set('Authorization', authHeader());

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Products retrieved');
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe('Cloud Infrastructure');
    expect(res.body.meta.total).toBe(1);
    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 100 })
    );
  });

  it('GET /api/products should reject unauthenticated requests', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe('Security regressions', () => {
  const userId = '11111111-1111-4111-8111-111111111111';
  const dealId = '22222222-2222-4222-8222-222222222222';
  const quoteId = '33333333-3333-4333-8333-333333333333';
  const fileId = '44444444-4444-4444-8444-444444444444';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  function authHeader(role = 'SALES') {
    prisma.user.findUnique.mockResolvedValue({
      id: userId,
      email: 'sales@example.com',
      role,
      isActive: true,
    });
    return `Bearer ${generateToken({ userId, email: 'sales@example.com', role })}`;
  }

  it('requires authentication before accessing admin user routes', async () => {
    const res = await request(app).post('/api/users/seed-admin');
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('does not serve uploaded files as public static content', async () => {
    const res = await request(app).get('/uploads/avatars');
    expect(res.statusCode).toBe(404);
  });

  it('rejects activity creation on another sales rep deal', async () => {
    prisma.deal.findUnique.mockResolvedValue({
      id: dealId,
      salesRepId: 'another-user',
      customer: { email: 'customer@example.com' },
    });
    prisma.activity.create.mockResolvedValue({ id: 'activity-1' });

    const res = await request(app)
      .post(`/api/deals/${dealId}/activities`)
      .set('Authorization', authHeader())
      .send({ type: 'CALL', notes: 'Unauthorized attempt' });

    expect(res.statusCode).toBe(403);
    expect(prisma.activity.create).not.toHaveBeenCalled();
  });

  it('soft deletes a deal instead of removing its record', async () => {
    prisma.deal.findUnique.mockResolvedValue({
      id: dealId,
      salesRepId: userId,
      title: 'Owned deal',
    });
    prisma.deal.update.mockResolvedValue({ id: dealId, deletedAt: new Date() });

    const res = await request(app)
      .delete(`/api/deals/${dealId}`)
      .set('Authorization', authHeader());

    expect(res.statusCode).toBe(200);
    expect(prisma.deal.update).toHaveBeenCalledWith({
      where: { id: dealId },
      data: { deletedAt: expect.any(Date) },
    });
    expect(prisma.deal.delete).not.toHaveBeenCalled();
  });

  it('creates a DRAFT quote without sending notifications and persists its number', async () => {
    prisma.deal.findUnique.mockResolvedValue({
      id: dealId,
      salesRepId: userId,
      customer: { email: 'customer@example.com' },
    });
    prisma.quote.create.mockImplementation(({ data }) => Promise.resolve({
      id: quoteId,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
      deal: {
        id: dealId,
        customer: { email: 'customer@example.com' },
        salesRep: { fullName: 'Sales User' },
      },
    }));
    const quoteSentSpy = jest.spyOn(socketService, 'notifyQuoteSent').mockImplementation(() => {});

    const res = await request(app)
      .post('/api/quotes')
      .set('Authorization', authHeader())
      .send({
        dealId,
        items: [{ name: 'Laptop', quantity: 1, unitPrice: 1000 }],
      });

    expect(res.statusCode).toBe(201);
    const createData = prisma.quote.create.mock.calls[0][0].data;
    expect(createData.status).toBe('DRAFT');
    expect(createData.quoteNumber).toBeDefined();
    expect(res.body.data.quoteNumber).toBe(createData.quoteNumber);
    expect(emailService.sendQuoteEmail).not.toHaveBeenCalled();
    expect(quoteSentSpy).not.toHaveBeenCalled();
  });

  it('rejects quote status changes through the general update route', async () => {
    const res = await request(app)
      .put(`/api/quotes/${quoteId}`)
      .set('Authorization', authHeader())
      .send({ status: 'SENT' });

    expect(res.statusCode).toBe(400);
    expect(prisma.quote.update).not.toHaveBeenCalled();
  });

  it('sends quote notifications only when the status route transitions to SENT', async () => {
    const existingQuote = {
      id: quoteId,
      dealId,
      status: 'DRAFT',
      deal: {
        salesRepId: userId,
        customer: { email: 'customer@example.com' },
      },
    };
    const sentQuote = {
      ...existingQuote,
      quoteNumber: 'Q-20261102-1234',
      items: [],
      totalAmount: 1000,
      status: 'SENT',
      validUntil: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deal: {
        id: dealId,
        salesRepId: userId,
        customer: {
          id: 'customer-1',
          email: 'customer@example.com',
          companyName: 'Customer Co',
          contactName: 'Customer',
        },
      },
    };
    prisma.quote.findUnique.mockResolvedValue(existingQuote);
    prisma.quote.update.mockResolvedValue(sentQuote);
    prisma.$transaction.mockResolvedValue([sentQuote]);
    prisma.user.findUnique
      .mockResolvedValueOnce({ id: userId, email: 'sales@example.com', role: 'SALES', isActive: true })
      .mockResolvedValueOnce({ id: 'customer-user-1', email: 'customer@example.com' });
    const quoteSentSpy = jest.spyOn(socketService, 'notifyQuoteSent').mockImplementation(() => {});

    const res = await request(app)
      .put(`/api/quotes/${quoteId}/status`)
      .set('Authorization', `Bearer ${generateToken({ userId, email: 'sales@example.com', role: 'SALES' })}`)
      .send({ status: 'SENT' });

    expect(res.statusCode).toBe(200);
    expect(emailService.sendQuoteEmail).toHaveBeenCalledTimes(1);
    expect(quoteSentSpy).toHaveBeenCalledWith('customer-user-1', sentQuote);
    expect(quoteSentSpy).toHaveBeenCalledWith(userId, sentQuote);
  });

  it('requires file ownership before downloading a file', async () => {
    prisma.file.findUnique.mockResolvedValue({
      id: fileId,
      uploadedBy: 'another-user',
      path: './uploads/private.pdf',
    });

    const res = await request(app)
      .get(`/api/files/${fileId}/download`)
      .set('Authorization', authHeader());

    expect(res.statusCode).toBe(403);
  });

  it('escapes user-controlled values in email HTML', () => {
    const html = welcomeTemplate('<img src=x onerror=alert(1)>');
    expect(html).not.toContain('<img src=x onerror=alert(1)>');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
  });
});
