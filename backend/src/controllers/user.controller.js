import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import * as userService from '../services/user.service.js';

export const createUser = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body, req.user.id, req);
  new ApiResponse(res, 201, 'User created successfully', user);
});

export const listUsers = asyncHandler(async (req, res) => {
  const { users, meta } = await userService.listUsers(req.query);
  new ApiResponse(res, 200, 'Users retrieved successfully', { users, meta });
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  new ApiResponse(res, 200, 'User retrieved successfully', user);
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body, req.user.id, req);
  new ApiResponse(res, 200, 'User updated successfully', user);
});

export const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id, req.user.id, req);
  new ApiResponse(res, 200, 'User deleted successfully', null);
});

export const activateUser = asyncHandler(async (req, res) => {
  const user = await userService.setUserStatus(req.params.id, 'ACTIVE', req.user.id, req);
  new ApiResponse(res, 200, 'User activated successfully', user);
});

export const deactivateUser = asyncHandler(async (req, res) => {
  const user = await userService.setUserStatus(req.params.id, 'INACTIVE', req.user.id, req);
  new ApiResponse(res, 200, 'User deactivated successfully', user);
});

export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest('Avatar file is required');
  }
  const relativePath = `/uploads/avatars/${req.file.filename}`;
  const user = await userService.updateUser(
    req.params.id,
    { avatar: relativePath },
    req.user.id,
    req
  );
  new ApiResponse(res, 200, 'Avatar uploaded successfully', user);
});
