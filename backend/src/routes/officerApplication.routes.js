import { Router } from 'express';
import * as officerApplicationController from '../controllers/officerApplication.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorizeRoles } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import { ROLES } from '../constants/roles.js';
import {
  createApplicationValidator,
  rejectApplicationValidator,
  applicationIdParamValidator,
} from '../validators/officerApplication.validator.js';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /officer-applications:
 *   post:
 *     tags: [Officer Applications]
 *     summary: Apply to become a Traffic Police officer (any authenticated non-staff user)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Application submitted }
 *   get:
 *     tags: [Officer Applications]
 *     summary: List applications (own only, unless Admin/Super Admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Applications retrieved }
 */
router.post(
  '/',
  createApplicationValidator,
  validate,
  officerApplicationController.createApplication
);
router.get('/', officerApplicationController.listApplications);

/**
 * @openapi
 * /officer-applications/{id}:
 *   get:
 *     tags: [Officer Applications]
 *     summary: Get an application by ID (own only, unless Admin/Super Admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Application retrieved }
 */
router.get(
  '/:id',
  applicationIdParamValidator,
  validate,
  officerApplicationController.getApplication
);

/**
 * @openapi
 * /officer-applications/{id}/approve:
 *   patch:
 *     tags: [Officer Applications]
 *     summary: Approve an application - promotes the applicant to Traffic Police
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Application approved }
 */
router.patch(
  '/:id/approve',
  authorizeRoles(ROLES.SUPER_ADMIN),
  applicationIdParamValidator,
  validate,
  officerApplicationController.approveApplication
);

/**
 * @openapi
 * /officer-applications/{id}/reject:
 *   patch:
 *     tags: [Officer Applications]
 *     summary: Reject an application with a reason
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Application rejected }
 */
router.patch(
  '/:id/reject',
  authorizeRoles(ROLES.SUPER_ADMIN),
  rejectApplicationValidator,
  validate,
  officerApplicationController.rejectApplication
);

export default router;
