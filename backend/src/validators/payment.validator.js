import { body, param } from 'express-validator';

export const createPaymentValidator = [
  body('challanId').isUUID().withMessage('A valid violation ID is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
  body('paymentMethod')
    .isIn(['CASH', 'ESEWA', 'KHALTI', 'STRIPE', 'BANK_TRANSFER'])
    .withMessage('Invalid payment method'),
];

export const confirmPaymentValidator = [
  body('transactionId').notEmpty().withMessage('transactionId is required'),
  body('status').isIn(['SUCCESS', 'FAILED', 'REFUNDED']).withMessage('Invalid status'),
];

export const paymentIdParamValidator = [param('id').isUUID().withMessage('Invalid payment ID')];

export const rejectPaymentValidator = [
  param('id').isUUID().withMessage('Invalid payment ID'),
  body('reason').trim().notEmpty().withMessage('A rejection reason is required'),
];
