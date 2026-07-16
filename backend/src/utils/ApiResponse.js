/**
 * Standard success response envelope:
 * { success, message, data, errors }
 */
class ApiResponse {
  constructor(res, statusCode, message, data = {}) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      errors: null,
    });
  }
}

export default ApiResponse;
