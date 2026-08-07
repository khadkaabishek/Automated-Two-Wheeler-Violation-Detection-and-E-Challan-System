import { body, param } from 'express-validator';

export const createDisputeValidator = [
  body('challanId').isUUID().withMessage('A valid violation ID is required'),
  body('reason')
    .trim()
    .notEmpty()
    .withMessage('Please explain why you are disputing this violation')
    .isLength({ max: 1000 }),
];

export const resolveDisputeValidator = [
  param('id').isUUID().withMessage('Invalid dispute ID'),
  body('resolutionNote').optional({ checkFalsy: true }).trim().isLength({ max: 1000 }),
];

export const disputeIdParamValidator = [param('id').isUUID().withMessage('Invalid dispute ID')];
