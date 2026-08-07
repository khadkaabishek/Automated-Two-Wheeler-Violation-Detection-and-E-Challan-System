import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import * as roleService from '../services/role.service.js';

export const listPermissions = asyncHandler(async (req, res) => {
  const permissions = await roleService.listPermissions();
  new ApiResponse(res, 200, 'Permissions retrieved successfully', permissions);
});

export const createRole = asyncHandler(async (req, res) => {
  const role = await roleService.createRole(req.body, req.user.id, req);
  new ApiResponse(res, 201, 'Role created successfully', role);
});

export const listRoles = asyncHandler(async (req, res) => {
  const { roles, meta } = await roleService.listRoles(req.query);
  new ApiResponse(res, 200, 'Roles retrieved successfully', { roles, meta });
});

export const getRole = asyncHandler(async (req, res) => {
  const role = await roleService.getRoleById(req.params.id);
  new ApiResponse(res, 200, 'Role retrieved successfully', role);
});

export const updateRole = asyncHandler(async (req, res) => {
  const role = await roleService.updateRole(req.params.id, req.body, req.user.id, req);
  new ApiResponse(res, 200, 'Role updated successfully', role);
});

export const assignPermissions = asyncHandler(async (req, res) => {
  const role = await roleService.assignPermissions(
    req.params.id,
    req.body.permissionIds,
    req.user.id,
    req
  );
  new ApiResponse(res, 200, 'Permissions assigned successfully', role);
});

export const deleteRole = asyncHandler(async (req, res) => {
  await roleService.deleteRole(req.params.id, req.user.id, req);
  new ApiResponse(res, 200, 'Role deleted successfully', null);
});
