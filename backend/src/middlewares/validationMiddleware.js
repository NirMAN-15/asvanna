const { validationResult } = require('express-validator');
const ApiResponse = require('../utils/apiResponse');

function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return ApiResponse.error(res, 'Validation failed for input fields.', 400, errors.array());
  }
  next();
}

module.exports = {
  validateRequest
};
