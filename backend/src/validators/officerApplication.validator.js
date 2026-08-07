import { body, param } from 'express-validator';

export const createApplicationValidator = [
  body('message').optional({ checkFalsy: true }).trim().isLength({ max: 1000 }),
  body('desiredStation').optional({ checkFalsy: true }).trim().isLength({ max: 150 }),
];

export const rejectApplicationValidator = [
  param('id').isUUID().withMessage('Invalid application ID'),
  body('reason').trim().notEmpty().withMessage('A rejection reason is required'),
];

export const applicationIdParamValidator = [param('id').isUUID().withMessage('Invalid application ID')];
