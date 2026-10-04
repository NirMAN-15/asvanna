const express = require('express');
const router = express.Router();
const CropController = require('../controllers/cropController');
const { authenticate, authorizeRoles } = require('../middlewares/authMiddleware');

router.get('/', CropController.getAllCrops);
router.get('/:cropId', CropController.getCropProfile);

router.post('/', authenticate, authorizeRoles('OFFICER', 'ADMIN'), CropController.createCrop);
router.put('/:cropId', authenticate, authorizeRoles('OFFICER', 'ADMIN'), CropController.updateCrop);

module.exports = router;
