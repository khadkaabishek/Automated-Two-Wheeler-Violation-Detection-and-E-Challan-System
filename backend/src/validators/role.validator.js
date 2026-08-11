import { body, param } from 'express-validator';

export const createRoleValidator = [
  body('name').trim().notEmpty().withMessage('Role name is required').isLength({ max: 100 }),
  body('description').optional({ checkFalsy: true }).trim().isLength({ max: 500 }),
  body('permissionIds')
    .optional({ checkFalsy: true })
    .isArray()
    .withMessage('permissionIds must be an array'),
  body('permissionIds.*')
    .optional({ checkFalsy: true })
    .isUUID()
    .withMessage('Each permission ID must be a valid UUID'),
];

export const updateRoleValidator = [
  param('id').isUUID().withMessage('Invalid role ID'),
  body('name').optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
  body('description').optional({ checkFalsy: true }).trim().isLength({ max: 500 }),
];

export const assignPermissionsValidator = [
  param('id').isUUID().withMessage('Invalid role ID'),
  body('permissionIds').isArray({ min: 0 }).withMessage('permissionIds must be an array'),
  body('permissionIds.*').isUUID().withMessage('Each permission ID must be a valid UUID'),
];

export const roleIdParamValidator = [param('id').isUUID().withMessage('Invalid role ID')];
