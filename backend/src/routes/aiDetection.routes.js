import { Router } from 'express';
import * as aiDetectionController from '../controllers/aiDetection.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorizePermissions } from '../middlewares/authorize.js';
import { analyzeUpload } from '../middlewares/upload.js';
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
 * /ai-detection/analyze:
 *   post:
 *     tags: [AI Detection]
 *     summary: Run an uploaded photo through the remote model for suggested violations
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image: { type: string, format: binary }
 *     responses:
 *       200: { description: Analysis result }
 */
router.post(
  '/analyze',
  authenticate,
  authorizePermissions(PERMISSIONS.CHALLAN_CREATE),
  analyzeUpload,
  aiDetectionController.analyze
);

export default router;
