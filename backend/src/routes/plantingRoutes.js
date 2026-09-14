const express = require('express');
const { body } = require('express-validator');
const PlantingController = require('../controllers/plantingController');
const { authenticate, authorizeRoles } = require('../middlewares/authMiddleware');
const { validateRequest } = require('../middlewares/validationMiddleware');

const router = express.Router();

router.post(
  '/log',
  authenticate,
  authorizeRoles('FARMER', 'OFFICER', 'ADMIN'),
  [
    body('crop_id').isInt().withMessage('Valid crop ID required'),
    body('land_size_acres').isFloat({ min: 0.1 }).withMessage('Land size must be > 0 acres'),
    body('planting_date').isISO8601().withMessage('Valid ISO planting date required'),
    body('latitude').isFloat().withMessage('Valid latitude required'),
    body('longitude').isFloat().withMessage('Valid longitude required')
  ],
  validateRequest,
  PlantingController.logPlanting
);

router.get('/farmer/:farmerId?', authenticate, PlantingController.getFarmerPlantings);
router.get('/regional-map', authenticate, PlantingController.getRegionalPlantings);

module.exports = router;
