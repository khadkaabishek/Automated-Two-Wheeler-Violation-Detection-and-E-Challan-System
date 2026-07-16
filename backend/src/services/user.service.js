import userRepository from '../repositories/user.repository.js';
import roleRepository from '../repositories/role.repository.js';
import ApiError from '../utils/ApiError.js';
import { hashPassword } from '../utils/password.js';
import { getPagination, buildPaginationMeta, getSorting } from '../utils/pagination.js';
import { recordAudit } from './audit.service.js';
import { sanitizeUser } from './auth.service.js';
import { ROLES } from '../constants/roles.js';

export const createUser = async (payload, actorId, req) => {
  const existing = await userRepository.findByEmailIncludingDeleted(payload.email);
  if (existing) {
    throw ApiError.conflict('A user with this email already exists');
  }

  const role = await roleRepository.findById(payload.roleId);
  if (!role) {
    throw ApiError.badRequest('Invalid role ID');
  }

  if (role.name === ROLES.VEHICLE_OWNER) {
    throw ApiError.badRequest(
      'Vehicle Owner accounts cannot be created here — citizens self-register via /auth/register'
    );
  }

  const hashedPassword = await hashPassword(payload.password);
  const user = await userRepository.create({
    fullName: payload.fullName,
    email: payload.email,
    phone: payload.phone,
    password: hashedPassword,
    roleId: payload.roleId,
    status: payload.status || 'ACTIVE',
  });

  await recordAudit({ userId: actorId, action: 'USER_CREATED', details: { createdUserId: user.id }, req });
  return sanitizeUser(user);
};

export const listUsers = async (query) => {
  const { page, limit, skip, take } = getPagination(query);
  const orderBy = getSorting(query, ['fullName', 'email', 'createdAt'], 'createdAt');

  const where = {};
  if (query.search) {
    where.OR = [
      { fullName: { contains: query.search, mode: 'insensitive' } },
      { email: { contains: query.search, mode: 'insensitive' } },
    ];
  }
  if (query.roleId) where.roleId = query.roleId;
  if (query.status) where.status = query.status;

  const [users, total] = await Promise.all([
    userRepository.findMany({ where, skip, take, orderBy }),
    userRepository.count(where),
  ]);

  return { users, meta: buildPaginationMeta(total, page, limit) };
};

export const getUserById = async (id) => {
  const user = await userRepository.findById(id);
  if (!user) throw ApiError.notFound('User not found');
  return sanitizeUser(user);
};

export const updateUser = async (id, payload, actorId, req) => {
  await getUserById(id);

  if (payload.roleId) {
    const role = await roleRepository.findById(payload.roleId);
    if (!role) throw ApiError.badRequest('Invalid role ID');
    if (role.name === ROLES.VEHICLE_OWNER) {
      throw ApiError.badRequest(
        'Users cannot be reassigned to the Vehicle Owner role here — that role is citizen self-registration only'
      );
    }
  }

  const user = await userRepository.update(id, {
    fullName: payload.fullName,
    phone: payload.phone,
    roleId: payload.roleId,
    avatar: payload.avatar,
  });

  await recordAudit({ userId: actorId, action: 'USER_UPDATED', details: { updatedUserId: id }, req });
  return sanitizeUser(user);
};

export const deleteUser = async (id, actorId, req) => {
  await getUserById(id);
  await userRepository.softDelete(id);
  await recordAudit({ userId: actorId, action: 'USER_DELETED', details: { deletedUserId: id }, req });
};

export const setUserStatus = async (id, status, actorId, req) => {
  await getUserById(id);
  const user = await userRepository.updateStatus(id, status);
  await recordAudit({
    userId: actorId,
    action: status === 'ACTIVE' ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
    details: { targetUserId: id },
    req,
  });
  return sanitizeUser(user);
};
