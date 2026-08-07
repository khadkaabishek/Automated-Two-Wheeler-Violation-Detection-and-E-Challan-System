import { param } from 'express-validator';

export const flaggedDetectionIdParamValidator = [
  param('id').isUUID().withMessage('Invalid flagged detection ID'),
];
