const express = require('express');
const { body } = require('express-validator');
const AuthController = require('../controllers/authController');
const { authenticate } = require('../middlewares/authMiddleware');
const { validateRequest } = require('../middlewares/validationMiddleware');

const router = express.Router();

router.post('/register', AuthController.register);

router.post(
  '/login',
  [
    body('phone').notEmpty().withMessage('Phone is required'),
    body().custom((value) => {
      if (!value.password && !value.otp) {
        throw new Error('Password or verification code is required');
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
