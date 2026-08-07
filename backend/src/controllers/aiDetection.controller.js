import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import * as aiDetectionService from '../services/aiDetection.service.js';

/**
 * Reports whether the remote screening service (vehicle-type -> helmet ->
 * plate staged pipeline, served by the separate /ml-service process) is
 * reachable right now. This is genuinely live — not a hardcoded flag — so
 * if that service is down, the dashboard banner says so honestly instead
 * of claiming a feature that isn't currently working.
 */
export const getStatus = asyncHandler(async (req, res) => {
  const status = await aiDetectionService.checkServiceStatus();

  new ApiResponse(res, 200, 'AI detection status retrieved', {
    enabled: status.reachable,
    status: status.reachable ? 'active' : 'unavailable',
    message: status.reachable
      ? 'Two-wheeler violation screening is live: vehicle type, then helmet, then plate location — upload a photo to try it.'
      : `The detection service is not reachable right now (${status.detail || 'unknown reason'}). Violations can still be issued manually.`,
    vehicleClasses: status.vehicleClasses || null,
    helmetClasses: status.helmetClasses || null,
    plateClasses: status.plateClasses || null,
    plannedCapabilities: [
      'Vehicle-type screening — only two-wheelers (motorcycle/scooter) are carried forward',
      'Helmet / no-helmet detection, only run once a two-wheeler is confirmed',
      'Number-plate location, only run once a violation is confirmed — reading the plate characters (OCR) is not yet trained',
      'Automatic overspeed detection',
    ],
  });
});

/**
 * Runs an uploaded photo through the remote staged pipeline and returns
 * the raw result (vehicle eligibility, detections, suggested violations).
 * This never issues or modifies a violation itself — it's advisory input
 * for the officer filling out the "Issue challan" form.
 */
export const analyze = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest('An image file is required');
  }

  const result = await aiDetectionService.screenImage(
    req.file.buffer,
    req.file.originalname,
    req.file.mimetype
  );

  new ApiResponse(res, 200, 'Image screened successfully', result);
});
