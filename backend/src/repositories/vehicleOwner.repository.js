import prisma from '../config/database.js';

export const vehicleOwnerRepository = {
  create: (data) => prisma.vehicleOwner.create({ data }),

  findByUserId: (userId) =>
    prisma.vehicleOwner.findFirst({
      where: { userId, deletedAt: null },
      include: { vehicles: true },
    }),

  findById: (id) =>
    prisma.vehicleOwner.findFirst({
      where: { id, deletedAt: null },
      include: { vehicles: true },
    }),

  findByCitizenshipOrLicense: (citizenshipNumber, licenseNumber) =>
    prisma.vehicleOwner.findFirst({
      where: {
        OR: [{ citizenshipNumber }, { licenseNumber }],
      },
    }),

  findMany: ({ where, skip, take, orderBy }) =>
    prisma.vehicleOwner.findMany({
      where: { deletedAt: null, ...where },
      skip,
      take,
      orderBy,
      include: { _count: { select: { vehicles: true } } },
    }),

  count: (where) => prisma.vehicleOwner.count({ where: { deletedAt: null, ...where } }),

  update: (id, data) => prisma.vehicleOwner.update({ where: { id }, data }),

  softDelete: (id) =>
    prisma.vehicleOwner.update({ where: { id }, data: { deletedAt: new Date() } }),
};

export default vehicleOwnerRepository;
