import { Router } from 'express';
import * as disputeController from '../controllers/challanDispute.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorizePermissions } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import { PERMISSIONS } from '../constants/permissions.js';
import {
  createDisputeValidator,
  resolveDisputeValidator,
  disputeIdParamValidator,
} from '../validators/challanDispute.validator.js';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /disputes:
 *   post:
 *     tags: [Disputes]
 *     summary: Dispute a violation issued against your own vehicle ("I didn't do it")
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Dispute submitted }
 *   get:
 *     tags: [Disputes]
 *     summary: List disputes (own only, unless Traffic Police/Super Admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Disputes retrieved }
 */
router.post('/', createDisputeValidator, validate, disputeController.createDispute);
router.get('/', disputeController.listDisputes);

/**
 * @openapi
 * /disputes/{id}:
 *   get:
 *     tags: [Disputes]
 *     summary: Get a dispute by ID (own only, unless Traffic Police/Super Admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Dispute retrieved }
 */
router.get('/:id', disputeIdParamValidator, validate, disputeController.getDispute);

/**
 * @openapi
 * /disputes/{id}/uphold:
 *   patch:
 *     tags: [Disputes]
 *     summary: Uphold a dispute - voids the violation and notifies the owner
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Dispute upheld }
 */
router.patch(
  '/:id/uphold',
  authorizePermissions(PERMISSIONS.CHALLAN_UPDATE),
  resolveDisputeValidator,
  validate,
  disputeController.uphold
);

/**
 * @openapi
 * /disputes/{id}/dismiss:
 *   patch:
 *     tags: [Disputes]
 *     summary: Dismiss a dispute - the violation stands, owner is notified
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Dispute dismissed }
 */
router.patch(
  '/:id/dismiss',
  authorizePermissions(PERMISSIONS.CHALLAN_UPDATE),
  resolveDisputeValidator,
  validate,
  disputeController.dismiss
);

export default router;
