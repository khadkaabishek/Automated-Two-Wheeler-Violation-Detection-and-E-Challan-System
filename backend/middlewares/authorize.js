import ApiError from '../utils/ApiError.js';

/**
 * Restricts access to users whose role name is in the allowed list.
 * Usage: authorizeRoles('Super Admin', 'Admin')
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }
    if (!allowedRoles.includes(req.user.roleName)) {
      return next(ApiError.forbidden('You do not have permission to perform this action'));
    }
    next();
  };
};

/**
 * Restricts access to users whose role holds ALL of the given permissions.
 * Permissions are resolved from the database via the authenticate middleware
 * (req.user.permissions), not hardcoded here.
 * Usage: authorizePermissions(PERMISSIONS.USER_CREATE)
 */
export const authorizePermissions = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    const hasAll = requiredPermissions.every((perm) => req.user.permissions.includes(perm));

    if (!hasAll) {
      return next(ApiError.forbidden('Insufficient permissions to perform this action'));
    }
    next();
  };
};

/**
 * Like authorizePermissions but passes if the user has AT LEAST ONE
 * of the given permissions.
 */
export const authorizeAnyPermission = (...anyPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    const hasAny = anyPermissions.some((perm) => req.user.permissions.includes(perm));

    if (!hasAny) {
      return next(ApiError.forbidden('Insufficient permissions to perform this action'));
    }
    next();
  };
};
