const jwt = require('jsonwebtoken');
const config = require('../config/config');
const ApiResponse = require('../utils/apiResponse');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return ApiResponse.error(res, 'Access denied. No authentication token provided.', 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return ApiResponse.error(res, 'Session token expired. Please log in again.', 401);
    }
    return ApiResponse.error(res, 'Invalid token.', 403);
  }
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
  } catch (error) {
    // Optional, ignore invalid token and proceed as guest
  }
  next();
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return ApiResponse.error(
        res,
        `Forbidden: Role '${req.user ? req.user.role : 'UNKNOWN'}' is not authorized to perform this action.`,
        403
      );
    }
    next();
  };
}

module.exports = {
  authenticate,
  authenticateToken: authenticate,
  optionalAuth,
  authorizeRoles,
  authorizeRole: authorizeRoles
};
