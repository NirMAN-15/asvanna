const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notificationController');
const { authenticateToken, optionalAuth } = require('../middlewares/authMiddleware');

router.get('/', optionalAuth, NotificationController.getMyNotifications);
router.put('/:id/read', optionalAuth, NotificationController.markAsRead);

module.exports = router;
