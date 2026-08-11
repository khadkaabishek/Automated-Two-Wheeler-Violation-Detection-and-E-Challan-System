import { body, param } from 'express-validator';

export const createVehicleValidator = [
  body('vehicleNumber').trim().notEmpty().withMessage('Vehicle number is required'),
  body('vehicleType').trim().notEmpty().withMessage('Vehicle type is required'),
  body('brand').trim().notEmpty().withMessage('Brand is required'),
  body('model').trim().notEmpty().withMessage('Model is required'),
  body('color').trim().notEmpty().withMessage('Color is required'),
  body('registrationNumber').trim().notEmpty().withMessage('Registration number is required'),
  body('registrationDate').isISO8601().withMessage('A valid registration date is required'),
  body('insuranceExpiry').isISO8601().withMessage('A valid insurance expiry date is required'),
  body('bluebookNumber').trim().notEmpty().withMessage('Bluebook number is required'),
  // Optional: staff supply the owner explicitly; vehicle owners registering their own
  // vehicle have it derived server-side from their linked profile instead.
  body('ownerId')
    .optional({ checkFalsy: true })
    .isUUID()
    .withMessage('A valid owner ID is required'),
  body('status')
    .optional({ checkFalsy: true })
    .isIn(['PENDING_APPROVAL', 'ACTIVE', 'INACTIVE', 'IMPOUNDED', 'BLACKLISTED']),
];

export const updateVehicleValidator = [
  param('id').isUUID().withMessage('Invalid vehicle ID'),
  body('vehicleType').optional({ checkFalsy: true }).trim().notEmpty(),
  body('brand').optional({ checkFalsy: true }).trim().notEmpty(),
  body('model').optional({ checkFalsy: true }).trim().notEmpty(),
  body('color').optional({ checkFalsy: true }).trim().notEmpty(),
  body('registrationDate').optional({ checkFalsy: true }).isISO8601(),
  body('insuranceExpiry').optional({ checkFalsy: true }).isISO8601(),
];

export const setVehicleStatusValidator = [
  param('id').isUUID().withMessage('Invalid vehicle ID'),
  body('status')
    .isIn(['PENDING_APPROVAL', 'ACTIVE', 'INACTIVE', 'IMPOUNDED', 'BLACKLISTED'])
    .withMessage('Invalid vehicle status'),
];

export const vehicleIdParamValidator = [param('id').isUUID().withMessage('Invalid vehicle ID')];
