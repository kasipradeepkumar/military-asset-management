const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);

    next();
  } catch (err) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
});

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

// Base access control
exports.baseAccess = asyncHandler(async (req, res, next) => {
  // Admin has access to all bases
  if (req.user.role === 'admin') {
    return next();
  }

  // Check if base ID is in request params or body
  const baseId = req.params.baseId || req.body.base || req.body.fromBase;

  // If no base ID is provided, continue
  if (!baseId) {
    return next();
  }

  // Base commander and logistics officer can only access their assigned base
  if (req.user.role === 'base_commander' || req.user.role === 'logistics_officer') {
    if (req.user.assignedBase.toString() !== baseId) {
      return next(
        new ErrorResponse(
          `Not authorized to access data for this base`,
          403
        )
      );
    }
  }

  next();
});
