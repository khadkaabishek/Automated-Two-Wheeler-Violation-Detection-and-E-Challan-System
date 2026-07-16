import prisma from '../config/database.js';

export const violationRepository = {
  create: (data) => prisma.violation.create({ data }),

  findById: (id) => prisma.violation.findFirst({ where: { id, deletedAt: null } }),

  findByName: (name) => prisma.violation.findFirst({ where: { name, deletedAt: null } }),

  findByIds: (ids) => prisma.violation.findMany({ where: { id: { in: ids }, deletedAt: null } }),

  findMany: ({ where, skip, take, orderBy }) =>
    prisma.violation.findMany({ where: { deletedAt: null, ...where }, skip, take, orderBy }),

  count: (where) => prisma.violation.count({ where: { deletedAt: null, ...where } }),

  update: (id, data) => prisma.violation.update({ where: { id }, data }),

  softDelete: (id) => prisma.violation.update({ where: { id }, data: { deletedAt: new Date() } }),
};

export default violationRepository;
