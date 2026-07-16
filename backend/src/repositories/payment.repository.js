import prisma from '../config/database.js';

export const paymentRepository = {
  create: (data) => prisma.payment.create({ data, include: { challan: true } }),

  findById: (id) =>
    prisma.payment.findUnique({
      where: { id },
      include: { challan: { include: { vehicle: { include: { owner: true } } } } },
    }),

  findByTransactionId: (transactionId) =>
    prisma.payment.findUnique({ where: { transactionId } }),

  findMany: ({ where, skip, take, orderBy }) =>
    prisma.payment.findMany({
      where,
      skip,
      take,
      orderBy,
      include: { challan: { select: { id: true, challanNumber: true } } },
    }),

  count: (where) => prisma.payment.count({ where }),

  update: (id, data) => prisma.payment.update({ where: { id }, data, include: { challan: true } }),

  sumByStatus: (status) =>
    prisma.payment.aggregate({ where: { status }, _sum: { amount: true } }),

  sumBetween: (start, end) =>
    prisma.payment.aggregate({
      where: { status: 'SUCCESS', paymentDate: { gte: start, lte: end } },
      _sum: { amount: true },
    }),

  monthlyRevenue: (year) => prisma.$queryRaw`
    SELECT EXTRACT(MONTH FROM "payment_date") AS month, SUM(amount) AS total
    FROM payments
    WHERE status = 'SUCCESS' AND EXTRACT(YEAR FROM "payment_date") = ${year}
    GROUP BY month
    ORDER BY month
  `,
};

export default paymentRepository;
