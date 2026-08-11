import challanRepository from '../repositories/challan.repository.js';
import vehicleRepository from '../repositories/vehicle.repository.js';
import violationRepository from '../repositories/violation.repository.js';
import ApiError from '../utils/ApiError.js';
import { generateChallanNumber } from '../utils/generateChallanNumber.js';
import { getPagination, buildPaginationMeta, getSorting } from '../utils/pagination.js';
import { recordAudit } from './audit.service.js';
import { notifyChallanIssued, notifyChallanApproved } from './notification.service.js';
import { ROLES } from '../constants/roles.js';

// Valid forward transitions for the challan lifecycle.
const WORKFLOW = {
  PENDING: ['APPROVED', 'REJECTED', 'CANCELLED'],
  APPROVED: ['PAID', 'CANCELLED'],
  PAID: ['CLOSED'],
  CLOSED: [],
  REJECTED: [],
  CANCELLED: [],
};

export const createChallan = async (payload, officerId, req) => {
  const vehicle = await vehicleRepository.findById(payload.vehicleId);
  if (!vehicle) {
    throw ApiError.badRequest('Invalid vehicle ID');
  }

  if (!payload.violationIds?.length) {
    throw ApiError.badRequest('At least one violation must be specified');
  }

  const violations = await violationRepository.findByIds(payload.violationIds);
  if (violations.length !== payload.violationIds.length) {
    throw ApiError.badRequest('One or more violation IDs are invalid');
  }
  const inactive = violations.filter((v) => !v.isActive);
  if (inactive.length) {
    throw ApiError.badRequest(`Violation(s) not active: ${inactive.map((v) => v.name).join(', ')}`);
  }

  // Auto fine calculation: sum of each violation's current fine amount.
  const totalFine = violations.reduce((sum, v) => sum + Number(v.fineAmount), 0);

  let challanNumber = generateChallanNumber();
  // Extremely unlikely collision guard.
  // eslint-disable-next-line no-constant-condition
  while (await challanRepository.findByChallanNumber(challanNumber)) {
    challanNumber = generateChallanNumber();
  }

  const challan = await challanRepository.createWithViolations({
    challanData: {
      challanNumber,
      vehicleId: payload.vehicleId,
      officerId,
      fineAmount: totalFine,
      description: payload.description,
      gpsLatitude: payload.gpsLatitude,
      gpsLongitude: payload.gpsLongitude,
      address: payload.address,
      incidentDate: payload.incidentDate,
      incidentTime: payload.incidentTime,
    },
    violationLinks: violations.map((v) => ({
      violationId: v.id,
      fineAmount: v.fineAmount,
    })),
    aiSnapshotUrl: payload.aiSnapshotUrl,
  });

  await recordAudit({
    userId: officerId,
    action: 'CHALLAN_CREATED',
    details: { challanId: challan.id, challanNumber },
    req,
  });

  await notifyChallanIssued(challan);

  return challan;
};

export const listChallans = async (query, actor) => {
  const { page, limit, skip, take } = getPagination(query);
  const orderBy = getSorting(
    query,
    ['challanNumber', 'fineAmount', 'incidentDate', 'createdAt'],
    'createdAt'
  );

  const where = {};
  if (query.search) {
    where.OR = [
      { challanNumber: { contains: query.search, mode: 'insensitive' } },
      { vehicle: { vehicleNumber: { contains: query.search, mode: 'insensitive' } } },
    ];
  }
  if (query.status) where.status = query.status;
  if (query.paymentStatus) where.paymentStatus = query.paymentStatus;
  if (query.officerId) where.officerId = query.officerId;
  if (query.vehicleId) where.vehicleId = query.vehicleId;
  if (query.startDate || query.endDate) {
    where.incidentDate = {};
    if (query.startDate) where.incidentDate.gte = new Date(query.startDate);
    if (query.endDate) where.incidentDate.lte = new Date(query.endDate);
  }

  if (actor?.roleName === ROLES.VEHICLE_OWNER) {
    // Hard-scope to challans against vehicles they own, via the nested relation -
    // no separate lookup needed, Prisma filters through the join directly.
    where.vehicle = { ...(where.vehicle || {}), owner: { userId: actor.id } };
  }

  const [challans, total] = await Promise.all([
    challanRepository.findMany({ where, skip, take, orderBy }),
    challanRepository.count(where),
  ]);

  return { challans, meta: buildPaginationMeta(total, page, limit) };
};

