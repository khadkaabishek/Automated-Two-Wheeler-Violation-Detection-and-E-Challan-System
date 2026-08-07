import vehicleOwnerRepository from '../repositories/vehicleOwner.repository.js';
import ApiError from '../utils/ApiError.js';
import { getPagination, buildPaginationMeta, getSorting } from '../utils/pagination.js';
import { recordAudit } from './audit.service.js';

export const createOwner = async (payload, actorId, req) => {
  const existing = await vehicleOwnerRepository.findByCitizenshipOrLicense(
    payload.citizenshipNumber,
    payload.licenseNumber
  );
  if (existing) {
    throw ApiError.conflict('An owner with this citizenship or license number already exists');
  }

  const owner = await vehicleOwnerRepository.create(payload);
  await recordAudit({ userId: actorId, action: 'OWNER_CREATED', details: { ownerId: owner.id }, req });
  return owner;
};

export const listOwners = async (query) => {
  const { page, limit, skip, take } = getPagination(query);
  const orderBy = getSorting(query, ['fullName', 'createdAt'], 'createdAt');

  const where = query.search
    ? {
        OR: [
          { fullName: { contains: query.search, mode: 'insensitive' } },
          { phone: { contains: query.search, mode: 'insensitive' } },
          { citizenshipNumber: { contains: query.search, mode: 'insensitive' } },
          { licenseNumber: { contains: query.search, mode: 'insensitive' } },
        ],
      }
    : {};

  const [owners, total] = await Promise.all([
    vehicleOwnerRepository.findMany({ where, skip, take, orderBy }),
    vehicleOwnerRepository.count(where),
  ]);

  return { owners, meta: buildPaginationMeta(total, page, limit) };
};

export const getOwnerById = async (id) => {
  const owner = await vehicleOwnerRepository.findById(id);
  if (!owner) throw ApiError.notFound('Vehicle owner not found');
  return owner;
};

export const updateOwner = async (id, payload, actorId, req) => {
  await getOwnerById(id);
  const owner = await vehicleOwnerRepository.update(id, payload);
  await recordAudit({ userId: actorId, action: 'OWNER_UPDATED', details: { ownerId: id }, req });
  return owner;
};

export const deleteOwner = async (id, actorId, req) => {
  const owner = await getOwnerById(id);
  if (owner.vehicles?.length) {
    throw ApiError.conflict('Cannot delete an owner who still has registered vehicles');
  }
  await vehicleOwnerRepository.softDelete(id);
  await recordAudit({ userId: actorId, action: 'OWNER_DELETED', details: { ownerId: id }, req });
};

// ---- Self-service (Vehicle Owner role manages their own profile) ----

export const getMyProfile = async (userId) => {
  const owner = await vehicleOwnerRepository.findByUserId(userId);
  if (!owner) return null;
  return owner;
};

export const createMyProfile = async (userId, payload, req) => {
  const existing = await vehicleOwnerRepository.findByUserId(userId);
  if (existing) {
    throw ApiError.conflict('You already have an owner profile');
  }
  const duplicate = await vehicleOwnerRepository.findByCitizenshipOrLicense(
    payload.citizenshipNumber,
    payload.licenseNumber
  );
  if (duplicate) {
    throw ApiError.conflict('An owner with this citizenship or license number already exists');
  }

  const owner = await vehicleOwnerRepository.create({ ...payload, userId });
  await recordAudit({ userId, action: 'OWNER_CREATED', details: { ownerId: owner.id, self: true }, req });
  return owner;
};

export const updateMyProfile = async (userId, payload, req) => {
  const owner = await vehicleOwnerRepository.findByUserId(userId);
  if (!owner) throw ApiError.notFound('No owner profile found. Create one first.');
  const updated = await vehicleOwnerRepository.update(owner.id, {
    fullName: payload.fullName,
    address: payload.address,
    phone: payload.phone,
    email: payload.email,
  });
  await recordAudit({ userId, action: 'OWNER_UPDATED', details: { ownerId: owner.id, self: true }, req });
  return updated;
};
