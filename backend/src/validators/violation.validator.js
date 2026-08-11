import { body, param } from 'express-validator';

export const createViolationValidator = [
  body('name').trim().notEmpty().withMessage('Violation name is required').isLength({ max: 150 }),
  body('description').optional({ checkFalsy: true }).trim().isLength({ max: 1000 }),
  body('fineAmount').isFloat({ min: 0 }).withMessage('Fine amount must be a positive number'),
  body('isActive').optional({ checkFalsy: true }).isBoolean(),
];

export const updateViolationValidator = [
  param('id').isUUID().withMessage('Invalid violation ID'),
  body('name').optional({ checkFalsy: true }).trim().isLength({ max: 150 }),
  body('description').optional({ checkFalsy: true }).trim().isLength({ max: 1000 }),
  body('fineAmount')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage('Fine amount must be a positive number'),
  body('isActive').optional({ checkFalsy: true }).isBoolean(),
];

export const violationIdParamValidator = [param('id').isUUID().withMessage('Invalid violation ID')];