export const getChallanById = async (id, actor) => {
  const challan = await challanRepository.findById(id);
  if (!challan) throw ApiError.notFound('Challan not found');

  if (actor?.roleName === ROLES.VEHICLE_OWNER && challan.vehicle?.owner?.userId !== actor.id) {
    throw ApiError.notFound('Challan not found');
  }
  return challan;
};

export const updateChallan = async (id, payload, actorId, req) => {
  const challan = await getChallanById(id);
  if (challan.status !== 'PENDING') {
    throw ApiError.badRequest('Only challans in PENDING status can be edited');
  }
  const updated = await challanRepository.update(id, {
    description: payload.description,
    address: payload.address,
  });
  await recordAudit({
    userId: actorId,
    action: 'CHALLAN_UPDATED',
    details: { challanId: id },
    req,
  });
  return updated;
};

export const transitionChallanStatus = async (id, newStatus, actorId, req) => {
  const challan = await getChallanById(id);
  const allowed = WORKFLOW[challan.status] || [];

  if (!allowed.includes(newStatus)) {
    throw ApiError.badRequest(
      `Cannot transition challan from ${challan.status} to ${newStatus}. Allowed: ${allowed.join(', ') || 'none'}`
    );
  }

  const data = { status: newStatus };
  if (newStatus === 'APPROVED') {
    data.approvedBy = actorId;
    data.approvedAt = new Date();
  }
  if (newStatus === 'PAID') {
    data.paymentStatus = 'SUCCESS';
  }

  const updated = await challanRepository.update(id, data);

  const actionMap = {
    APPROVED: 'CHALLAN_APPROVED',
    REJECTED: 'CHALLAN_REJECTED',
    CLOSED: 'CHALLAN_CLOSED',
    PAID: 'CHALLAN_PAID',
  };

  await recordAudit({
    userId: actorId,
    action: actionMap[newStatus] || 'CHALLAN_UPDATED',
    details: { challanId: id, newStatus },
    req,
  });

  if (newStatus === 'APPROVED') {
    await notifyChallanApproved(updated);
  }

  return updated;
};

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from '../config/env.js';
import prisma from '../config/database.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const addEvidence = async (id, files, actorId, req) => {
  await getChallanById(id);

  const evidences = [];

  if (files.evidenceImage) {
    for (const f of files.evidenceImage) {
      const url = `/uploads/evidence/images/${f.filename}`;
      evidences.push({ type: 'IMAGE', url });

      // Send manual image upload to AI Detections module (with 'UNKNOWN' plate)
      await prisma.modelDetection.create({
        data: {
          plateNumber: 'UNKNOWN',
          violations: '[]',
          snapshotUrl: url,
          status: 'PENDING',
        },
      });
    }
  }

  if (files?.evidenceVideo) {
    files.evidenceVideo.forEach((f) => {
      evidences.push({ type: 'VIDEO', url: `/uploads/${f.filename}` });

      // Spawn ML pipeline for this video
      const videoPath = f.path;
      const scriptPath = path.resolve(__dirname, '../../../ML/Code/model_workflow.py');
      const pythonBin = path.resolve(__dirname, '../../../ML/myvenv/bin/python');
      const apiUrl = `http://localhost:${env.port}/api/v1/challans/${id}/automated-evidence`;
      const token = req.headers.authorization?.split(' ')[1] || '';

      console.log(`Spawning ML pipeline for Challan ${id} video evidence...`);
      const pythonProcess = spawn(pythonBin, [scriptPath, videoPath, apiUrl, token]);

      pythonProcess.stdout.on('data', (data) => console.log(`[Challan ML]: ${data.toString()}`));
      pythonProcess.stderr.on('data', (data) =>
        console.error(`[Challan ML Error]: ${data.toString()}`)
      );
    });
  }

  if (!evidences.length) {
    throw ApiError.badRequest('No valid evidence files provided');
  }

  await challanRepository.addEvidence(id, evidences);
  await recordAudit({
    userId: actorId,
    action: 'CHALLAN_UPDATED',
    details: { challanId: id, evidenceAdded: evidences.length },
    req,
  });

  return getChallanById(id);
};

export const deleteChallan = async (id, actorId, req) => {
  await getChallanById(id);
  await challanRepository.softDelete(id);
  await recordAudit({
    userId: actorId,
    action: 'CHALLAN_DELETED',
    details: { challanId: id },
    req,
  });
};
