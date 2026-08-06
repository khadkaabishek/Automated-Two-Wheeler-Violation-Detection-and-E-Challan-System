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

export default router;
