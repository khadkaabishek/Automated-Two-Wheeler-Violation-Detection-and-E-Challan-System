import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import * as challanService from '../services/challan.service.js';

export const createChallan = asyncHandler(async (req, res) => {
  const challan = await challanService.createChallan(req.body, req.user.id, req);
  new ApiResponse(res, 201, 'Challan created successfully', challan);
});

export const listChallans = asyncHandler(async (req, res) => {
  const { challans, meta } = await challanService.listChallans(req.query, {
    id: req.user.id,
    roleName: req.user.roleName,
  });
  new ApiResponse(res, 200, 'Challans retrieved successfully', { challans, meta });
});

export const getChallan = asyncHandler(async (req, res) => {
  const challan = await challanService.getChallanById(req.params.id, {
    id: req.user.id,
    roleName: req.user.roleName,
  });
  new ApiResponse(res, 200, 'Challan retrieved successfully', challan);
});

export const updateChallan = asyncHandler(async (req, res) => {
  const challan = await challanService.updateChallan(req.params.id, req.body, req.user.id, req);
  new ApiResponse(res, 200, 'Challan updated successfully', challan);
});

export const approveChallan = asyncHandler(async (req, res) => {
  const challan = await challanService.transitionChallanStatus(req.params.id, 'APPROVED', req.user.id, req);
  new ApiResponse(res, 200, 'Challan approved successfully', challan);
});

export const rejectChallan = asyncHandler(async (req, res) => {
  const challan = await challanService.transitionChallanStatus(req.params.id, 'REJECTED', req.user.id, req);
  new ApiResponse(res, 200, 'Challan rejected successfully', challan);
});

export const closeChallan = asyncHandler(async (req, res) => {
  const challan = await challanService.transitionChallanStatus(req.params.id, 'CLOSED', req.user.id, req);
  new ApiResponse(res, 200, 'Challan closed successfully', challan);
});

export const cancelChallan = asyncHandler(async (req, res) => {
  const challan = await challanService.transitionChallanStatus(req.params.id, 'CANCELLED', req.user.id, req);
  new ApiResponse(res, 200, 'Challan cancelled successfully', challan);
});

export const uploadEvidence = asyncHandler(async (req, res) => {
  const challan = await challanService.addEvidence(req.params.id, req.files || {}, req.user.id, req);
  new ApiResponse(res, 200, 'Evidence uploaded successfully', challan);
});

export const deleteChallan = asyncHandler(async (req, res) => {
  await challanService.deleteChallan(req.params.id, req.user.id, req);
  new ApiResponse(res, 200, 'Challan deleted successfully', null);
});
