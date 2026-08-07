import { Router } from 'express';
import * as aiDetectionController from '../controllers/aiDetection.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorizePermissions } from '../middlewares/authorize.js';
import { analyzeUpload } from '../middlewares/upload.js';
import { PERMISSIONS } from '../constants/permissions.js';

import { authorizePermissions } from '../middlewares/authorize.js';
import { upload } from '../middlewares/upload.js';
import { PERMISSIONS } from '../constants/permissions.js';

const router = Router();

/**
 * @openapi
 * /ai-detection/status:
 *   get:
 *     tags: [AI Detection]
 *     summary: Live status of the remote helmet/plate detection service
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
  upload.single('evidenceVideo'),
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
  authenticate,
  authorizePermissions(PERMISSIONS.LIVE_MONITORING_CREATE),
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
  aiDetectionController.updateDetection
);

export default router;
