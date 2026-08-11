import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import * as violationService from '../services/violation.service.js';

export const createViolation = asyncHandler(async (req, res) => {
  const violation = await violationService.createViolation(req.body, req.user.id, req);
  new ApiResponse(res, 201, 'Violation created successfully', violation);
});

export const listViolations = asyncHandler(async (req, res) => {
  const { violations, meta } = await violationService.listViolations(req.query);
  new ApiResponse(res, 200, 'Violations retrieved successfully', { violations, meta });
});

export const getViolation = asyncHandler(async (req, res) => {
  const violation = await violationService.getViolationById(req.params.id);
  new ApiResponse(res, 200, 'Violation retrieved successfully', violation);
});

export const updateViolation = asyncHandler(async (req, res) => {
  const violation = await violationService.updateViolation(
    req.params.id,
    req.body,
    req.user.id,
    req
  );
  new ApiResponse(res, 200, 'Violation updated successfully', violation);
});

export const deleteViolation = asyncHandler(async (req, res) => {
  await violationService.deleteViolation(req.params.id, req.user.id, req);
  new ApiResponse(res, 200, 'Violation deleted successfully', null);
});
