import { body, param } from 'express-validator';

export const createChallanValidator = [
  body('vehicleId').isUUID().withMessage('A valid vehicle ID is required'),
  body('violationIds').isArray({ min: 1 }).withMessage('At least one violation ID is required'),
  body('violationIds.*').isUUID().withMessage('Each violation ID must be a valid UUID'),
  body('description').optional({ checkFalsy: true }).trim().isLength({ max: 1000 }),
  body('gpsLatitude').optional({ checkFalsy: true }).isFloat({ min: -90, max: 90 }),
  body('gpsLongitude').optional({ checkFalsy: true }).isFloat({ min: -180, max: 180 }),
  body('address').optional({ checkFalsy: true }).trim().isLength({ max: 500 }),
  body('incidentDate').isISO8601().withMessage('A valid incident date is required'),
  body('incidentTime')
    .trim()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('incidentTime must be in HH:mm 24-hour format'),
  body('flaggedDetectionId').optional({ checkFalsy: true }).isUUID(),
];

export const updateChallanValidator = [
  param('id').isUUID().withMessage('Invalid violation ID'),
  body('description').optional({ checkFalsy: true }).trim().isLength({ max: 1000 }),
  body('address').optional({ checkFalsy: true }).trim().isLength({ max: 500 }),
];

export const challanIdParamValidator = [param('id').isUUID().withMessage('Invalid violation ID')];
