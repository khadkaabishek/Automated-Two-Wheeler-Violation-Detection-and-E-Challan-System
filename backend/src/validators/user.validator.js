import { body, param, query } from 'express-validator';

export const createUserValidator = [
  body('fullName').trim().notEmpty().withMessage('Full name is required').isLength({ max: 150 }),
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^\+?[0-9]{7,15}$/)
    .withMessage('Phone number must be valid'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('roleId').isUUID().withMessage('A valid roleId is required'),
  body('status').optional({ checkFalsy: true }).isIn(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
];

export const updateUserValidator = [
  param('id').isUUID().withMessage('Invalid user ID'),
  body('fullName').optional({ checkFalsy: true }).trim().isLength({ max: 150 }),
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^\+?[0-9]{7,15}$/)
    .withMessage('Phone number must be valid'),
  body('roleId').optional({ checkFalsy: true }).isUUID().withMessage('Invalid roleId'),
];

export const userIdParamValidator = [param('id').isUUID().withMessage('Invalid user ID')];

export const listUsersValidator = [
  query('page').optional({ checkFalsy: true }).isInt({ min: 1 }),
  query('limit').optional({ checkFalsy: true }).isInt({ min: 1, max: 100 }),
  query('roleId').optional({ checkFalsy: true }).isUUID(),
  query('status').optional({ checkFalsy: true }).isIn(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
];
