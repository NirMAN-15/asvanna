const express = require('express');
const { body } = require('express-validator');
const PlantingController = require('../controllers/plantingController');
const { authenticate, authorizeRoles } = require('../middlewares/authMiddleware');
const { validateRequest } = require('../middlewares/validationMiddleware');

const router = express.Router();

router.post(
  ['/', '/log'],
  authenticate,
  authorizeRoles('FARMER', 'OFFICER', 'ADMIN'),
  [
    body('crop_id').custom(v => v !== undefined && v !== null && v !== '').withMessage('Valid crop ID required'),
    body().custom(b => {
      const acres = parseFloat(b.land_size_acres || b.allocated_acres || b.acreage);
      const perches = parseFloat(b.land_size_perches);
      if ((isNaN(acres) || acres <= 0) && (isNaN(perches) || perches <= 0)) {
        throw new Error('Valid land extent (acres or perches) greater than 0 required');
      }
      return true;
    })
  ],
  validateRequest,
  PlantingController.logPlanting
);

router.get(['/', '/farmer', '/farmer/:farmerId?', '/my-crops'], authenticate, PlantingController.getFarmerPlantings);
router.get(['/regional-map', '/history/regional-map'], authenticate, PlantingController.getRegionalPlantings);
router.get(['/history/all', '/all'], authenticate, PlantingController.getAllFarmHistory);
router.put('/:id/harvest', authenticate, authorizeRoles('FARMER', 'OFFICER', 'ADMIN'), PlantingController.completeHarvest);
router.put('/:id', authenticate, authorizeRoles('FARMER', 'OFFICER', 'ADMIN'), PlantingController.updatePlanting);
router.delete('/:id', authenticate, authorizeRoles('FARMER', 'OFFICER', 'ADMIN'), PlantingController.deletePlanting);


module.exports = router;
