const express = require('express');
const RecommendationController = require('../controllers/recommendationController');
const { authenticate } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', authenticate, RecommendationController.getRecommendations);

module.exports = router;
