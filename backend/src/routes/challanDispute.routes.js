import { Router } from 'express';
import * as disputeController from '../controllers/challanDispute.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorizePermissions } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import { PERMISSIONS } from '../constants/permissions.js';
import { evidenceUpload } from '../middlewares/upload.js';
import {
  createDisputeValidator,
  resolveDisputeValidator,
  disputeIdParamValidator,
} from '../validators/challanDispute.validator.js';

const router = Router();

router.use(authenticate);

router.post('/', createDisputeValidator, validate, disputeController.createDispute);
router.get('/', disputeController.listDisputes);

router.get('/:id', disputeIdParamValidator, validate, disputeController.getDispute);

/**
 * POST /disputes/:id/evidence
 * Citizen uploads supporting evidence (images / videos) for a pending dispute.
 */
router.post(
  '/:id/evidence',
  evidenceUpload,
  disputeController.uploadDisputeEvidence
);

router.patch(
  '/:id/uphold',
  authorizePermissions(PERMISSIONS.CHALLAN_UPDATE),
  resolveDisputeValidator,
  validate,
  disputeController.uphold
);

router.patch(
  '/:id/dismiss',
  authorizePermissions(PERMISSIONS.CHALLAN_UPDATE),
  resolveDisputeValidator,
  validate,
  disputeController.dismiss
);

export default router;
