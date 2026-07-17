import prisma from '../config/database.js';

const include = {
  raisedBy: { select: { id: true, fullName: true, email: true } },
  challan: {
    select: {
      id: true,
      challanNumber: true,
      status: true,
      fineAmount: true,
      vehicle: { select: { vehicleNumber: true, ownerId: true } },
    },
  },
};

export const challanDisputeRepository = {
  create: (data) => prisma.challanDispute.create({ data, include }),

  findById: (id) => prisma.challanDispute.findUnique({ where: { id }, include }),

  findPendingByChallan: (challanId) =>
    prisma.challanDispute.findFirst({ where: { challanId, status: 'PENDING' } }),

  findMany: ({ where, skip, take, orderBy }) =>
    prisma.challanDispute.findMany({ where, skip, take, orderBy, include }),

  count: (where) => prisma.challanDispute.count({ where }),

  update: (id, data) => prisma.challanDispute.update({ where: { id }, data, include }),
};

export default challanDisputeRepository;
