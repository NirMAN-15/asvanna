const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notificationController');
const { authenticateToken, optionalAuth } = require('../middlewares/authMiddleware');

router.get('/', optionalAuth, NotificationController.getMyNotifications);
router.get('/notices', optionalAuth, NotificationController.getNotices);
router.post('/push', optionalAuth, NotificationController.pushAlert);
router.post('/register-token', optionalAuth, NotificationController.registerToken);
router.put('/:id/read', optionalAuth, NotificationController.markAsRead);

module.exports = router;
