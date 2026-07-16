import { Router } from 'express';
import * as challanController from '../controllers/challan.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorizePermissions } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import { evidenceUpload } from '../middlewares/upload.js';
import { PERMISSIONS } from '../constants/permissions.js';
import {
  createChallanValidator,
  updateChallanValidator,
  challanIdParamValidator,
} from '../validators/challan.validator.js';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /challans:
 *   post:
 *     tags: [Challans]
 *     summary: Issue a new e-challan (auto-generates challan number and fine amount)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Challan created }
 *   get:
 *     tags: [Challans]
 *     summary: List challans (paginated, searchable, filterable by status/officer/vehicle/date range)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Challans retrieved }
 */
router.post(
  '/',
  authorizePermissions(PERMISSIONS.CHALLAN_CREATE),
  createChallanValidator,
  validate,
  challanController.createChallan
);
router.get('/', authorizePermissions(PERMISSIONS.CHALLAN_READ), challanController.listChallans);

/**
 * @openapi
 * /challans/{id}:
 *   get:
 *     tags: [Challans]
 *     summary: Get challan by ID (includes vehicle, owner, officer, violations, evidence, payments)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Challan retrieved }
 *   patch:
 *     tags: [Challans]
 *     summary: Update challan (only allowed while status is PENDING)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Challan updated }
 *   delete:
 *     tags: [Challans]
 *     summary: Soft delete challan
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Challan deleted }
 */
router.get(
  '/:id',
  authorizePermissions(PERMISSIONS.CHALLAN_READ),
  challanIdParamValidator,
  validate,
  challanController.getChallan
);
router.patch(
  '/:id',
  authorizePermissions(PERMISSIONS.CHALLAN_UPDATE),
  updateChallanValidator,
  validate,
  challanController.updateChallan
);
router.delete(
  '/:id',
  authorizePermissions(PERMISSIONS.CHALLAN_DELETE),
  challanIdParamValidator,
  validate,
  challanController.deleteChallan
);

/**
 * @openapi
 * /challans/{id}/approve:
 *   patch:
 *     tags: [Challans]
 *     summary: Approve a pending challan (PENDING -> APPROVED)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Challan approved }
 */
router.patch(
  '/:id/approve',
  authorizePermissions(PERMISSIONS.CHALLAN_UPDATE),
  challanIdParamValidator,
  validate,
  challanController.approveChallan
);

/**
 * @openapi
 * /challans/{id}/reject:
 *   patch:
 *     tags: [Challans]
 *     summary: Reject a pending challan (PENDING -> REJECTED)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Challan rejected }
 */
router.patch(
  '/:id/reject',
  authorizePermissions(PERMISSIONS.CHALLAN_UPDATE),
  challanIdParamValidator,
  validate,
  challanController.rejectChallan
);

/**
 * @openapi
 * /challans/{id}/close:
 *   patch:
 *     tags: [Challans]
 *     summary: Close a paid challan (PAID -> CLOSED)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Challan closed }
 */
router.patch(
  '/:id/close',
  authorizePermissions(PERMISSIONS.CHALLAN_UPDATE),
  challanIdParamValidator,
  validate,
  challanController.closeChallan
);

/**
 * @openapi
 * /challans/{id}/cancel:
 *   patch:
 *     tags: [Challans]
 *     summary: Cancel a pending or approved challan
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Challan cancelled }
 */
router.patch(
  '/:id/cancel',
  authorizePermissions(PERMISSIONS.CHALLAN_UPDATE),
  challanIdParamValidator,
  validate,
  challanController.cancelChallan
);

/**
 * @openapi
 * /challans/{id}/evidence:
 *   post:
 *     tags: [Challans]
 *     summary: Upload evidence images/videos for a challan
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               evidenceImage:
 *                 type: array
 *                 items: { type: string, format: binary }
 *               evidenceVideo:
 *                 type: array
 *                 items: { type: string, format: binary }
 *     responses:
 *       200: { description: Evidence uploaded }
 */
router.post(
  '/:id/evidence',
  authorizePermissions(PERMISSIONS.CHALLAN_UPDATE),
  challanIdParamValidator,
  validate,
  evidenceUpload,
  challanController.uploadEvidence
);

export default router;
