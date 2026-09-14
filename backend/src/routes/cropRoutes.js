const express = require('express');
const router = express.Router();
const CropController = require('../controllers/cropController');

router.get('/', CropController.getAllCrops);
router.get('/:cropId', CropController.getCropProfile);

module.exports = router;
