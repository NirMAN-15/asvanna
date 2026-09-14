const express = require('express');
const BroadcastController = require('../controllers/broadcastController');
const { authenticate, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', authenticate, authorizeRoles('OFFICER', 'ADMIN'), BroadcastController.createBroadcast);
router.get('/', authenticate, BroadcastController.getActiveBroadcasts);

module.exports = router;
