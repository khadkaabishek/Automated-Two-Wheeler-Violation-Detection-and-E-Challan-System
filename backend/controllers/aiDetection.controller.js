import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';

/**
 * Placeholder for the planned Automatic Number Plate Recognition (ANPR) /
 * violation-detection model. Once a trained model is ready, wire its
 * inference call in here (or call out to a dedicated inference service)
 * and flip `enabled` to true. Until then this simply reports status so the
 * frontend can show an honest "in development" indicator instead of a dead
 * or fake feature.
 */
export const getStatus = asyncHandler(async (req, res) => {
  new ApiResponse(res, 200, 'AI detection status retrieved', {
    enabled: false,
    status: 'in_development',
    message:
      'Automatic violation detection (ANPR / overspeed / helmet detection) is currently being trained and is not yet issuing challans automatically.',
    plannedCapabilities: [
      'Automatic Number Plate Recognition (ANPR)',
      'Helmet / seatbelt detection from camera feeds',
      'Automatic overspeed detection',
      'Auto-drafted challans for officer review before issuance',
    ],
  });
});
