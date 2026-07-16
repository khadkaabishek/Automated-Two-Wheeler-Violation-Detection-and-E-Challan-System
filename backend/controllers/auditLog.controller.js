import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import * as auditLogService from '../services/auditLog.service.js';

export const listAuditLogs = asyncHandler(async (req, res) => {
  const { logs, meta } = await auditLogService.listAuditLogs(req.query);
  new ApiResponse(res, 200, 'Audit logs retrieved successfully', { logs, meta });
});
