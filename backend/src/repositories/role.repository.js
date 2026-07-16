import prisma from '../config/database.js';

export const roleRepository = {
  create: (data) => prisma.role.create({ data }),

  findById: (id) =>
    prisma.role.findFirst({
      where: { id, deletedAt: null },
      include: { rolePermissions: { include: { permission: true } } },
    }),

  findByName: (name) => prisma.role.findFirst({ where: { name, deletedAt: null } }),

  findMany: ({ where, skip, take, orderBy }) =>
    prisma.role.findMany({
      where: { deletedAt: null, ...where },
      skip,
      take,
      orderBy,
      include: { rolePermissions: { include: { permission: true } }, _count: { select: { users: true } } },
    }),

  count: (where) => prisma.role.count({ where: { deletedAt: null, ...where } }),

  update: (id, data) => prisma.role.update({ where: { id }, data }),

  softDelete: (id) => prisma.role.update({ where: { id }, data: { deletedAt: new Date() } }),

  setPermissions: async (roleId, permissionIds) => {
    return prisma.$transaction([
      prisma.rolePermission.deleteMany({ where: { roleId } }),
      prisma.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({ roleId, permissionId })),
        skipDuplicates: true,
      }),
    ]);
  },
};

export const permissionRepository = {
  findAll: () => prisma.permission.findMany({ orderBy: [{ module: 'asc' }, { name: 'asc' }] }),

  findByIds: (ids) => prisma.permission.findMany({ where: { id: { in: ids } } }),

  findByNames: (names) => prisma.permission.findMany({ where: { name: { in: names } } }),

  createMany: (data) => prisma.permission.createMany({ data, skipDuplicates: true }),
};

export default roleRepository;
