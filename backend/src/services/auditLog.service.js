import auditLogRepository from '../repositories/auditLog.repository.js';
import { getPagination, buildPaginationMeta, getSorting } from '../utils/pagination.js';

export const listAuditLogs = async (query) => {
  const { page, limit, skip, take } = getPagination(query);
  const orderBy = getSorting(query, ['createdAt', 'action'], 'createdAt');

  const where = {};
  if (query.userId) where.userId = query.userId;
  if (query.action) where.action = query.action;
  if (query.startDate || query.endDate) {
    where.createdAt = {};
    if (query.startDate) where.createdAt.gte = new Date(query.startDate);
    if (query.endDate) where.createdAt.lte = new Date(query.endDate);
  }

  const [logs, total] = await Promise.all([
    auditLogRepository.findMany({ where, skip, take, orderBy }),
    auditLogRepository.count(where),
  ]);

  return { logs, meta: buildPaginationMeta(total, page, limit) };
};
