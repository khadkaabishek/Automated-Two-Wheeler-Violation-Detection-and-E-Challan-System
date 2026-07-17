import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import * as vehicleService from '../services/vehicle.service.js';

export const createVehicle = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.createVehicle(
    req.body,
    { id: req.user.id, roleName: req.user.roleName },
    req
  );
  new ApiResponse(res, 201, 'Vehicle created successfully', vehicle);
});

export const listVehicles = asyncHandler(async (req, res) => {
  const { vehicles, meta } = await vehicleService.listVehicles(req.query, {
    id: req.user.id,
    roleName: req.user.roleName,
  });
  new ApiResponse(res, 200, 'Vehicles retrieved successfully', { vehicles, meta });
});

export const getVehicle = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.getVehicleById(req.params.id, {
    id: req.user.id,
    roleName: req.user.roleName,
  });
  new ApiResponse(res, 200, 'Vehicle retrieved successfully', vehicle);
});

export const updateVehicle = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.updateVehicle(req.params.id, req.body, req.user.id, req);
  new ApiResponse(res, 200, 'Vehicle updated successfully', vehicle);
});

export const deleteVehicle = asyncHandler(async (req, res) => {
  await vehicleService.deleteVehicle(req.params.id, req.user.id, req);
  new ApiResponse(res, 200, 'Vehicle deleted successfully', null);
});

export const setVehicleStatus = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.setVehicleStatus(req.params.id, req.body.status, req.user.id, req);
  new ApiResponse(res, 200, 'Vehicle status updated successfully', vehicle);
});

export const approveRegistration = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.approveRegistration(req.params.id, req.user.id, req);
  new ApiResponse(res, 200, 'Vehicle registration approved', vehicle);
});

export const rejectRegistration = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.rejectRegistration(req.params.id, req.user.id, req);
  new ApiResponse(res, 200, 'Vehicle registration rejected', vehicle);
});

export const uploadVehicleImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest('Vehicle image file is required');
  }
  const relativePath = `/uploads/vehicles/${req.file.filename}`;
  const vehicle = await vehicleService.updateVehicle(
    req.params.id,
    { image: relativePath },
    req.user.id,
    req
  );
  new ApiResponse(res, 200, 'Vehicle image uploaded successfully', vehicle);
});
