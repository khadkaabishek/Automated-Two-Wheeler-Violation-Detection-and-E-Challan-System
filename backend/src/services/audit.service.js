import auditLogRepository from '../repositories/auditLog.repository.js';
import logger from '../config/logger.js';

/**
 * Fire-and-forget audit log writer. Failures are logged but never thrown,
 * so audit logging can't break the primary request flow.
 */
export const recordAudit = async ({ userId = null, action, details = null, req = null }) => {
  try {
    await auditLogRepository.create({
      userId,
      action,
      details,
      ipAddress: req?.ip || null,
      userAgent: req?.headers?.['user-agent'] || null,
    });
  } catch (err) {
    logger.error(`Failed to write audit log for action ${action}: ${err.message}`);
  }
};

export default recordAudit;
