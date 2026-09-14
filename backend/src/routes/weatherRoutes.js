const express = require('express');
const router = express.Router();
const WeatherController = require('../controllers/weatherController');

router.get('/current', WeatherController.getCurrent);
router.get('/forecast', WeatherController.getForecast);
router.get('/agricultural-score', WeatherController.getAgScores);
router.get('/crop-suitability/:cropId', WeatherController.getCropWeatherSuitability);
router.post('/backfill', WeatherController.backfillHistory);

module.exports = router;
