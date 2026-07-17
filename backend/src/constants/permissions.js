export const MODULES = Object.freeze({
  USER_MANAGEMENT: 'User Management',
  ROLE_MANAGEMENT: 'Role Management',
  VEHICLE_MANAGEMENT: 'Vehicle Management',
  OWNER_MANAGEMENT: 'Owner Management',
  CHALLAN_MANAGEMENT: 'Challan Management',
  VIOLATION_MANAGEMENT: 'Violation Management',
  PAYMENT_MANAGEMENT: 'Payment Management',
  DASHBOARD_ACCESS: 'Dashboard Access',
  REPORT_GENERATION: 'Report Generation',
  SYSTEM_SETTINGS: 'System Settings',
});

const ACTIONS = ['CREATE', 'READ', 'UPDATE', 'DELETE'];

const moduleKeyMap = {
  [MODULES.USER_MANAGEMENT]: 'USER',
  [MODULES.ROLE_MANAGEMENT]: 'ROLE',
  [MODULES.VEHICLE_MANAGEMENT]: 'VEHICLE',
  [MODULES.OWNER_MANAGEMENT]: 'OWNER',
  [MODULES.CHALLAN_MANAGEMENT]: 'CHALLAN',
  [MODULES.VIOLATION_MANAGEMENT]: 'VIOLATION',
  [MODULES.PAYMENT_MANAGEMENT]: 'PAYMENT',
  [MODULES.DASHBOARD_ACCESS]: 'DASHBOARD',
  [MODULES.REPORT_GENERATION]: 'REPORT',
  [MODULES.SYSTEM_SETTINGS]: 'SETTINGS',
};

/**
 * Builds a flat map of permission name constants, e.g.:
 * PERMISSIONS.USER_CREATE === 'user:create'
 */
export const PERMISSIONS = {};
export const PERMISSION_DEFINITIONS = [];

Object.entries(moduleKeyMap).forEach(([moduleName, key]) => {
  ACTIONS.forEach((action) => {
    const constName = `${key}_${action}`;
    const permName = `${key.toLowerCase()}:${action.toLowerCase()}`;
    PERMISSIONS[constName] = permName;
    PERMISSION_DEFINITIONS.push({
      name: permName,
      module: moduleName,
      description: `${action.charAt(0) + action.slice(1).toLowerCase()} access for ${moduleName}`,
    });
  });
});

// Dashboard & Reports typically only need READ, but we keep full CRUD naming
// consistent for uniform middleware checks; extra actions are harmless.

export default PERMISSIONS;
