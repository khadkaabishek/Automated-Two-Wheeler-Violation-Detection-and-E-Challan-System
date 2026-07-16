import { Router } from 'express';
import * as vehicleController from '../controllers/vehicle.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorizePermissions } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import { upload } from '../middlewares/upload.js';
import { PERMISSIONS } from '../constants/permissions.js';
import {
  createVehicleValidator,
  updateVehicleValidator,
  setVehicleStatusValidator,
  vehicleIdParamValidator,
} from '../validators/vehicle.validator.js';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /vehicles:
 *   post:
 *     tags: [Vehicles]
 *     summary: Register a new vehicle
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Vehicle created }
 *   get:
 *     tags: [Vehicles]
 *     summary: List vehicles (paginated, searchable, filterable)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Vehicles retrieved }
 */
router.post(
  '/',
  authorizePermissions(PERMISSIONS.VEHICLE_CREATE),
  createVehicleValidator,
  validate,
  vehicleController.createVehicle
);
router.get('/', authorizePermissions(PERMISSIONS.VEHICLE_READ), vehicleController.listVehicles);

/**
 * @openapi
 * /vehicles/{id}:
 *   get:
 *     tags: [Vehicles]
 *     summary: Get vehicle by ID
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Vehicle retrieved }
 *   patch:
 *     tags: [Vehicles]
 *     summary: Update vehicle
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Vehicle updated }
 *   delete:
 *     tags: [Vehicles]
 *     summary: Soft delete vehicle
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Vehicle deleted }
 */
router.get(
  '/:id',
  authorizePermissions(PERMISSIONS.VEHICLE_READ),
  vehicleIdParamValidator,
  validate,
  vehicleController.getVehicle
);
router.patch(
  '/:id',
  authorizePermissions(PERMISSIONS.VEHICLE_UPDATE),
  updateVehicleValidator,
  validate,
  vehicleController.updateVehicle
);
router.delete(
  '/:id',
  authorizePermissions(PERMISSIONS.VEHICLE_DELETE),
  vehicleIdParamValidator,
  validate,
  vehicleController.deleteVehicle
);

/**
 * @openapi
 * /vehicles/{id}/status:
 *   patch:
 *     tags: [Vehicles]
 *     summary: Change vehicle status (Active/Inactive/Impounded/Blacklisted)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Vehicle status updated }
 */
router.patch(
  '/:id/status',
  authorizePermissions(PERMISSIONS.VEHICLE_UPDATE),
  setVehicleStatusValidator,
  validate,
  vehicleController.setVehicleStatus
);

/**
 * @openapi
 * /vehicles/{id}/approve:
 *   patch:
 *     tags: [Vehicles]
 *     summary: Approve a pending vehicle registration (PENDING_APPROVAL -> ACTIVE)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Registration approved }
 */
router.patch(
  '/:id/approve',
  authorizePermissions(PERMISSIONS.VEHICLE_UPDATE),
  vehicleIdParamValidator,
  validate,
  vehicleController.approveRegistration
);

/**
 * @openapi
 * /vehicles/{id}/reject:
 *   patch:
 *     tags: [Vehicles]
 *     summary: Reject a pending vehicle registration (PENDING_APPROVAL -> INACTIVE)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Registration rejected }
 */
router.patch(
  '/:id/reject',
  authorizePermissions(PERMISSIONS.VEHICLE_UPDATE),
  vehicleIdParamValidator,
  validate,
  vehicleController.rejectRegistration
);

/**
 * @openapi
 * /vehicles/{id}/image:
 *   post:
 *     tags: [Vehicles]
 *     summary: Upload/replace vehicle image
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               vehicleImage: { type: string, format: binary }
 *     responses:
 *       200: { description: Vehicle image uploaded }
 */
router.post(
  '/:id/image',
  authorizePermissions(PERMISSIONS.VEHICLE_UPDATE),
  vehicleIdParamValidator,
  validate,
  upload.single('vehicleImage'),
  vehicleController.uploadVehicleImage
);

export default router;
