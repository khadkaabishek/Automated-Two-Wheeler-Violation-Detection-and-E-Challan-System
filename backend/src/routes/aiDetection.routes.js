import { Router } from 'express';
import * as aiDetectionController from '../controllers/aiDetection.controller.js';
import { authenticate } from '../middlewares/authenticate.js';

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

export default router;
