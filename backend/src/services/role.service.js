import roleRepository, { permissionRepository } from '../repositories/role.repository.js';
import ApiError from '../utils/ApiError.js';
import { getPagination, buildPaginationMeta, getSorting } from '../utils/pagination.js';
import { recordAudit } from './audit.service.js';

export const listPermissions = async () => permissionRepository.findAll();

export const createRole = async (payload, actorId, req) => {
  const existing = await roleRepository.findByName(payload.name);
  if (existing) {
    throw ApiError.conflict('A role with this name already exists');
  }

  const role = await roleRepository.create({
    name: payload.name,
    description: payload.description,
  });

  if (payload.permissionIds?.length) {
    await roleRepository.setPermissions(role.id, payload.permissionIds);
  }

  await recordAudit({ userId: actorId, action: 'ROLE_CREATED', details: { roleId: role.id }, req });
  return roleRepository.findById(role.id);
};

export const listRoles = async (query) => {
  const { page, limit, skip, take } = getPagination(query);
  const orderBy = getSorting(query, ['name', 'createdAt'], 'createdAt');

  const where = query.search ? { name: { contains: query.search, mode: 'insensitive' } } : {};

  const [roles, total] = await Promise.all([
    roleRepository.findMany({ where, skip, take, orderBy }),
    roleRepository.count(where),
  ]);

  return { roles, meta: buildPaginationMeta(total, page, limit) };
};

export const getRoleById = async (id) => {
  const role = await roleRepository.findById(id);
  if (!role) throw ApiError.notFound('Role not found');
  return role;
};

export const updateRole = async (id, payload, actorId, req) => {
  await getRoleById(id);
  const role = await roleRepository.update(id, {
    name: payload.name,
    description: payload.description,
  });
  await recordAudit({ userId: actorId, action: 'ROLE_UPDATED', details: { roleId: id }, req });
  return role;
};

export const assignPermissions = async (id, permissionIds, actorId, req) => {
  await getRoleById(id);
  const validPermissions = await permissionRepository.findByIds(permissionIds);
  if (validPermissions.length !== permissionIds.length) {
    throw ApiError.badRequest('One or more permission IDs are invalid');
  }
  await roleRepository.setPermissions(id, permissionIds);
  await recordAudit({
    userId: actorId,
    action: 'PERMISSION_ASSIGNED',
    details: { roleId: id, permissionIds },
    req,
  });
  return getRoleById(id);
};

export const deleteRole = async (id, actorId, req) => {
  const role = await getRoleById(id);
  if (role.isSystem) {
    throw ApiError.forbidden('System roles cannot be deleted');
  }
  await roleRepository.softDelete(id);
  await recordAudit({ userId: actorId, action: 'ROLE_DELETED', details: { roleId: id }, req });
};
