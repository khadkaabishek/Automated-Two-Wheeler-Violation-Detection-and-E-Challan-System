import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { verifyAccessToken } from '../utils/jwt.js';
import prisma from '../config/database.js';

/**
 * Verifies the Bearer access token and attaches the authenticated user
 * (with role + permissions) to req.user. Protects private routes.
 */
export const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Authentication token missing');
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Access token expired');
    }
    throw ApiError.unauthorized('Invalid access token');
  }

  const user = await prisma.user.findFirst({
    where: { id: decoded.sub, deletedAt: null },
    include: {
      role: {
        include: {
          rolePermissions: { include: { permission: true } },
        },
      },
    },
  });

  if (!user) {
    throw ApiError.unauthorized('User no longer exists');
  }

  if (user.status !== 'ACTIVE') {
    throw ApiError.forbidden('Account is not active');
  }

  req.user = {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    roleId: user.roleId,
    roleName: user.role.name,
    permissions: user.role.rolePermissions.map((rp) => rp.permission.name),
  };

  next();
});

export default authenticate;
