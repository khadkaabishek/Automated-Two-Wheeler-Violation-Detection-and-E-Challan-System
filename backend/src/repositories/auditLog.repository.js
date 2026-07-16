import prisma from '../config/database.js';

export const auditLogRepository = {
  create: (data) => prisma.auditLog.create({ data }),

  findMany: ({ where, skip, take, orderBy }) =>
    prisma.auditLog.findMany({
      where,
      skip,
      take,
      orderBy,
      include: { user: { select: { id: true, fullName: true, email: true } } },
    }),

  count: (where) => prisma.auditLog.count({ where }),
};

export default auditLogRepository;
