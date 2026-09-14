const express = require('express');
const router = express.Router();
const RiskEngineController = require('../controllers/riskEngineController');

router.get('/regional', RiskEngineController.getRegionalRiskSummary);
router.get('/regional/heatmap', RiskEngineController.getHeatmapData);
router.post('/smart-search', RiskEngineController.smartSearch);
router.get('/:cropId/detailed', RiskEngineController.getDetailedCropRisk);
router.get('/:cropId', RiskEngineController.getCropRisk);

module.exports = router;
