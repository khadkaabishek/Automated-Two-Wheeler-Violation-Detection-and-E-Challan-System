import { Router } from 'express';
import * as roleController from '../controllers/role.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorizePermissions } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import { PERMISSIONS } from '../constants/permissions.js';
import {
  createRoleValidator,
  updateRoleValidator,
  assignPermissionsValidator,
  roleIdParamValidator,
} from '../validators/role.validator.js';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /roles/permissions:
 *   get:
 *     tags: [Roles]
 *     summary: List all available permissions
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Permissions retrieved }
 */
router.get(
  '/permissions',
  authorizePermissions(PERMISSIONS.ROLE_READ),
  roleController.listPermissions
);

/**
 * @openapi
 * /roles:
 *   post:
 *     tags: [Roles]
 *     summary: Create a new role
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Role created }
 *   get:
 *     tags: [Roles]
 *     summary: List roles (paginated, searchable)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Roles retrieved }
 */
router.post(
  '/',
  authorizePermissions(PERMISSIONS.ROLE_CREATE),
  createRoleValidator,
  validate,
  roleController.createRole
);
router.get('/', authorizePermissions(PERMISSIONS.ROLE_READ), roleController.listRoles);

/**
 * @openapi
 * /roles/{id}:
 *   get:
 *     tags: [Roles]
 *     summary: Get role by ID
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Role retrieved }
 *   patch:
 *     tags: [Roles]
 *     summary: Update role
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Role updated }
 *   delete:
 *     tags: [Roles]
 *     summary: Soft delete role
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Role deleted }
 */
router.get(
  '/:id',
  authorizePermissions(PERMISSIONS.ROLE_READ),
  roleIdParamValidator,
  validate,
  roleController.getRole
);
router.patch(
  '/:id',
  authorizePermissions(PERMISSIONS.ROLE_UPDATE),
  updateRoleValidator,
  validate,
  roleController.updateRole
);
router.delete(
  '/:id',
  authorizePermissions(PERMISSIONS.ROLE_DELETE),
  roleIdParamValidator,
  validate,
  roleController.deleteRole
);

/**
 * @openapi
 * /roles/{id}/permissions:
 *   put:
 *     tags: [Roles]
 *     summary: Replace a role's assigned permissions
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Permissions assigned }
 */
router.put(
  '/:id/permissions',
  authorizePermissions(PERMISSIONS.ROLE_UPDATE),
  assignPermissionsValidator,
  validate,
  roleController.assignPermissions
);

export default router;
