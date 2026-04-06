const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { PERMISSIONS } = require('../config/roles');

/**
 * Verifies the JWT token and attaches the user to req.user.
 */
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication token missing or malformed' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const user = await User.findById(decoded.id);

    if (!user) return res.status(401).json({ message: 'User no longer exists' });
    if (!user.isActive) return res.status(403).json({ message: 'Account is inactive' });

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

/**
 * Restricts access to specific roles.
 * Usage: authorize('admin', 'analyst')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required role(s): ${roles.join(', ')}`,
      });
    }
    next();
  };
};

/**
 * Checks if the user's role has a specific permission.
 * Usage: requirePermission('create:records')
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    const userPermissions = PERMISSIONS[req.user.role] || [];
    if (!userPermissions.includes(permission)) {
      return res.status(403).json({
        message: `Permission denied. You do not have '${permission}' access.`,
      });
    }
    next();
  };
};

module.exports = { authenticate, authorize, requirePermission };
