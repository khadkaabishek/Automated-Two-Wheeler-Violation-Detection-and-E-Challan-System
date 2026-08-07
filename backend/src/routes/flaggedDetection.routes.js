import { Router } from 'express';
import * as flaggedDetectionController from '../controllers/flaggedDetection.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorizePermissions } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import { analyzeUpload, videoAnalyzeUpload } from '../middlewares/upload.js';
import { PERMISSIONS } from '../constants/permissions.js';
import { flaggedDetectionIdParamValidator } from '../validators/flaggedDetection.validator.js';

const router = Router();

router.use(authenticate, authorizePermissions(PERMISSIONS.CHALLAN_CREATE));

/**
 * @openapi
 * /flagged-detections:
 *   post:
 *     tags: [Flagged Detections]
 *     summary: Submit a photo to the staged screening pipeline (vehicle-type -> helmet -> plate)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image: { type: string, format: binary }
 *     responses:
 *       201: { description: Violation flagged for review }
 *       200: { description: Not eligible / no violation found — nothing was saved }
 *   get:
 *     tags: [Flagged Detections]
 *     summary: List the officer review queue
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Flagged detections retrieved }
 */
router.post('/', analyzeUpload, flaggedDetectionController.submit);
router.get('/', flaggedDetectionController.list);

/**
 * @openapi
 * /flagged-detections/video:
 *   post:
 *     tags: [Flagged Detections]
 *     summary: Submit a video to the staged screening pipeline - samples frames across its duration
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               video: { type: string, format: binary }
 *     responses:
 *       201: { description: One or more violations found and flagged for review }
 *       200: { description: No violations found in this video — nothing was saved }
 */
router.post('/video', videoAnalyzeUpload, flaggedDetectionController.submitVideo);

/**
 * @openapi
 * /flagged-detections/{id}:
 *   get:
 *     tags: [Flagged Detections]
 *     summary: Get a flagged detection by ID
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Flagged detection retrieved }
 */
router.get('/:id', flaggedDetectionIdParamValidator, validate, flaggedDetectionController.get);

/**
 * @openapi
 * /flagged-detections/{id}/dismiss:
 *   patch:
 *     tags: [Flagged Detections]
 *     summary: Dismiss a flagged detection as a false positive / not actionable
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Flagged detection dismissed }
 */
router.patch(
  '/:id/dismiss',
  flaggedDetectionIdParamValidator,
  validate,
  flaggedDetectionController.dismiss
);

export default router;
