import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import * as dashboardService from '../services/dashboard.service.js';

export const getSummary = asyncHandler(async (req, res) => {
  const summary = await dashboardService.getSummary();
  new ApiResponse(res, 200, 'Dashboard summary retrieved successfully', summary);
});

export const getMonthlyRevenue = asyncHandler(async (req, res) => {
  const year = req.query.year ? parseInt(req.query.year, 10) : undefined;
  const data = await dashboardService.getMonthlyRevenue(year);
  new ApiResponse(res, 200, 'Monthly revenue retrieved successfully', data);
});

export const getDailyChallans = asyncHandler(async (req, res) => {
  const days = req.query.days ? parseInt(req.query.days, 10) : 30;
  const data = await dashboardService.getDailyChallans(days);
  new ApiResponse(res, 200, 'Daily violation counts retrieved successfully', data);
});

export const getTopViolations = asyncHandler(async (req, res) => {
  const data = await dashboardService.getTopViolations();
  new ApiResponse(res, 200, 'Top violations retrieved successfully', data);
});

export const getChallansByOfficer = asyncHandler(async (req, res) => {
  const data = await dashboardService.getChallansByOfficer();
  new ApiResponse(res, 200, 'Violations by officer retrieved successfully', data);
});
