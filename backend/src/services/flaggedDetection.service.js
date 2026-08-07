import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import flaggedDetectionRepository from '../repositories/flaggedDetection.repository.js';
import * as aiDetectionService from './aiDetection.service.js';
import ApiError from '../utils/ApiError.js';
import { getPagination, buildPaginationMeta, getSorting } from '../utils/pagination.js';
import { recordAudit } from './audit.service.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const flaggedDir = path.join(__dirname, '..', 'uploads', 'flagged');
fs.mkdirSync(flaggedDir, { recursive: true });

const saveBuffer = (buffer, ext) => {
  const filename = `${uuidv4()}${ext}`;
  fs.writeFileSync(path.join(flaggedDir, filename), buffer);
  return `/uploads/flagged/${filename}`;
};

const saveBase64Png = (base64) => saveBuffer(Buffer.from(base64, 'base64'), '.png');

/**
 * Shared by both the photo and video paths: given one screening result that
 * already cleared the "confident two-wheeler violation" bar, saves the
 * evidence image + plate crops to disk and creates the PENDING_REVIEW
 * queue record.
 */
const _createDetectionRecord = async ({
  actorId,
  result,
  imageBuffer,
  imageExt,
  sourceType,
  frameTimestampSec,
  req,
}) => {
  const evidenceImagePath = saveBuffer(imageBuffer, imageExt);
  const platePreviewPaths = (result.platePreviewsBase64 || []).map(saveBase64Png);

  const twoWheelerDetection = result.vehicleDetections.find((d) =>
    ['motorcycle', 'scooter'].includes(d.label)
  );
  const violationDetection = result.helmetDetections.find((d) => d.label === 'no_helmet');

  const detection = await flaggedDetectionRepository.create({
    submittedById: actorId,
    vehicleType: twoWheelerDetection?.label || 'unknown',
    violationLabel: result.suggestedViolations[0],
    confidence: violationDetection?.confidence ?? 0,
    evidenceImagePath,
    platePreviewPaths,
    sourceType,
    frameTimestampSec: frameTimestampSec ?? null,
  });

  await recordAudit({
    userId: actorId,
    action: 'CHALLAN_UPDATED',
    details: { flaggedDetectionId: detection.id, type: 'flagged_detection_created', sourceType },
    req,
  });

  return detection;
};

/**
 * Runs an uploaded photo through the staged screening pipeline
 * (vehicle-type -> helmet -> plate, see ml-service). If it's a two-wheeler
 * with a confident violation, saves the evidence + plate crops to disk and
 * creates a PENDING_REVIEW queue item for a Traffic Police / Super Admin
 * officer to convert into an actual violation or dismiss. If the photo
 * isn't a two-wheeler or shows no confident violation, nothing is saved —
 * there's nothing to review.
 */
export const submitForScreening = async (actorId, fileBuffer, originalName, mimetype, req) => {
  const result = await aiDetectionService.screenImage(fileBuffer, originalName, mimetype);

  if (!result.isTwoWheeler || result.suggestedViolations.length === 0) {
    return { flagged: false, screenResult: result };
  }

  // Use the annotated (bounding-boxes-drawn) image as the evidence record,
  // not the raw upload — a reviewing officer should see exactly what the
  // model flagged, not have to re-derive it from raw coordinates.
  const annotatedBuffer = result.annotatedImageBase64
    ? Buffer.from(result.annotatedImageBase64, 'base64')
    : fileBuffer;
  const imageExt = result.annotatedImageBase64 ? '.jpg' : mimetype === 'image/png' ? '.png' : '.jpg';

  const detection = await _createDetectionRecord({
    actorId,
    result,
    imageBuffer: annotatedBuffer,
    imageExt,
    sourceType: 'photo',
    req,
  });

  return { flagged: true, detection, screenResult: result };
};

/**
 * Runs an uploaded video through the staged screening pipeline. The ML
 * service samples frames across the whole video and returns only the ones
 * that produced a confident violation, each with its own captured frame —
 * this creates one PENDING_REVIEW queue record per violation frame found,
 * each tagged with the timestamp in the video it came from.
 */
export const submitVideoForScreening = async (actorId, fileBuffer, originalName, mimetype, req) => {
  const result = await aiDetectionService.screenVideo(fileBuffer, originalName, mimetype);

  const detections = [];
  for (const hit of result.violations || []) {
    if (!hit.isTwoWheeler || !hit.suggestedViolations?.length) continue;

    const frameBuffer = Buffer.from(hit.frameBase64, 'base64');
    const detection = await _createDetectionRecord({
      actorId,
      result: hit,
      imageBuffer: frameBuffer,
      imageExt: '.jpg',
      sourceType: 'video',
      frameTimestampSec: hit.timestampSec,
      req,
    });
    detections.push(detection);
  }

  return {
    flagged: detections.length > 0,
    detections,
    durationSec: result.durationSec,
    framesSampled: result.framesSampled,
    truncated: result.truncated,
  };
};

export const listFlaggedDetections = async (query) => {
  const { page, limit, skip, take } = getPagination(query);
  const orderBy = getSorting(query, ['createdAt', 'status'], 'createdAt');

  const where = {};
  if (query.status) where.status = query.status;

  const [detections, total] = await Promise.all([
    flaggedDetectionRepository.findMany({ where, skip, take, orderBy }),
    flaggedDetectionRepository.count(where),
  ]);

  return { detections, meta: buildPaginationMeta(total, page, limit) };
};

export const getFlaggedDetectionById = async (id) => {
  const detection = await flaggedDetectionRepository.findById(id);
  if (!detection) throw ApiError.notFound('Flagged detection not found');
  return detection;
};

export const dismissFlaggedDetection = async (id, actorId, req) => {
  const detection = await getFlaggedDetectionById(id);
  if (detection.status !== 'PENDING_REVIEW') {
    throw ApiError.badRequest('Only pending items can be dismissed');
  }

  const updated = await flaggedDetectionRepository.update(id, {
    status: 'DISMISSED',
    reviewedBy: actorId,
    reviewedAt: new Date(),
  });

  await recordAudit({
    userId: actorId,
    action: 'CHALLAN_UPDATED',
    details: { flaggedDetectionId: id, type: 'flagged_detection_dismissed' },
    req,
  });

  return updated;
};

/**
 * Called from challan.service.js when a challan is created with a
 * flaggedDetectionId — links the two records and marks the queue item
 * resolved. Never called directly from a route.
 */
export const markConverted = async (id, challanId, actorId) => {
  const detection = await flaggedDetectionRepository.findById(id);
  if (!detection) throw ApiError.badRequest('Invalid flagged detection ID');
  if (detection.status !== 'PENDING_REVIEW') {
    throw ApiError.badRequest('This flagged detection has already been reviewed');
  }

  return flaggedDetectionRepository.update(id, {
    status: 'CONVERTED',
    challanId,
    reviewedBy: actorId,
    reviewedAt: new Date(),
  });
};
