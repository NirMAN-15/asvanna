const express = require('express');
const router = express.Router();
const PriceController = require('../controllers/priceController');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

router.get('/latest', PriceController.getLatestPrices);
router.get('/daily', PriceController.getLatestPrices);
router.get('/:cropId/history', PriceController.getCropHistory);
router.post('/record', authenticateToken, authorizeRole('OFFICER', 'ADMIN'), PriceController.recordPrice);
router.post('/batch', authenticateToken, authorizeRole('OFFICER', 'ADMIN'), PriceController.recordBatch);

module.exports = router;
