const express = require('express');
const MarketplaceController = require('../controllers/marketplaceController');
const { authenticateToken, optionalAuth } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/listings', optionalAuth, MarketplaceController.createListing);
router.post('/list', optionalAuth, MarketplaceController.createListing); // Backward compatibility
router.get('/listings', MarketplaceController.getAllListings);
router.get('/listings/my', optionalAuth, MarketplaceController.getMyListings);
router.put('/listings/:listingId', optionalAuth, MarketplaceController.updateListing);
router.delete('/listings/:listingId', optionalAuth, MarketplaceController.deleteListing);
router.get('/buyer-summary', optionalAuth, MarketplaceController.getBuyerSummary);
router.get('/crops-benchmark', MarketplaceController.getCropsBenchmark);
router.get('/search', MarketplaceController.searchNearby);
router.get('/search-nearby', MarketplaceController.searchNearby); // Backward compatibility

router.get('/orders', optionalAuth, MarketplaceController.getOrders);
router.post('/orders', optionalAuth, MarketplaceController.placeOrder);
router.put('/orders/:orderId/respond', optionalAuth, MarketplaceController.respondToOrder);

router.get('/orders/:orderId/messages', MarketplaceController.getMessages);
router.post('/orders/:orderId/messages', optionalAuth, MarketplaceController.sendMessage);

module.exports = router;
