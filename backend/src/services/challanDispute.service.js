import challanDisputeRepository from '../repositories/challanDispute.repository.js';
import challanRepository from '../repositories/challan.repository.js';
import ApiError from '../utils/ApiError.js';
import { getPagination, buildPaginationMeta, getSorting } from '../utils/pagination.js';
import { recordAudit } from './audit.service.js';
import { notifyDisputeResolved } from './notification.service.js';
import { ROLES } from '../constants/roles.js';
import prisma from '../config/database.js';

const DISPUTABLE_STATUSES = ['PENDING', 'APPROVED'];

export const createDispute = async (userId, payload, req) => {
  const challan = await challanRepository.findById(payload.challanId);
  if (!challan) throw ApiError.notFound('Citation not found');

  if (challan.vehicle?.owner?.userId !== userId) {
    throw ApiError.forbidden('You can only dispute citations issued against your own vehicles');
  }

  if (!DISPUTABLE_STATUSES.includes(challan.status)) {
    throw ApiError.badRequest(`Citations in ${challan.status} status can no longer be disputed`);
  }

  const existingPending = await challanDisputeRepository.findPendingByChallan(payload.challanId);
  if (existingPending) {
    throw ApiError.conflict('You already have a pending dispute for this citation');
  }

  const dispute = await challanDisputeRepository.create({
    challanId: payload.challanId,
    raisedById: userId,
    reason: payload.reason,
  });

  await recordAudit({
    userId,
    action: 'CHALLAN_UPDATED',
    details: { challanId: payload.challanId, disputeId: dispute.id, type: 'dispute_raised' },
    req,
  });

  return dispute;
};

/**
 * Citizens only ever see their own disputes; Traffic Police / Super Admin see all.
 */
export const listDisputes = async (query, actor) => {
  const { page, limit, skip, take } = getPagination(query);
  const orderBy = getSorting(query, ['createdAt', 'status'], 'createdAt');

  const where = {};
  if (actor?.roleName === ROLES.VEHICLE_OWNER) where.raisedById = actor.id;
  if (query.status) where.status = query.status;

  const [disputes, total] = await Promise.all([
    challanDisputeRepository.findMany({ where, skip, take, orderBy }),
    challanDisputeRepository.count(where),
  ]);

  return { disputes, meta: buildPaginationMeta(total, page, limit) };
};

export const getDisputeById = async (id, actor) => {
  const dispute = await challanDisputeRepository.findById(id);
  if (!dispute) throw ApiError.notFound('Dispute not found');
  if (actor?.roleName === ROLES.VEHICLE_OWNER && dispute.raisedById !== actor.id) {
    throw ApiError.notFound('Dispute not found');
  }
  return dispute;
};

/**
 * Traffic Police / Super Admin resolves a pending dispute.
 * - UPHELD: the citizen was right — the citation is voided (CANCELLED).
 * - DISMISSED: the citation stands as issued.
 */
export const resolveDispute = async (id, decision, resolutionNote, actorId, req) => {
  const dispute = await challanDisputeRepository.findById(id);
  if (!dispute) throw ApiError.notFound('Dispute not found');
  if (dispute.status !== 'PENDING') {
    throw ApiError.badRequest('Only pending disputes can be resolved');
  }

  if (decision === 'UPHELD') {
    // Bypasses the normal linear workflow deliberately — a successful dispute
    // can void a citation regardless of whether it was still PENDING or had
    // already been APPROVED.
    await challanRepository.update(dispute.challanId, { status: 'CANCELLED' });
  }

  const updated = await challanDisputeRepository.update(id, {
    status: decision,
    reviewedBy: actorId,
    reviewedAt: new Date(),
    resolutionNote,
  });

  await recordAudit({
    userId: actorId,
    action: 'CHALLAN_UPDATED',
    details: { disputeId: id, challanId: dispute.challanId, type: 'dispute_resolved', decision },
    req,
  });

  const fullChallan = await challanRepository.findById(dispute.challanId);
  await notifyDisputeResolved(updated, fullChallan, decision, resolutionNote);

  return updated;
};

/**
 * Citizen uploads evidence images/videos to support their dispute.
 */
export const addDisputeEvidence = async (disputeId, files, userId) => {
  const dispute = await challanDisputeRepository.findById(disputeId);
  if (!dispute) throw ApiError.notFound('Dispute not found');

  // Only the person who raised the dispute can upload evidence
  if (dispute.raisedById !== userId) {
    throw ApiError.forbidden('You can only add evidence to your own disputes');
  }

  if (dispute.status !== 'PENDING') {
    throw ApiError.badRequest('Evidence can only be added to pending disputes');
  }

  const evidenceRecords = [];
  const images = files.evidenceImage || [];
  const videos = files.evidenceVideo || [];

  for (const file of images) {
    evidenceRecords.push({
      disputeId,
      type: 'IMAGE',
      url: `/uploads/evidence/images/${file.filename}`,
    });
  }
  for (const file of videos) {
    evidenceRecords.push({
      disputeId,
      type: 'VIDEO',
      url: `/uploads/evidence/videos/${file.filename}`,
    });
  }

  if (evidenceRecords.length === 0) {
    throw ApiError.badRequest('No files were uploaded');
  }

  await prisma.disputeEvidence.createMany({ data: evidenceRecords });

  return challanDisputeRepository.findById(disputeId);
};
