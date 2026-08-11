import { Router } from 'express';
import * as aiDetectionController from '../controllers/aiDetection.controller.js';
import { authenticate } from '../middlewares/authenticate.js';

import { authorizePermissions } from '../middlewares/authorize.js';
import { upload } from '../middlewares/upload.js';
import { PERMISSIONS } from '../constants/permissions.js';

const router = Router();

/**
 * @openapi
 * /ai-detection/status:
 *   get:
 *     tags: [AI Detection]
 *     summary: Status of the planned automatic violation-detection integration
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Status retrieved }
 */
router.get('/status', authenticate, aiDetectionController.getStatus);

/**
 * @openapi
 * /ai-detection/stream/{jobId}:
 *   get:
 *     tags: [AI Detection]
 *     summary: Real-time ML processing logs via Server-Sent Events (SSE)
 *     security: [{ bearerAuth: [] }]
 */
router.get('/stream/:jobId', authenticate, aiDetectionController.streamLogs);

/**
 * @openapi
 * /ai-detection/upload-video:
 *   post:
 *     tags: [AI Detection]
 *     summary: Upload video for AI processing testing
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Video uploaded successfully }
 */
router.post(
  '/upload-video',
  authenticate,
  authorizePermissions(PERMISSIONS.LIVE_MONITORING_CREATE),
  upload.single('media'),
  aiDetectionController.uploadVideo
);

/**
 * @openapi
 * /ai-detection/automated-violation:
 *   post:
 *     tags: [AI Detection]
 *     summary: Receive automated violation from ML model
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Draft challan created }
 */
router.post(
  '/automated-violation',
  upload.single('evidenceImage'),
  aiDetectionController.receiveAutomatedViolation
);

/**
 * @openapi
 * /ai-detection/detections:
 *   get:
 *     tags: [AI Detection]
 *     summary: List all raw model detections
 *     security: [{ bearerAuth: [] }]
 */
router.get(
  '/detections',
  authenticate,
  authorizePermissions(PERMISSIONS.LIVE_MONITORING_READ),
  aiDetectionController.listDetections
);

/**
 * @openapi
 * /ai-detection/detections/{id}:
 *   patch:
 *     tags: [AI Detection]
 *     summary: Update model detection status
 *     security: [{ bearerAuth: [] }]
 */
router.patch(
  '/detections/:id',
  authenticate,
  authorizePermissions(PERMISSIONS.LIVE_MONITORING_CREATE),
  aiDetectionController.updateDetectionStatus
);

/**
 * @openapi
 * /ai-detection/detections/discard-all:
 *   post:
 *     tags: [AI Detection]
 *     summary: Discard all pending model detections
 *     security: [{ bearerAuth: [] }]
 */
router.post(
  '/detections/discard-all',
  authenticate,
  authorizePermissions(PERMISSIONS.LIVE_MONITORING_CREATE),
  aiDetectionController.discardAllDetections
);

export default router;
