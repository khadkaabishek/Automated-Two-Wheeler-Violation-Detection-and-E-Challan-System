import prisma from '../config/database.js';

export const officerApplicationRepository = {
  create: (data) => prisma.officerApplication.create({ data }),

  findById: (id) =>
    prisma.officerApplication.findUnique({
      where: { id },
      include: { applicant: { select: { id: true, fullName: true, email: true, phone: true } } },
    }),

  findPendingByApplicant: (applicantId) =>
    prisma.officerApplication.findFirst({ where: { applicantId, status: 'PENDING' } }),

  findMany: ({ where, skip, take, orderBy }) =>
    prisma.officerApplication.findMany({
      where,
      skip,
      take,
      orderBy,
      include: { applicant: { select: { id: true, fullName: true, email: true, phone: true } } },
    }),

  count: (where) => prisma.officerApplication.count({ where }),

  update: (id, data) => prisma.officerApplication.update({ where: { id }, data }),
};

export default officerApplicationRepository;
