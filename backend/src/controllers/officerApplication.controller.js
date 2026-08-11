import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import * as officerApplicationService from '../services/officerApplication.service.js';
import { ROLES } from '../constants/roles.js';

// Admins/Super Admins see everything; everyone else only sees their own applications.
const scopeFor = (user) => (user.roleName === ROLES.SUPER_ADMIN ? null : user.id);

export const createApplication = asyncHandler(async (req, res) => {
  const application = await officerApplicationService.createApplication(req.user.id, req.body, req);
  new ApiResponse(res, 201, 'Officer application submitted', application);
});

export const listApplications = asyncHandler(async (req, res) => {
  const { applications, meta } = await officerApplicationService.listApplications(
    req.query,
    scopeFor(req.user)
  );
  new ApiResponse(res, 200, 'Officer applications retrieved successfully', { applications, meta });
});

export const getApplication = asyncHandler(async (req, res) => {
  const application = await officerApplicationService.getApplicationById(
    req.params.id,
    scopeFor(req.user)
  );
  new ApiResponse(res, 200, 'Officer application retrieved successfully', application);
});

export const approveApplication = asyncHandler(async (req, res) => {
  const application = await officerApplicationService.approveApplication(
    req.params.id,
    req.user.id,
    req
  );
  new ApiResponse(res, 200, 'Application approved — user promoted to Traffic Police', application);
});

export const rejectApplication = asyncHandler(async (req, res) => {
  const application = await officerApplicationService.rejectApplication(
    req.params.id,
    req.body.reason,
    req.user.id,
    req
  );
  new ApiResponse(res, 200, 'Application rejected', application);
});
