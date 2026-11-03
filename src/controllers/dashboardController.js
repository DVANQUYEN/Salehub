const { prisma } = require('../config/database');
const { apiResponse } = require('../utils/helpers');

const CLOSED_STAGES = ['CLOSED_WON', 'CLOSED_LOST'];

function buildDashboardDealWhere(user) {
  const where = {};

  if (user.role === 'SALES') {
    where.salesRepId = user.userId;
  } else if (user.role === 'CUSTOMER') {
    where.customer = { email: user.email };
  }

  return where;
}

function buildDashboardQuoteWhere(user) {
  const where = {};

  if (user.role === 'SALES') {
    where.deal = { salesRepId: user.userId };
  } else if (user.role === 'CUSTOMER') {
    where.deal = { customer: { email: user.email } };
  }

  return where;
}

function toNumber(value) {
  return value ? Number(value) : 0;
}

function formatMonthLabel(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function getLast12Months() {
  const months = [];
  const now = new Date();
  for (let i = 11; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(formatMonthLabel(d));
  }
  return months;
}

function startOfMonth(date) {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(date) {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

async function getAcceptedQuotesMap(dealWhere) {
  const acceptedQuotes = await prisma.quote.findMany({
    where: {
      status: 'ACCEPTED',
      deal: dealWhere,
    },
    select: {
      dealId: true,
      totalAmount: true,
      createdAt: true,
    },
  });

  return acceptedQuotes.reduce((map, quote) => {
    map[quote.dealId] = quote;
    return map;
  }, {});
}

function computeDealRevenue(deal, acceptedQuotesMap) {
  const acceptedQuote = acceptedQuotesMap[deal.id];
  if (acceptedQuote) {
    return toNumber(acceptedQuote.totalAmount);
  }
  return toNumber(deal.value);
}

async function getOverview(req, res, next) {
  try {
    const { user } = req;
    const dealWhere = buildDashboardDealWhere(user);

    const [
      pipelineCount,
      pipelineValue,
      closedWonDeals,
      totalDealsThisMonth,
      totalCustomers,
      totalDeals,
    ] = await Promise.all([
      prisma.deal.groupBy({
        by: ['stage'],
        where: dealWhere,
        _count: { id: true },
      }),
      prisma.deal.groupBy({
        by: ['stage'],
        where: dealWhere,
        _sum: { value: true },
      }),
      prisma.deal.findMany({
        where: { ...dealWhere, stage: 'CLOSED_WON' },
        select: { id: true, value: true },
      }),
      prisma.deal.count({
        where: {
          ...dealWhere,
          createdAt: { gte: startOfMonth(new Date()), lte: endOfMonth(new Date()) },
        },
      }),
      (async () => {
        if (user.role === 'ADMIN') {
          return prisma.customer.count();
        }
        if (user.role === 'SALES') {
          return prisma.customer.count({
            where: { deals: { some: { salesRepId: user.userId } } },
          });
        }
        const customer = await prisma.customer.findUnique({ where: { email: user.email } });
        return customer ? 1 : 0;
      })(),
      prisma.deal.count({ where: dealWhere }),
    ]);

    const acceptedQuotesMap = await getAcceptedQuotesMap(dealWhere);
    const totalRevenue = closedWonDeals.reduce(
      (sum, deal) => sum + computeDealRevenue(deal, acceptedQuotesMap),
      0
    );

    const wonCount = closedWonDeals.length;
    const conversionRate = totalDeals > 0 ? (wonCount / totalDeals) * 100 : 0;

    const allStages = ['LEAD', 'QUALIFICATION', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'];
    const pipeline = allStages.map((stage) => {
      const countItem = pipelineCount.find((item) => item.stage === stage);
      const valueItem = pipelineValue.find((item) => item.stage === stage);
      return {
        stage,
        count: countItem ? countItem._count.id : 0,
        value: toNumber(valueItem?._sum.value),
      };
    });

    res.status(200).json(
      apiResponse({
        success: true,
        message: 'Dashboard overview retrieved',
        data: {
          pipeline,
          totalRevenue,
          totalDealsThisMonth,
          totalCustomers,
          conversionRate: Number(conversionRate.toFixed(2)),
        },
      })
    );
  } catch (error) {
    next(error);
  }
}

async function getSalesMetrics(req, res, next) {
  try {
    const { user } = req;
    const dealWhere = buildDashboardDealWhere(user);

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const [closedWonDeals, wonLostCounts, acceptedQuotes] = await Promise.all([
      prisma.deal.findMany({
        where: {
          ...dealWhere,
          stage: 'CLOSED_WON',
          createdAt: { gte: twelveMonthsAgo },
        },
        select: { id: true, value: true, createdAt: true },
      }),
      prisma.deal.groupBy({
        by: ['stage'],
        where: { ...dealWhere, stage: { in: ['CLOSED_WON', 'CLOSED_LOST'] } },
        _count: { id: true },
      }),
      prisma.quote.findMany({
        where: {
          status: 'ACCEPTED',
          deal: dealWhere,
          createdAt: { gte: twelveMonthsAgo },
        },
        select: { items: true, totalAmount: true, createdAt: true },
      }),
    ]);

    const acceptedQuotesMap = await getAcceptedQuotesMap(dealWhere);

    const monthlyRevenueMap = {};
    closedWonDeals.forEach((deal) => {
      const acceptedQuote = acceptedQuotesMap[deal.id];
      const month = formatMonthLabel(acceptedQuote ? acceptedQuote.createdAt : deal.createdAt);
      const revenue = computeDealRevenue(deal, acceptedQuotesMap);
      monthlyRevenueMap[month] = (monthlyRevenueMap[month] || 0) + revenue;
    });

    const last12Months = getLast12Months();
    const monthlyRevenue = last12Months.map((month) => ({
      month,
      revenue: monthlyRevenueMap[month] || 0,
    }));

    const productRevenueMap = {};
    acceptedQuotes.forEach((quote) => {
      const items = Array.isArray(quote.items) ? quote.items : [];
      items.forEach((item) => {
        const key = item.productId || item.name || 'Unknown';
        const quantity = Number(item.quantity) || 0;
        const unitPrice = Number(item.unitPrice) || 0;
        const revenue = quantity * unitPrice;
        if (!productRevenueMap[key]) {
          productRevenueMap[key] = {
            productId: item.productId || null,
            name: item.name || 'Unknown',
            revenue: 0,
          };
        }
        productRevenueMap[key].revenue += revenue;
      });
    });

    const topProducts = Object.values(productRevenueMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map((p) => ({ ...p, revenue: Number(p.revenue.toFixed(2)) }));

    const totalRevenue = closedWonDeals.reduce(
      (sum, deal) => sum + computeDealRevenue(deal, acceptedQuotesMap),
      0
    );
    const averageDealSize = closedWonDeals.length > 0 ? totalRevenue / closedWonDeals.length : 0;

    const wonCount = wonLostCounts.find((s) => s.stage === 'CLOSED_WON')?._count.id || 0;
    const lostCount = wonLostCounts.find((s) => s.stage === 'CLOSED_LOST')?._count.id || 0;
    const winRate = wonCount + lostCount > 0 ? (wonCount / (wonCount + lostCount)) * 100 : 0;

    const velocityDeals = await prisma.deal.findMany({
      where: { ...dealWhere, stage: 'CLOSED_WON' },
      select: { createdAt: true, updatedAt: true },
    });

    const pipelineVelocity =
      velocityDeals.length > 0
        ? velocityDeals.reduce((sum, deal) => {
            const days = (deal.updatedAt - deal.createdAt) / (1000 * 60 * 60 * 24);
            return sum + days;
          }, 0) / velocityDeals.length
        : 0;

    res.status(200).json(
      apiResponse({
        success: true,
        message: 'Sales metrics retrieved',
        data: {
          monthlyRevenue,
          topProducts,
          averageDealSize: Number(averageDealSize.toFixed(2)),
          winRate: Number(winRate.toFixed(2)),
          pipelineVelocity: Number(pipelineVelocity.toFixed(2)),
        },
      })
    );
  } catch (error) {
    next(error);
  }
}

async function getPipelineReport(req, res, next) {
  try {
    const { user } = req;
    const dealWhere = buildDashboardDealWhere(user);

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [stageGroups, expectedRevenue, overdueDeals, dealsWithoutActivities] = await Promise.all([
      prisma.deal.groupBy({
        by: ['stage'],
        where: dealWhere,
        _count: { id: true },
        _sum: { value: true },
      }),
      prisma.deal.aggregate({
        where: {
          ...dealWhere,
          expectedCloseDate: { gte: startOfMonth(now), lte: endOfMonth(now) },
          stage: { not: 'CLOSED_LOST' },
        },
        _sum: { value: true },
      }),
      prisma.deal.findMany({
        where: {
          ...dealWhere,
          expectedCloseDate: { lt: now },
          stage: { notIn: CLOSED_STAGES },
        },
        include: {
          customer: { select: { companyName: true } },
          salesRep: { select: { fullName: true } },
        },
        orderBy: { expectedCloseDate: 'asc' },
        take: 50,
      }),
      (async () => {
        const deals = await prisma.deal.findMany({
          where: dealWhere,
          select: {
            id: true,
            title: true,
            stage: true,
            expectedCloseDate: true,
            customer: { select: { companyName: true } },
            salesRep: { select: { fullName: true } },
            activities: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              select: { createdAt: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        });

        return deals.filter((deal) => {
          const latestActivity = deal.activities[0];
          return !latestActivity || new Date(latestActivity.createdAt) < sevenDaysAgo;
        });
      })(),
    ]);

    const pipeline = stageGroups.map((group) => ({
      stage: group.stage,
      count: group._count.id,
      value: toNumber(group._sum.value),
    }));

    res.status(200).json(
      apiResponse({
        success: true,
        message: 'Pipeline report retrieved',
        data: {
          pipeline,
          expectedRevenueThisMonth: toNumber(expectedRevenue._sum.value),
          overdueDeals,
          dealsWithoutActivities,
        },
      })
    );
  } catch (error) {
    next(error);
  }
}

async function getCustomerReport(req, res, next) {
  try {
    const { user } = req;
    const dealWhere = buildDashboardDealWhere(user);

    const [customersByStatus, newCustomersThisMonth, topCustomersByValue, customerWithMostDeals] =
      await Promise.all([
        prisma.customer.groupBy({
          by: ['status'],
          _count: { id: true },
        }),
        prisma.customer.count({
          where: {
            ...dealWhere.customer,
            createdAt: { gte: startOfMonth(new Date()), lte: endOfMonth(new Date()) },
          },
        }),
        prisma.deal.groupBy({
          by: ['customerId'],
          where: dealWhere,
          _sum: { value: true },
          orderBy: { _sum: { value: 'desc' } },
          take: 5,
        }),
        prisma.deal.groupBy({
          by: ['customerId'],
          where: dealWhere,
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 1,
        }),
      ]);

    const customerIds = [
      ...topCustomersByValue.map((c) => c.customerId),
      ...customerWithMostDeals.map((c) => c.customerId),
    ];

    const customers = await prisma.customer.findMany({
      where: { id: { in: customerIds } },
      select: { id: true, companyName: true, status: true },
    });

    const customerMap = customers.reduce((map, customer) => {
      map[customer.id] = customer;
      return map;
    }, {});

    const topCustomers = topCustomersByValue.map((item) => ({
      customer: customerMap[item.customerId],
      totalDealValue: toNumber(item._sum.value),
    }));

    const mostDealsCustomer = customerWithMostDeals[0]
      ? {
          customer: customerMap[customerWithMostDeals[0].customerId],
          dealCount: customerWithMostDeals[0]._count.id,
        }
      : null;

    const customersByStatusFormatted = customersByStatus.map((item) => ({
      status: item.status,
      count: item._count.id,
    }));

    res.status(200).json(
      apiResponse({
        success: true,
        message: 'Customer report retrieved',
        data: {
          customersByStatus: customersByStatusFormatted,
          newCustomersThisMonth,
          topCustomers,
          customerWithMostDeals: mostDealsCustomer,
        },
      })
    );
  } catch (error) {
    next(error);
  }
}

async function getSalesRepPerformance(req, res, next) {
  try {
    const { user } = req;

    if (user.role !== 'ADMIN') {
      const error = new Error('Forbidden: admin access required');
      error.statusCode = 403;
      return next(error);
    }

    const [salesReps, allDeals, acceptedQuotes] = await Promise.all([
      prisma.user.findMany({
        where: { role: 'SALES' },
        select: { id: true, fullName: true, email: true },
      }),
      prisma.deal.findMany({
        where: { salesRep: { role: 'SALES' } },
        select: { id: true, salesRepId: true, stage: true, value: true },
      }),
      prisma.quote.findMany({
        where: { status: 'ACCEPTED' },
        select: { dealId: true, totalAmount: true },
      }),
    ]);

    const acceptedQuotesMap = acceptedQuotes.reduce((map, quote) => {
      map[quote.dealId] = quote;
      return map;
    }, {});

    const dealsByRep = {};
    allDeals.forEach((deal) => {
      if (!dealsByRep[deal.salesRepId]) {
        dealsByRep[deal.salesRepId] = [];
      }
      dealsByRep[deal.salesRepId].push(deal);
    });

    const performance = salesReps.map((rep) => {
      const repDeals = dealsByRep[rep.id] || [];
      const totalDeals = repDeals.length;
      const wonDeals = repDeals.filter((d) => d.stage === 'CLOSED_WON');
      const lostDeals = repDeals.filter((d) => d.stage === 'CLOSED_LOST');
      const totalRevenue = wonDeals.reduce(
        (sum, deal) => sum + computeDealRevenue(deal, acceptedQuotesMap),
        0
      );
      const conversionRate =
        wonDeals.length + lostDeals.length > 0
          ? (wonDeals.length / (wonDeals.length + lostDeals.length)) * 100
          : 0;
      const averageDealSize = wonDeals.length > 0 ? totalRevenue / wonDeals.length : 0;

      return {
        salesRep: rep,
        totalDeals,
        wonDeals: wonDeals.length,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        conversionRate: Number(conversionRate.toFixed(2)),
        averageDealSize: Number(averageDealSize.toFixed(2)),
      };
    });

    performance.sort((a, b) => b.totalRevenue - a.totalRevenue);

    res.status(200).json(
      apiResponse({
        success: true,
        message: 'Sales rep performance retrieved',
        data: performance,
      })
    );
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getOverview,
  getSalesMetrics,
  getPipelineReport,
  getCustomerReport,
  getSalesRepPerformance,
};
