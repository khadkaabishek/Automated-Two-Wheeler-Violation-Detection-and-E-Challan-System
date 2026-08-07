import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import * as flaggedDetectionService from '../services/flaggedDetection.service.js';

export const submit = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest('An image file is required');
  }

  const result = await flaggedDetectionService.submitForScreening(
    req.user.id,
    req.file.buffer,
    req.file.originalname,
    req.file.mimetype,
    req
  );

  if (!result.flagged) {
    new ApiResponse(res, 200, result.screenResult.eligibilityMessage || 'No violation detected', {
      flagged: false,
      screenResult: result.screenResult,
    });
    return;
  }

  new ApiResponse(res, 201, 'Violation flagged for review', {
    flagged: true,
    detection: result.detection,
    screenResult: result.screenResult,
  });
});

export const submitVideo = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest('A video file is required');
  }

  const result = await flaggedDetectionService.submitVideoForScreening(
    req.user.id,
    req.file.buffer,
    req.file.originalname,
    req.file.mimetype,
    req
  );

  new ApiResponse(
    res,
    result.flagged ? 201 : 200,
    result.flagged
      ? `${result.detections.length} violation${result.detections.length === 1 ? '' : 's'} found and flagged for review`
      : 'No violations detected in this video',
    result
  );
});

export const list = asyncHandler(async (req, res) => {
  const { detections, meta } = await flaggedDetectionService.listFlaggedDetections(req.query);
  new ApiResponse(res, 200, 'Flagged detections retrieved successfully', { detections, meta });
});

export const get = asyncHandler(async (req, res) => {
  const detection = await flaggedDetectionService.getFlaggedDetectionById(req.params.id);
  new ApiResponse(res, 200, 'Flagged detection retrieved successfully', detection);
});

export const dismiss = asyncHandler(async (req, res) => {
  const detection = await flaggedDetectionService.dismissFlaggedDetection(req.params.id, req.user.id, req);
  new ApiResponse(res, 200, 'Flagged detection dismissed', detection);
});
