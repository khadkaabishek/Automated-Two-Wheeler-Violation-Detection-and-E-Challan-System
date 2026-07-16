import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import * as ownerService from '../services/vehicleOwner.service.js';

export const createOwner = asyncHandler(async (req, res) => {
  const owner = await ownerService.createOwner(req.body, req.user.id, req);
  new ApiResponse(res, 201, 'Vehicle owner created successfully', owner);
});

export const listOwners = asyncHandler(async (req, res) => {
  const { owners, meta } = await ownerService.listOwners(req.query);
  new ApiResponse(res, 200, 'Vehicle owners retrieved successfully', { owners, meta });
});

export const getOwner = asyncHandler(async (req, res) => {
  const owner = await ownerService.getOwnerById(req.params.id);
  new ApiResponse(res, 200, 'Vehicle owner retrieved successfully', owner);
});

export const updateOwner = asyncHandler(async (req, res) => {
  const owner = await ownerService.updateOwner(req.params.id, req.body, req.user.id, req);
  new ApiResponse(res, 200, 'Vehicle owner updated successfully', owner);
});

export const deleteOwner = asyncHandler(async (req, res) => {
  await ownerService.deleteOwner(req.params.id, req.user.id, req);
  new ApiResponse(res, 200, 'Vehicle owner deleted successfully', null);
});

// ---- Self-service ----

export const getMyProfile = asyncHandler(async (req, res) => {
  const owner = await ownerService.getMyProfile(req.user.id);
  new ApiResponse(res, 200, owner ? 'Profile retrieved successfully' : 'No profile found yet', owner);
});

export const createMyProfile = asyncHandler(async (req, res) => {
  const owner = await ownerService.createMyProfile(req.user.id, req.body, req);
  new ApiResponse(res, 201, 'Owner profile created successfully', owner);
});

export const updateMyProfile = asyncHandler(async (req, res) => {
  const owner = await ownerService.updateMyProfile(req.user.id, req.body, req);
  new ApiResponse(res, 200, 'Owner profile updated successfully', owner);
});
