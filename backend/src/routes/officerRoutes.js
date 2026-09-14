const express = require('express');
const OfficerController = require('../controllers/officerController');
const { authenticate, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles('OFFICER', 'ADMIN'));

router.get('/farmers', OfficerController.getFarmerDirectory);
router.get('/verifications/pending', OfficerController.getPendingVerifications);
router.post('/verifications/:farmerId', OfficerController.reviewFarmer);
router.post('/register-farmer-proxy', OfficerController.registerFarmerProxy);
router.get('/analytics/summary', OfficerController.getRegionalAnalytics);
router.get('/analytics/forecast', OfficerController.getForecasting);
router.get('/export-report', OfficerController.exportReport);

module.exports = router;
