const ApiResponse = require('../utils/apiResponse');

function errorHandler(err, req, res, next) {
  console.error('🔥 Uncaught API Error:', err.stack || err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return ApiResponse.error(res, message, statusCode, process.env.NODE_ENV === 'development' ? err.stack : undefined);
}

module.exports = errorHandler;
