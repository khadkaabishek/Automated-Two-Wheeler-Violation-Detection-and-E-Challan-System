import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/authenticate.js';
import { authorizePermissions } from '../middlewares/authorize.js';
import { validate } from '../middlewares/validate.js';
import { upload } from '../middlewares/upload.js';
import { PERMISSIONS } from '../constants/permissions.js';
import {
  createUserValidator,
  updateUserValidator,
  userIdParamValidator,
  listUsersValidator,
} from '../validators/user.validator.js';

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /users:
 *   post:
 *     tags: [Users]
 *     summary: Create a new user (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: User created }
 *   get:
 *     tags: [Users]
 *     summary: List users (paginated, searchable, filterable)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: roleId
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc] }
 *     responses:
 *       200: { description: Users retrieved }
 */
router.post(
  '/',
  authorizePermissions(PERMISSIONS.USER_CREATE),
  createUserValidator,
  validate,
  userController.createUser
);
router.get(
  '/',
  authorizePermissions(PERMISSIONS.USER_READ),
  listUsersValidator,
  validate,
  userController.listUsers
);

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by ID
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: User retrieved }
 *   patch:
 *     tags: [Users]
 *     summary: Update user
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: User updated }
 *   delete:
 *     tags: [Users]
 *     summary: Soft delete user
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: User deleted }
 */
router.get(
  '/:id',
  authorizePermissions(PERMISSIONS.USER_READ),
  userIdParamValidator,
  validate,
  userController.getUser
);
router.patch(
  '/:id',
  authorizePermissions(PERMISSIONS.USER_UPDATE),
  updateUserValidator,
  validate,
  userController.updateUser
);
router.delete(
  '/:id',
  authorizePermissions(PERMISSIONS.USER_DELETE),
  userIdParamValidator,
  validate,
  userController.deleteUser
);

/**
 * @openapi
 * /users/{id}/activate:
 *   patch:
 *     tags: [Users]
 *     summary: Activate a user account
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: User activated }
 */
router.patch(
  '/:id/activate',
  authorizePermissions(PERMISSIONS.USER_UPDATE),
  userIdParamValidator,
  validate,
  userController.activateUser
);

/**
 * @openapi
 * /users/{id}/deactivate:
 *   patch:
 *     tags: [Users]
 *     summary: Deactivate a user account
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: User deactivated }
 */
router.patch(
  '/:id/deactivate',
  authorizePermissions(PERMISSIONS.USER_UPDATE),
  userIdParamValidator,
  validate,
  userController.deactivateUser
);

/**
 * @openapi
 * /users/{id}/avatar:
 *   post:
 *     tags: [Users]
 *     summary: Upload/replace a user's avatar image
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar: { type: string, format: binary }
 *     responses:
 *       200: { description: Avatar uploaded }
 */
router.post(
  '/:id/avatar',
  authorizePermissions(PERMISSIONS.USER_UPDATE),
  userIdParamValidator,
  validate,
  upload.single('avatar'),
  userController.uploadAvatar
);

export default router;
