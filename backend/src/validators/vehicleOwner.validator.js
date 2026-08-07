import { body, param } from 'express-validator';

export const createOwnerValidator = [
  body('fullName').trim().notEmpty().withMessage('Full name is required').isLength({ max: 150 }),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('citizenshipNumber').trim().notEmpty().withMessage('Citizenship number is required'),
  body('licenseNumber').trim().notEmpty().withMessage('License number is required'),
  body('phone')
    .trim()
    .matches(/^\+?[0-9]{7,15}$/)
    .withMessage('A valid phone number is required'),
  body('email').optional({ checkFalsy: true }).trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
];

export const updateOwnerValidator = [
  param('id').isUUID().withMessage('Invalid owner ID'),
  body('fullName').optional({ checkFalsy: true }).trim().isLength({ max: 150 }),
  body('address').optional({ checkFalsy: true }).trim().notEmpty(),
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^\+?[0-9]{7,15}$/)
    .withMessage('A valid phone number is required'),
  body('email').optional({ checkFalsy: true }).trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
];

export const ownerIdParamValidator = [param('id').isUUID().withMessage('Invalid owner ID')];
