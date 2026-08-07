import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorizePermissions } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import { PERMISSIONS } from '../constants/permissions.js';
import {
  createPaymentValidator,
  confirmPaymentValidator,
  paymentIdParamValidator,
  rejectPaymentValidator,
} from '../validators/payment.validator.js';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /payments:
 *   post:
 *     tags: [Payments]
 *     summary: Process a payment for an approved challan (CASH/BANK_TRANSFER work now; eSewa/Khalti/Stripe are stubbed for future integration)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Payment processed }
 *   get:
 *     tags: [Payments]
 *     summary: List payments (paginated, filterable)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Payments retrieved }
 */
router.post(
  '/',
  authorizePermissions(PERMISSIONS.PAYMENT_CREATE),
  createPaymentValidator,
  validate,
  paymentController.createPayment
);
router.get('/', authorizePermissions(PERMISSIONS.PAYMENT_READ), paymentController.listPayments);

/**
 * @openapi
 * /payments/{id}:
 *   get:
 *     tags: [Payments]
 *     summary: Get payment by ID
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Payment retrieved }
 */
router.get(
  '/:id',
  authorizePermissions(PERMISSIONS.PAYMENT_READ),
  paymentIdParamValidator,
  validate,
  paymentController.getPayment
);

/**
 * @openapi
 * /payments/confirm:
 *   post:
 *     tags: [Payments]
 *     summary: Confirm/fail a pending payment (webhook target for async gateways)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Payment status updated }
 */
router.post(
  '/confirm',
  authorizePermissions(PERMISSIONS.PAYMENT_UPDATE),
  confirmPaymentValidator,
  validate,
  paymentController.confirmPayment
);

/**
 * @openapi
 * /payments/{id}/approve:
 *   patch:
 *     tags: [Payments]
 *     summary: Approve a pending payment request - marks the violation paid and notifies the owner
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Payment approved }
 */
router.patch(
  '/:id/approve',
  authorizePermissions(PERMISSIONS.PAYMENT_UPDATE),
  paymentIdParamValidator,
  validate,
  paymentController.approvePayment
);

/**
 * @openapi
 * /payments/{id}/reject:
 *   patch:
 *     tags: [Payments]
 *     summary: Reject a pending payment request with a reason
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Payment rejected }
 */
router.patch(
  '/:id/reject',
  authorizePermissions(PERMISSIONS.PAYMENT_UPDATE),
  rejectPaymentValidator,
  validate,
  paymentController.rejectPayment
);

export default router;
