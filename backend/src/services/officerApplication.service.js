import officerApplicationRepository from '../repositories/officerApplication.repository.js';
import userRepository from '../repositories/user.repository.js';
import roleRepository from '../repositories/role.repository.js';
import ApiError from '../utils/ApiError.js';
import { getPagination, buildPaginationMeta, getSorting } from '../utils/pagination.js';
import { recordAudit } from './audit.service.js';
import { ROLES } from '../constants/roles.js';

export const createApplication = async (applicantId, payload, req) => {
  const applicant = await userRepository.findById(applicantId);
  if (!applicant) throw ApiError.notFound('User not found');

  if ([ROLES.SUPER_ADMIN, ROLES.TRAFFIC_POLICE].includes(applicant.role.name)) {
    throw ApiError.badRequest('You already hold a staff role');
  }

  const existingPending = await officerApplicationRepository.findPendingByApplicant(applicantId);
  if (existingPending) {
    throw ApiError.conflict('You already have a pending officer application');
  }

  const application = await officerApplicationRepository.create({
    applicantId,
    message: payload.message,
    desiredStation: payload.desiredStation,
  });

  await recordAudit({
    userId: applicantId,
    action: 'USER_UPDATED',
    details: { officerApplicationId: application.id, self: true, type: 'officer_application' },
    req,
  });

  return application;
};

/**
 * Applicants only ever see their own applications; Admin/Super Admin see all.
 * `scopeUserId` is null for admins (no scoping applied).
 */
export const listApplications = async (query, scopeUserId) => {
  const { page, limit, skip, take } = getPagination(query);
  const orderBy = getSorting(query, ['createdAt', 'status'], 'createdAt');

  const where = {};
  if (scopeUserId) where.applicantId = scopeUserId;
  if (query.status) where.status = query.status;

  const [applications, total] = await Promise.all([
    officerApplicationRepository.findMany({ where, skip, take, orderBy }),
    officerApplicationRepository.count(where),
  ]);

  return { applications, meta: buildPaginationMeta(total, page, limit) };
};

export const getApplicationById = async (id, scopeUserId) => {
  const application = await officerApplicationRepository.findById(id);
  if (!application) throw ApiError.notFound('Officer application not found');
  if (scopeUserId && application.applicantId !== scopeUserId) {
    throw ApiError.forbidden("You cannot view another user's application");
  }
  return application;
};

export const approveApplication = async (id, actorId, req) => {
  const application = await officerApplicationRepository.findById(id);
  if (!application) throw ApiError.notFound('Officer application not found');
  if (application.status !== 'PENDING') {
    throw ApiError.badRequest('Only pending applications can be approved');
  }

  const officerRole = await roleRepository.findByName(ROLES.TRAFFIC_POLICE);
  if (!officerRole) {
    throw ApiError.internal('Traffic Police role is not configured. Please run the database seed.');
  }

  await userRepository.update(application.applicantId, { roleId: officerRole.id });

  const updated = await officerApplicationRepository.update(id, {
    status: 'APPROVED',
    reviewedBy: actorId,
    reviewedAt: new Date(),
  });

  await recordAudit({
    userId: actorId,
    action: 'USER_UPDATED',
    details: {
      officerApplicationId: id,
      applicantId: application.applicantId,
      promotedToOfficer: true,
    },
    req,
  });

  return updated;
};

export const rejectApplication = async (id, reason, actorId, req) => {
  const application = await officerApplicationRepository.findById(id);
  if (!application) throw ApiError.notFound('Officer application not found');
  if (application.status !== 'PENDING') {
    throw ApiError.badRequest('Only pending applications can be rejected');
  }

  const updated = await officerApplicationRepository.update(id, {
    status: 'REJECTED',
    reviewedBy: actorId,
    reviewedAt: new Date(),
    rejectionReason: reason,
  });

  await recordAudit({
    userId: actorId,
    action: 'USER_UPDATED',
    details: { officerApplicationId: id, rejected: true, reason },
    req,
  });

  return updated;
};
