import prisma from '../config/database.js';

const roleInclude = {
  role: {
    include: { rolePermissions: { include: { permission: true } } },
  },
};

export const userRepository = {
  create: (data) => prisma.user.create({ data, include: roleInclude }),

  findById: (id, opts = {}) =>
    prisma.user.findFirst({
      where: { id, deletedAt: null, ...opts.where },
      include: roleInclude,
    }),

  findByEmail: (email) =>
    prisma.user.findFirst({ where: { email, deletedAt: null }, include: roleInclude }),

  findByEmailIncludingDeleted: (email) => prisma.user.findUnique({ where: { email } }),

  findByEmailVerificationToken: (hashedToken) =>
    prisma.user.findFirst({ where: { emailVerificationToken: hashedToken, deletedAt: null } }),

  findByPasswordResetToken: (hashedToken) =>
    prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: { gt: new Date() },
        deletedAt: null,
      },
    }),

  update: (id, data) => prisma.user.update({ where: { id }, data, include: roleInclude }),

  softDelete: (id) =>
    prisma.user.update({ where: { id }, data: { deletedAt: new Date(), status: 'INACTIVE' } }),

  updateStatus: (id, status) => prisma.user.update({ where: { id }, data: { status } }),

  findMany: ({ where, skip, take, orderBy }) =>
    prisma.user.findMany({
      where: { deletedAt: null, ...where },
      skip,
      take,
      orderBy,
      include: { role: { select: { id: true, name: true } } },
    }),

  count: (where) => prisma.user.count({ where: { deletedAt: null, ...where } }),
};

export default userRepository;
