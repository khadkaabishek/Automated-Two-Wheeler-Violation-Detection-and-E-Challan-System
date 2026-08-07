import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import * as challanService from '../services/challan.service.js';

export const createChallan = asyncHandler(async (req, res) => {
  const challan = await challanService.createChallan(req.body, req.user.id, req);
  new ApiResponse(res, 201, 'Violation notice created successfully', challan);
});

export const listChallans = asyncHandler(async (req, res) => {
  const { challans, meta } = await challanService.listChallans(req.query, {
    id: req.user.id,
    roleName: req.user.roleName,
  });
  new ApiResponse(res, 200, 'Violations retrieved successfully', { challans, meta });
});

export const getChallan = asyncHandler(async (req, res) => {
  const challan = await challanService.getChallanById(req.params.id, {
    id: req.user.id,
    roleName: req.user.roleName,
  });
  new ApiResponse(res, 200, 'Violation retrieved successfully', challan);
});

export const updateChallan = asyncHandler(async (req, res) => {
  const challan = await challanService.updateChallan(req.params.id, req.body, req.user.id, req);
  new ApiResponse(res, 200, 'Violation updated successfully', challan);
});

export const approveChallan = asyncHandler(async (req, res) => {
  const challan = await challanService.transitionChallanStatus(req.params.id, 'APPROVED', req.user.id, req);
  new ApiResponse(res, 200, 'Violation approved successfully', challan);
});

export const rejectChallan = asyncHandler(async (req, res) => {
  const challan = await challanService.transitionChallanStatus(req.params.id, 'REJECTED', req.user.id, req);
  new ApiResponse(res, 200, 'Violation rejected successfully', challan);
});

export const closeChallan = asyncHandler(async (req, res) => {
  const challan = await challanService.transitionChallanStatus(req.params.id, 'CLOSED', req.user.id, req);
  new ApiResponse(res, 200, 'Violation closed successfully', challan);
});

export const cancelChallan = asyncHandler(async (req, res) => {
  const challan = await challanService.transitionChallanStatus(req.params.id, 'CANCELLED', req.user.id, req);
  new ApiResponse(res, 200, 'Violation cancelled successfully', challan);
});

export const uploadEvidence = asyncHandler(async (req, res) => {
  const challan = await challanService.addEvidence(req.params.id, req.files || {}, req.user.id, req);
  new ApiResponse(res, 200, 'Evidence uploaded successfully', challan);
});

export const deleteChallan = asyncHandler(async (req, res) => {
  await challanService.deleteChallan(req.params.id, req.user.id, req);
  new ApiResponse(res, 200, 'Violation deleted successfully', null);
});
