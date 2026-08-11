import { Router } from 'express';
import * as violationController from '../controllers/violation.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorizePermissions } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import { PERMISSIONS } from '../constants/permissions.js';
import {
  createViolationValidator,
  updateViolationValidator,
  violationIdParamValidator,
} from '../validators/violation.validator.js';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /violations:
 *   post:
 *     tags: [Violations]
 *     summary: Create a violation category
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Violation created }
 *   get:
 *     tags: [Violations]
 *     summary: List violation categories
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Violations retrieved }
 */
router.post(
  '/',
  authorizePermissions(PERMISSIONS.VIOLATION_CREATE),
  createViolationValidator,
  validate,
  violationController.createViolation
);
router.get(
  '/',
  authorizePermissions(PERMISSIONS.VIOLATION_READ),
  violationController.listViolations
);

/**
 * @openapi
 * /violations/{id}:
 *   get:
 *     tags: [Violations]
 *     summary: Get violation by ID
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Violation retrieved }
 *   patch:
 *     tags: [Violations]
 *     summary: Update violation
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Violation updated }
 *   delete:
 *     tags: [Violations]
 *     summary: Soft delete violation
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Violation deleted }
 */
router.get(
  '/:id',
  authorizePermissions(PERMISSIONS.VIOLATION_READ),
  violationIdParamValidator,
  validate,
  violationController.getViolation
);
router.patch(
  '/:id',
  authorizePermissions(PERMISSIONS.VIOLATION_UPDATE),
  updateViolationValidator,
  validate,
  violationController.updateViolation
);
router.delete(
  '/:id',
  authorizePermissions(PERMISSIONS.VIOLATION_DELETE),
  violationIdParamValidator,
  validate,
  violationController.deleteViolation
);

export default router;
