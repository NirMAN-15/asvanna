const express = require('express');
const { body } = require('express-validator');
const AuthController = require('../controllers/authController');
const { authenticate, authorizeRoles } = require('../middlewares/authMiddleware');
const { validateRequest } = require('../middlewares/validationMiddleware');

const router = express.Router();

const passwordValidationRules = body('password')
  .isString()
  .withMessage('Password is required and must be a string')
  .isLength({ min: 8, max: 128 })
  .withMessage('Password must be at least 8 characters long')
  .matches(/[A-Z]/)
  .withMessage('Password must contain at least one uppercase letter')
  .matches(/[a-z]/)
  .withMessage('Password must contain at least one lowercase letter')
  .matches(/[0-9]/)
  .withMessage('Password must contain at least one number')
  .matches(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/)
  .withMessage('Password must contain at least one special character (!@#$%^&* etc.)');

const phoneValidationRules = body('phone')
  .trim()
  .matches(/^(?:0[0-9]{9}|(?:\+94|94)[0-9]{9})$/)
  .withMessage('Please provide a valid Sri Lankan phone number (e.g. 0771234567 or +94771234567)');

const nicValidationRules = body('nic')
  .optional({ checkFalsy: true })
  .trim()
  .matches(/^(?:[0-9]{9}[VXvx]|[0-9]{12})$/)
  .withMessage('Please provide a valid Sri Lankan NIC number (e.g. 851234567V or 198512345678)');

router.post(
  '/register',
  [
    body('role')
      .isIn(['OFFICER', 'FARMER', 'BUYER'])
      .withMessage('Role must be FARMER, OFFICER, or BUYER'),
    phoneValidationRules,
    nicValidationRules,
    passwordValidationRules
  ],
  validateRequest,
  AuthController.register
);

router.post(
  '/admin/register',
  authenticate,
  authorizeRoles('ADMIN'),
  [
    body('admin_key')
      .isString()
      .notEmpty()
      .withMessage('Admin authorization key is required'),
    phoneValidationRules,
    nicValidationRules,
    passwordValidationRules
  ],
  validateRequest,
  AuthController.registerAdmin
);

router.post(
  '/login',
  [
    body().custom((value) => {
      if (!value.nic && !value.phone && !value.identifier) {
        throw new Error('NIC number is required');
      }
      if (!value.password) {
        throw new Error('Password is required');
      }
      return true;
    })
  ],
  validateRequest,
  AuthController.login
);

router.get('/me', authenticate, AuthController.getProfile);
router.get('/profile', authenticate, AuthController.getProfile);
router.put('/profile', authenticate, AuthController.updateProfile);
router.post('/fcm-token', authenticate, AuthController.updateFcmToken);
router.put('/change-password', authenticate, AuthController.changePassword);

module.exports = router;
