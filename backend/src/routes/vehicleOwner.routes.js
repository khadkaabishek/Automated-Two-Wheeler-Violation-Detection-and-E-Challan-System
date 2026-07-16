import { Router } from 'express';
import * as ownerController from '../controllers/vehicleOwner.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorizePermissions } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import { PERMISSIONS } from '../constants/permissions.js';
import {
  createOwnerValidator,
  updateOwnerValidator,
  ownerIdParamValidator,
} from '../validators/vehicleOwner.validator.js';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /owners/me:
 *   get:
 *     tags: [Vehicle Owners]
 *     summary: Get my own owner profile (self-service, any authenticated user)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Profile retrieved (data is null if none exists yet) }
 *   post:
 *     tags: [Vehicle Owners]
 *     summary: Create my own owner profile (self-service)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Profile created }
 *   patch:
 *     tags: [Vehicle Owners]
 *     summary: Update my own owner profile (self-service)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Profile updated }
 */
router.get('/me', ownerController.getMyProfile);
router.post('/me', createOwnerValidator, validate, ownerController.createMyProfile);
router.patch('/me', ownerController.updateMyProfile);

/**
 * @openapi
 * /owners:
 *   post:
 *     tags: [Vehicle Owners]
 *     summary: Register a new vehicle owner
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Owner created }
 *   get:
 *     tags: [Vehicle Owners]
 *     summary: List vehicle owners (paginated, searchable)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Owners retrieved }
 */
router.post(
  '/',
  authorizePermissions(PERMISSIONS.OWNER_CREATE),
  createOwnerValidator,
  validate,
  ownerController.createOwner
);
router.get('/', authorizePermissions(PERMISSIONS.OWNER_READ), ownerController.listOwners);

/**
 * @openapi
 * /owners/{id}:
 *   get:
 *     tags: [Vehicle Owners]
 *     summary: Get owner by ID (includes their vehicles)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Owner retrieved }
 *   patch:
 *     tags: [Vehicle Owners]
 *     summary: Update owner
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Owner updated }
 *   delete:
 *     tags: [Vehicle Owners]
 *     summary: Soft delete owner (blocked if they have registered vehicles)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Owner deleted }
 */
router.get(
  '/:id',
  authorizePermissions(PERMISSIONS.OWNER_READ),
  ownerIdParamValidator,
  validate,
  ownerController.getOwner
);
router.patch(
  '/:id',
  authorizePermissions(PERMISSIONS.OWNER_UPDATE),
  updateOwnerValidator,
  validate,
  ownerController.updateOwner
);
router.delete(
  '/:id',
  authorizePermissions(PERMISSIONS.OWNER_DELETE),
  ownerIdParamValidator,
  validate,
  ownerController.deleteOwner
);

export default router;
