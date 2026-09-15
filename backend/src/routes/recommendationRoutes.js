const express = require('express');
const RecommendationController = require('../controllers/recommendationController');
const { optionalAuth } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', optionalAuth, RecommendationController.getRecommendations);

module.exports = router;
