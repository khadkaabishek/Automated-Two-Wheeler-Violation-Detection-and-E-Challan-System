import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import * as disputeService from '../services/challanDispute.service.js';

export const createDispute = asyncHandler(async (req, res) => {
  const dispute = await disputeService.createDispute(req.user.id, req.body, req);
  new ApiResponse(res, 201, 'Dispute submitted — a reviewer will respond soon', dispute);
});

export const listDisputes = asyncHandler(async (req, res) => {
  const { disputes, meta } = await disputeService.listDisputes(req.query, {
    id: req.user.id,
    roleName: req.user.roleName,
  });
  new ApiResponse(res, 200, 'Disputes retrieved successfully', { disputes, meta });
});

export const getDispute = asyncHandler(async (req, res) => {
  const dispute = await disputeService.getDisputeById(req.params.id, {
    id: req.user.id,
    roleName: req.user.roleName,
  });
  new ApiResponse(res, 200, 'Dispute retrieved successfully', dispute);
});

export const uphold = asyncHandler(async (req, res) => {
  const dispute = await disputeService.resolveDispute(
    req.params.id,
    'UPHELD',
    req.body.resolutionNote,
    req.user.id,
    req
  );
  new ApiResponse(res, 200, 'Dispute upheld — violation voided', dispute);
});

export const dismiss = asyncHandler(async (req, res) => {
  const dispute = await disputeService.resolveDispute(
    req.params.id,
    'DISMISSED',
    req.body.resolutionNote,
    req.user.id,
    req
  );
  new ApiResponse(res, 200, 'Dispute dismissed — violation stands', dispute);
});
