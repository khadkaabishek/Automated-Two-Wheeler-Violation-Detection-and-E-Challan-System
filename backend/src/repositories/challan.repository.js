import prisma from '../config/database.js';

const fullInclude = {
  vehicle: { include: { owner: true } },
  officer: { select: { id: true, fullName: true, email: true } },
  challanViolations: { include: { violation: true } },
  evidences: true,
  payments: true,
};

export const challanRepository = {
  create: (data) => prisma.challan.create({ data, include: fullInclude }),

  createWithViolations: ({ challanData, violationLinks, aiSnapshotUrl }) =>
    prisma.$transaction(async (tx) => {
      const challan = await tx.challan.create({ data: challanData });
      await tx.challanViolation.createMany({
        data: violationLinks.map((v) => ({ ...v, challanId: challan.id })),
      });
      if (aiSnapshotUrl) {
        await tx.evidence.create({
          data: {
            challanId: challan.id,
            type: 'IMAGE',
            url: aiSnapshotUrl,
          },
        });
      }
      return tx.challan.findUnique({ where: { id: challan.id }, include: fullInclude });
    }),

  findById: (id) =>
    prisma.challan.findFirst({ where: { id, deletedAt: null }, include: fullInclude }),

  findByChallanNumber: (challanNumber) =>
    prisma.challan.findFirst({ where: { challanNumber }, include: fullInclude }),

  findMany: ({ where, skip, take, orderBy }) =>
    prisma.challan.findMany({
      where: { deletedAt: null, ...where },
      skip,
      take,
      orderBy,
      include: {
        vehicle: { select: { id: true, vehicleNumber: true, brand: true, model: true } },
        officer: { select: { id: true, fullName: true } },
        challanViolations: { include: { violation: true } },
      },
    }),

  count: (where) => prisma.challan.count({ where: { deletedAt: null, ...where } }),

  update: (id, data) => prisma.challan.update({ where: { id }, data, include: fullInclude }),

  addEvidence: (challanId, evidences) =>
    prisma.evidence.createMany({ data: evidences.map((e) => ({ ...e, challanId })) }),

  softDelete: (id) => prisma.challan.update({ where: { id }, data: { deletedAt: new Date() } }),

  // ---- Dashboard / reporting aggregates ----
  countByStatus: (status) => prisma.challan.count({ where: { status, deletedAt: null } }),

  countByPaymentStatus: (paymentStatus) =>
    prisma.challan.count({ where: { paymentStatus, deletedAt: null } }),

  sumFineAmount: (where) =>
    prisma.challan.aggregate({ where: { deletedAt: null, ...where }, _sum: { fineAmount: true } }),

  countCreatedBetween: (start, end) =>
    prisma.challan.count({ where: { createdAt: { gte: start, lte: end }, deletedAt: null } }),

  groupByOfficer: () =>
    prisma.challan.groupBy({
      by: ['officerId'],
      where: { deletedAt: null },
      _count: { _all: true },
    }),

  topViolations: () =>
    prisma.challanViolation.groupBy({
      by: ['violationId'],
      _count: { _all: true },
      orderBy: { _count: { violationId: 'desc' } },
      take: 10,
    }),

  findManyForReport: (where) =>
    prisma.challan.findMany({
      where: { deletedAt: null, ...where },
      include: {
        vehicle: { select: { vehicleNumber: true } },
        officer: { select: { fullName: true } },
        challanViolations: { include: { violation: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
};

export default challanRepository;
