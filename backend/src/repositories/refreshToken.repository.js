import prisma from '../config/database.js';

export const refreshTokenRepository = {
  create: (data) => prisma.refreshToken.create({ data }),

  findByToken: (token) => prisma.refreshToken.findUnique({ where: { token } }),

  revoke: (id) => prisma.refreshToken.update({ where: { id }, data: { revoked: true } }),

  revokeAllForUser: (userId) =>
    prisma.refreshToken.updateMany({ where: { userId, revoked: false }, data: { revoked: true } }),

  deleteExpired: () => prisma.refreshToken.deleteMany({ where: { expiresAt: { lt: new Date() } } }),
};

export default refreshTokenRepository;
