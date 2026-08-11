import vehicleRepository from '../repositories/vehicle.repository.js';
import vehicleOwnerRepository from '../repositories/vehicleOwner.repository.js';
import ApiError from '../utils/ApiError.js';
import { getPagination, buildPaginationMeta, getSorting } from '../utils/pagination.js';
import { recordAudit } from './audit.service.js';
import { ROLES } from '../constants/roles.js';

/**
 * Resolves the VehicleOwner profile linked to a Vehicle Owner user account.
 * Throws a clear, actionable error if they haven't created one yet.
 */
const requireOwnProfile = async (userId) => {
  const owner = await vehicleOwnerRepository.findByUserId(userId);
  if (!owner) {
    throw ApiError.badRequest(
      'Create your owner profile first (POST /owners/me) before registering a vehicle.'
    );
  }
  return owner;
};

export const createVehicle = async (payload, actor, req) => {
  const isSelfService = actor.roleName === ROLES.VEHICLE_OWNER;
  let ownerId = payload.ownerId;

  if (isSelfService) {
    const ownProfile = await requireOwnProfile(actor.id);
    ownerId = ownProfile.id;
  } else if (!ownerId) {
    throw ApiError.badRequest('ownerId is required');
  } else {
    const owner = await vehicleOwnerRepository.findById(ownerId);
    if (!owner) throw ApiError.badRequest('Invalid owner ID');
  }

  const duplicate = await vehicleRepository.findByUniqueFields({
    vehicleNumber: payload.vehicleNumber,
    registrationNumber: payload.registrationNumber,
    bluebookNumber: payload.bluebookNumber,
  });
  if (duplicate) {
    throw ApiError.conflict(
      'A vehicle with this vehicle number, registration number, or bluebook number already exists'
    );
  }

  const vehicle = await vehicleRepository.create({
    ...payload,
    ownerId,
    // Self-registered vehicles always start pending admin approval, regardless
    // of what a client sends; staff-created vehicles use their own status or default ACTIVE.
    status: isSelfService ? 'PENDING_APPROVAL' : payload.status || 'ACTIVE',
  });

  await recordAudit({
    userId: actor.id,
    action: 'VEHICLE_CREATED',
    details: { vehicleId: vehicle.id, selfService: isSelfService },
    req,
  });
  return vehicle;
};

export const listVehicles = async (query, actor) => {
  const { page, limit, skip, take } = getPagination(query);
  const orderBy = getSorting(query, ['vehicleNumber', 'createdAt'], 'createdAt');

  const where = {};
  if (query.search) {
    where.OR = [
      { vehicleNumber: { contains: query.search, mode: 'insensitive' } },
      { registrationNumber: { contains: query.search, mode: 'insensitive' } },
      { brand: { contains: query.search, mode: 'insensitive' } },
      { model: { contains: query.search, mode: 'insensitive' } },
    ];
  }
  if (query.status) where.status = query.status;
  if (query.vehicleType) where.vehicleType = query.vehicleType;

  if (actor?.roleName === ROLES.VEHICLE_OWNER) {
    // Hard-scope to their own vehicles regardless of any ownerId a client might send.
    const ownProfile = await vehicleOwnerRepository.findByUserId(actor.id);
    if (!ownProfile) return { vehicles: [], meta: buildPaginationMeta(0, page, limit) };
    where.ownerId = ownProfile.id;
  } else if (query.ownerId) {
    where.ownerId = query.ownerId;
  }

  const [vehicles, total] = await Promise.all([
    vehicleRepository.findMany({ where, skip, take, orderBy }),
    vehicleRepository.count(where),
  ]);

  return { vehicles, meta: buildPaginationMeta(total, page, limit) };
};

export const getVehicleById = async (id, actor) => {
  const vehicle = await vehicleRepository.findById(id);
  if (!vehicle) throw ApiError.notFound('Vehicle not found');

  if (actor?.roleName === ROLES.VEHICLE_OWNER) {
    const ownProfile = await vehicleOwnerRepository.findByUserId(actor.id);
    if (!ownProfile || vehicle.ownerId !== ownProfile.id) {
      throw ApiError.notFound('Vehicle not found');
    }
  }

  return vehicle;
};

export const updateVehicle = async (id, payload, actorId, req) => {
  await getVehicleById(id);
  const vehicle = await vehicleRepository.update(id, payload);
  await recordAudit({
    userId: actorId,
    action: 'VEHICLE_UPDATED',
    details: { vehicleId: id },
    req,
  });
  return vehicle;
};

export const setVehicleStatus = async (id, status, actorId, req) => {
  await getVehicleById(id);
  const vehicle = await vehicleRepository.updateStatus(id, status);
  await recordAudit({
    userId: actorId,
    action: 'VEHICLE_UPDATED',
    details: { vehicleId: id, statusChange: status },
    req,
  });
  return vehicle;
};

export const approveRegistration = async (id, actorId, req) => {
  const vehicle = await getVehicleById(id);
  if (vehicle.status !== 'PENDING_APPROVAL') {
    throw ApiError.badRequest('Only pending registrations can be approved');
  }
  return setVehicleStatus(id, 'ACTIVE', actorId, req);
};

export const rejectRegistration = async (id, actorId, req) => {
  const vehicle = await getVehicleById(id);
  if (vehicle.status !== 'PENDING_APPROVAL') {
    throw ApiError.badRequest('Only pending registrations can be rejected');
  }
  return setVehicleStatus(id, 'INACTIVE', actorId, req);
};

export const deleteVehicle = async (id, actorId, req) => {
  await getVehicleById(id);
  await vehicleRepository.softDelete(id);
  await recordAudit({
    userId: actorId,
    action: 'VEHICLE_DELETED',
    details: { vehicleId: id },
    req,
  });
};
