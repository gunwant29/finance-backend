const ROLES = {
  VIEWER: 'viewer',
  ANALYST: 'analyst',
  ADMIN: 'admin',
};

// Permissions matrix — what each role can do
const PERMISSIONS = {
  viewer: ['read:records', 'read:dashboard'],
  analyst: ['read:records', 'read:dashboard', 'read:insights'],
  admin: [
    'read:records',
    'create:records',
    'update:records',
    'delete:records',
    'read:dashboard',
    'read:insights',
    'manage:users',
  ],
};

module.exports = { ROLES, PERMISSIONS };
