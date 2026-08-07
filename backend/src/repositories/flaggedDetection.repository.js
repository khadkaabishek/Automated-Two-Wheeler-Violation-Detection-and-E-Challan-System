import prisma from '../config/database.js';

const include = {
  submittedBy: { select: { id: true, fullName: true, email: true } },
  challan: { select: { id: true, challanNumber: true } },
};

export const flaggedDetectionRepository = {
  create: (data) => prisma.flaggedDetection.create({ data, include }),

  findById: (id) => prisma.flaggedDetection.findUnique({ where: { id }, include }),

  findMany: ({ where, skip, take, orderBy }) =>
    prisma.flaggedDetection.findMany({ where, skip, take, orderBy, include }),

  count: (where) => prisma.flaggedDetection.count({ where }),

  update: (id, data) => prisma.flaggedDetection.update({ where: { id }, data, include }),
};

export default flaggedDetectionRepository;
