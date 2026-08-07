import prisma from '../config/database.js';

export const vehicleRepository = {
  create: (data) => prisma.vehicle.create({ data, include: { owner: true } }),

  findById: (id) =>
    prisma.vehicle.findFirst({
      where: { id, deletedAt: null },
      include: { owner: true },
    }),

  findByVehicleNumber: (vehicleNumber) =>
    prisma.vehicle.findFirst({ where: { vehicleNumber }, include: { owner: true } }),

  findByUniqueFields: ({ vehicleNumber, registrationNumber, bluebookNumber }) =>
    prisma.vehicle.findFirst({
      where: { OR: [{ vehicleNumber }, { registrationNumber }, { bluebookNumber }] },
    }),

  findMany: ({ where, skip, take, orderBy }) =>
    prisma.vehicle.findMany({
      where: { deletedAt: null, ...where },
      skip,
      take,
      orderBy,
      include: { owner: { select: { id: true, fullName: true, phone: true } } },
    }),

  count: (where) => prisma.vehicle.count({ where: { deletedAt: null, ...where } }),

  update: (id, data) => prisma.vehicle.update({ where: { id }, data, include: { owner: true } }),

  updateStatus: (id, status) => prisma.vehicle.update({ where: { id }, data: { status } }),

  softDelete: (id) => prisma.vehicle.update({ where: { id }, data: { deletedAt: new Date() } }),
};

export default vehicleRepository;
