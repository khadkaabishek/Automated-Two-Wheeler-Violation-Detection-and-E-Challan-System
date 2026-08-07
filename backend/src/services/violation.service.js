import violationRepository from '../repositories/violation.repository.js';
import ApiError from '../utils/ApiError.js';
import { getPagination, buildPaginationMeta, getSorting } from '../utils/pagination.js';
import { recordAudit } from './audit.service.js';

export const createViolation = async (payload, actorId, req) => {
  const existing = await violationRepository.findByName(payload.name);
  if (existing) {
    throw ApiError.conflict('A violation with this name already exists');
  }
  const violation = await violationRepository.create(payload);
  await recordAudit({ userId: actorId, action: 'VIOLATION_CREATED', details: { violationId: violation.id }, req });
  return violation;
};

export const listViolations = async (query) => {
  const { page, limit, skip, take } = getPagination(query);
  const orderBy = getSorting(query, ['name', 'fineAmount', 'createdAt'], 'name');

  const where = {};
  if (query.search) where.name = { contains: query.search, mode: 'insensitive' };
  if (query.isActive !== undefined) where.isActive = query.isActive === 'true';

  const [violations, total] = await Promise.all([
    violationRepository.findMany({ where, skip, take, orderBy }),
    violationRepository.count(where),
  ]);

  return { violations, meta: buildPaginationMeta(total, page, limit) };
};

export const getViolationById = async (id) => {
  const violation = await violationRepository.findById(id);
  if (!violation) throw ApiError.notFound('Violation not found');
  return violation;
};

export const updateViolation = async (id, payload, actorId, req) => {
  await getViolationById(id);
  const violation = await violationRepository.update(id, payload);
  await recordAudit({ userId: actorId, action: 'VIOLATION_UPDATED', details: { violationId: id }, req });
  return violation;
};

export const deleteViolation = async (id, actorId, req) => {
  await getViolationById(id);
  await violationRepository.softDelete(id);
  await recordAudit({ userId: actorId, action: 'VIOLATION_DELETED', details: { violationId: id }, req });
};
