const db = require('../config/database');
const GeofencingService = require('../services/geofencingService');
const MarketplaceService = require('../services/marketplaceService');
const realtimeStore = require('../services/realtimeStore');
const ApiResponse = require('../utils/apiResponse');

class MarketplaceController {
  /**
   * POST /api/v1/marketplace/listings
   * Create a surplus produce listing (Farmer only)
   */
  static async createListing(req, res, next) {
    try {
      const {
        crop_id,
        quantity_kg,
        price_per_kg,
        available_from,
        available_to,
        latitude,
        longitude,
        pickup_address,
        description,
        image_url
      } = req.body;

      const userId = req.user ? req.user.id : null;
      if (!userId) {
        return ApiResponse.error(res, 'Authentication required to post listing', 401);
      }

      // Enforce verified farmer requirement
      if (req.user && req.user.role === 'FARMER') {
        const userRes = await db.query('SELECT verification_status FROM users WHERE id = $1', [userId]);
        if (userRes.rows.length > 0 && userRes.rows[0].verification_status !== 'APPROVED') {
          return ApiResponse.error(
            res,
            'Your farmer profile is pending verification by the Divisional Officer. You cannot list surplus produce until your account is approved.',
            403
          );
        }
      }

      const qty = parseFloat(quantity_kg);
      const price = parseFloat(price_per_kg);
      if (!qty || qty <= 0 || !price || price <= 0) {
        return ApiResponse.error(res, 'Quantity and price per kg must be positive values', 400);
      }

      const result = await db.query(
        `INSERT INTO marketplace_listings
         (farmer_id, crop_id, quantity_kg, price_per_kg, available_from, available_to, latitude, longitude, pickup_address, description, image_url, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'AVAILABLE')
         RETURNING *`,
        [
          userId,
          crop_id,
          qty,
          price,
          available_from || new Date().toISOString().split('T')[0],
          available_to || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          latitude || 6.8322,
          longitude || 80.9980,
          pickup_address || 'Bandarawela',
          description || null,
          image_url || null
        ]
      );

      const listing = result.rows[0];

      // Optional real-time sync with Firebase
      await MarketplaceService.syncListingToFirebase(listing);

      return ApiResponse.success(res, listing, 'Surplus listing published to zero-waste marketplace', 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/marketplace/listings/my
   * Retrieve farmer's active and historical listings
   */
  static async getMyListings(req, res, next) {
    try {
      const userId = req.user ? req.user.id : null;
      if (!userId) {
        return ApiResponse.error(res, 'Authentication required', 401);
      }

      const result = await db.query(
        `SELECT l.*, c.crop_code, c.name_en as crop_name_en, c.name_si as crop_name_si, c.name_ta as crop_name_ta,
                c.standard_price_per_kg, c.price_range_min, c.price_range_max
         FROM marketplace_listings l
         JOIN crops c ON c.id = l.crop_id
         WHERE l.farmer_id = $1
         ORDER BY l.created_at DESC`,
        [userId]
      );
      return ApiResponse.success(res, result.rows || [], 'Farmer listings retrieved');
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/marketplace/listings
   * Retrieve all active listings (for buyers)
   */
  static async getAllListings(req, res, next) {
    try {
      const result = await db.query(
        `SELECT l.*, c.crop_code, c.name_en as crop_name_en, c.name_si as crop_name_si, c.name_ta as crop_name_ta,
                c.standard_price_per_kg, c.price_range_min, c.price_range_max,
                u.full_name as farmer_name, u.phone as farmer_phone
         FROM marketplace_listings l
         JOIN crops c ON c.id = l.crop_id
         JOIN users u ON u.id = l.farmer_id
         WHERE l.status = 'AVAILABLE'
         ORDER BY l.created_at DESC`
      );
      return ApiResponse.success(res, result.rows || [], 'All active listings retrieved');
    } catch (err) {
      next(err);
    }
  }


  /**
   * PUT /api/v1/marketplace/listings/:listingId
   * Edit price, quantity, or status of a listing
   */
  static async updateListing(req, res, next) {
    try {
      const { listingId } = req.params;
      const { quantity_kg, price_per_kg, status, description, available_to } = req.body;
      const userId = req.user ? req.user.id : null;

      const result = await db.query(
        `UPDATE marketplace_listings
         SET quantity_kg = COALESCE($1, quantity_kg),
             price_per_kg = COALESCE($2, price_per_kg),
             status = COALESCE($3, status),
             description = COALESCE($4, description),
             available_to = COALESCE($5, available_to),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $6 AND farmer_id = $7
         RETURNING *`,
        [quantity_kg, price_per_kg, status, description, available_to, listingId, userId]
      );

      if (result.rows.length === 0) {
        return ApiResponse.error(res, 'Listing not found or unauthorized', 404);
      }
      return ApiResponse.success(res, result.rows[0], 'Listing updated successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/v1/marketplace/listings/:listingId
   * Delist a produce batch
   */
  static async deleteListing(req, res, next) {
    try {
      const { listingId } = req.params;
      const userId = req.user ? req.user.id : null;

      await db.query(
        `UPDATE marketplace_listings SET status = 'EXPIRED', updated_at = CURRENT_TIMESTAMP
         WHERE id = $1 AND farmer_id = $2`,
        [listingId, userId]
      );
      return ApiResponse.success(res, null, 'Listing delisted successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/marketplace/crops-benchmark
   * 25 Bandarawela crops with Keppetipola prices
   */
  static async getCropsBenchmark(req, res, next) {
    try {
      const result = await db.query(
        `SELECT id, crop_code, name_en, name_si, name_ta, standard_price_per_kg, price_range_min, price_range_max
         FROM crops ORDER BY name_en ASC`
      );
      return ApiResponse.success(res, result.rows || [], 'Crops benchmark retrieved');
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/marketplace/search
   * Search nearby surplus crops filtered by proximity
   */
  static async searchNearby(req, res, next) {
    try {
      const {
        lat = 6.8322,
        lng = 80.9980,
        radius_km = 5.0,
        crop_id,
        sort = 'distance'
      } = req.query;

      let query = `
        SELECT
          l.*,
          c.crop_code,
          c.name_en as crop_name_en,
          c.name_si as crop_name_si,
          c.name_ta as crop_name_ta,
          c.standard_price_per_kg,
          u.full_name as farmer_name,
          u.phone as farmer_phone
        FROM marketplace_listings l
        JOIN crops c ON c.id = l.crop_id
        JOIN users u ON u.id = l.farmer_id
        WHERE l.status = 'AVAILABLE'
      `;
      const params = [];

      if (crop_id) {
        params.push(crop_id);
        query += ` AND l.crop_id = $${params.length}`;
      }

      const result = await db.query(query, params);
      let listings = result.rows || [];

      // Filter and compute distances via Haversine
      let nearbyListings = GeofencingService.filterByProximity(
        parseFloat(lat),
        parseFloat(lng),
        listings,
        parseFloat(radius_km)
      );

      // Sort
      if (sort === 'price_asc') {
        nearbyListings.sort((a, b) => parseFloat(a.price_per_kg) - parseFloat(b.price_per_kg));
      } else if (sort === 'quantity_desc') {
        nearbyListings.sort((a, b) => parseFloat(b.quantity_kg) - parseFloat(a.quantity_kg));
      }

      return ApiResponse.success(res, nearbyListings, `Found ${nearbyListings.length} surplus listings within ${radius_km}km`);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/marketplace/orders
   * Retrieve order history for current authenticated user
   */
  static async getOrders(req, res, next) {
    try {
      const userId = req.user ? req.user.id : null;
      const role = req.user ? req.user.role : null;

      let query = `
        SELECT
          o.*,
          l.crop_id,
          c.name_en as crop_name_en,
          c.name_si as crop_name_si,
          c.name_ta as crop_name_ta,
          f.full_name as farmer_name,
          f.phone as farmer_phone,
          b.full_name as buyer_name,
          b.phone as buyer_phone,
          b.business_name as buyer_business
        FROM marketplace_orders o
        JOIN marketplace_listings l ON l.id = o.listing_id
        JOIN crops c ON c.id = l.crop_id
        JOIN users f ON f.id = l.farmer_id
        JOIN users b ON b.id = o.buyer_id
      `;
      const params = [];

      if (role === 'BUYER' && userId) {
        params.push(userId);
        query += ` WHERE o.buyer_id = $1`;
      } else if (role === 'FARMER' && userId) {
        params.push(userId);
        query += ` WHERE l.farmer_id = $1`;
      }

      query += ` ORDER BY o.created_at DESC`;
      const result = await db.query(query, params);

      return ApiResponse.success(res, result.rows || [], 'Orders history retrieved');
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/marketplace/orders
   * Place an order with 30-minute auto-expiry window (Buyer only)
   */
  static async placeOrder(req, res, next) {
    try {
      const {
        listing_id,
        requested_quantity_kg,
        offered_price_per_kg,
        notes
      } = req.body;

      const buyerId = req.user ? req.user.id : null;
      if (!buyerId) {
        return ApiResponse.error(res, 'Authentication required to place an order', 401);
      }

      // Check listing availability
      const listingRes = await db.query('SELECT * FROM marketplace_listings WHERE id = $1', [listing_id]);
      if (listingRes.rows.length === 0) {
        return ApiResponse.error(res, 'Listing not found', 404);
      }

      const listing = listingRes.rows[0];
      if (listing.status !== 'AVAILABLE') {
        return ApiResponse.error(res, `Listing is not available (status: ${listing.status})`, 400);
      }

      const qty = parseFloat(requested_quantity_kg);
      const unitPrice = parseFloat(offered_price_per_kg) || parseFloat(listing.price_per_kg);
      const totalAmount = qty * unitPrice;
      const orderCode = `ASV-ORD-${Math.floor(1000 + Math.random() * 9000)}`;

      // 30-minute deadline for farmer acceptance as per SRS
      const responseDeadline = new Date(Date.now() + 30 * 60 * 1000);

      const orderRes = await db.query(
        `INSERT INTO marketplace_orders
         (order_code, listing_id, buyer_id, requested_quantity_kg, offered_price_per_kg, total_price, status, response_deadline, notes)
         VALUES ($1, $2, $3, $4, $5, $6, 'PENDING', $7, $8)
         RETURNING *`,
        [orderCode, listing_id, buyerId, qty, unitPrice, totalAmount, responseDeadline, notes || null]
      );

      const order = orderRes.rows[0];

      // Add system chat message to initiate thread
      const buyerName = req.user ? req.user.full_name : 'Buyer';
      realtimeStore.addChatMessage(
        listing_id,
        order.id,
        buyerId,
        buyerName,
        'BUYER',
        `Order placed for ${qty}kg at LKR ${unitPrice}/kg (Total LKR ${totalAmount.toLocaleString()}). Awaiting farmer response.`
      );

      return ApiResponse.success(res, order, 'Order request submitted to farmer with 30-minute window', 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/v1/marketplace/orders/:orderId/respond
   * Farmer responds to order: ACCEPT, DECLINE, COUNTER_OFFER
   */
  static async respondToOrder(req, res, next) {
    try {
      const { orderId } = req.params;
      const { action, counterPricePerKg, note } = req.body;
      const userId = req.user ? req.user.id : null;

      const orderRes = await db.query(
        `SELECT o.*, l.farmer_id
         FROM marketplace_orders o
         JOIN marketplace_listings l ON l.id = o.listing_id
         WHERE o.id = $1`,
        [orderId]
      );

      if (orderRes.rows.length === 0) {
        return ApiResponse.error(res, 'Order not found', 404);
      }

      const order = orderRes.rows[0];
      if (userId && order.farmer_id !== userId) {
        return ApiResponse.error(res, 'Unauthorized: only listing owner can respond to order', 403);
      }

      let newStatus = 'PENDING';
      let totalAmount = order.total_price;

      if (action === 'ACCEPT') {
        newStatus = 'ACCEPTED';
      } else if (action === 'DECLINE') {
        newStatus = 'DECLINED';
      } else if (action === 'COUNTER_OFFER') {
        newStatus = 'COUNTER_OFFER';
        if (counterPricePerKg) {
          totalAmount = parseFloat(order.requested_quantity_kg) * parseFloat(counterPricePerKg);
        }
      } else {
        return ApiResponse.error(res, 'Invalid action. Expected ACCEPT, DECLINE, or COUNTER_OFFER', 400);
      }

      const updateRes = await db.query(
        `UPDATE marketplace_orders
         SET status = $1,
             offered_price_per_kg = COALESCE($2, offered_price_per_kg),
             total_price = $3,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $4
         RETURNING *`,
        [newStatus, counterPricePerKg || null, totalAmount, orderId]
      );

      return ApiResponse.success(res, updateRes.rows[0], `Order ${newStatus.toLowerCase()} successfully`);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/marketplace/orders/:orderId/messages
   */
  static async getMessages(req, res, next) {
    try {
      const { orderId } = req.params;
      const history = realtimeStore.getChatHistory(orderId);
      return ApiResponse.success(res, history, 'Chat history retrieved');
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/marketplace/orders/:orderId/messages
   */
  static async sendMessage(req, res, next) {
    try {
      const { orderId } = req.params;
      const { text, listingId = 1 } = req.body;
      const user = req.user || { id: 1, full_name: 'User', role: 'BUYER' };

      const msg = realtimeStore.addChatMessage(listingId, orderId, user.id, user.full_name, user.role, text);
      return ApiResponse.success(res, msg, 'Message sent', 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/marketplace/buyer-summary
   * Returns real DB metrics for the Local Buyer dashboard
   */
  static async getBuyerSummary(req, res, next) {
    try {
      const buyerLat = parseFloat(req.query.lat) || 6.8322;
      const buyerLon = parseFloat(req.query.lon) || 80.9980;
      const radiusKm = 5;

      // --- 1. Fetch all AVAILABLE listings ---
      const listingsRes = await db.query(`SELECT * FROM marketplace_listings WHERE status = 'AVAILABLE'`);
      const allListings = listingsRes.rows || [];

      // --- 2. Use GeofencingService.filterByProximity for 5km filter ---
      const nearbyListings = GeofencingService.filterByProximity(buyerLat, buyerLon, allListings, radiusKm);
      const surplus5kmKg = nearbyListings.reduce((acc, l) => acc + (parseFloat(l.quantity_kg) || 0), 0);

      // --- 3. All listings with distance for display ---
      const allWithDist = GeofencingService.filterByProximity(buyerLat, buyerLon, allListings, 9999);

      // --- 4. Active verified farms (unique farmer_ids in AVAILABLE listings) ---
      const farmerIds = [...new Set(allListings.map(l => l.farmer_id))];
      const activeVerifiedFarmsCount = farmerIds.length;

      // --- 5. Average wholesale price from price_history ---
      const priceRes = await db.query('SELECT * FROM price_history');
      const priceRows = priceRes.rows || [];
      const avgWholesalePrice = priceRows.length > 0
        ? Math.round(priceRows.reduce((a, r) => a + parseFloat(r.price_per_kg || 0), 0) / priceRows.length)
        : 210;

      // --- 6. Buyer order history ---
      const userId = req.user ? req.user.id : null;
      let buyerOrders = [];
      if (userId) {
        const ordersRes = await db.query(`SELECT * FROM marketplace_orders WHERE o.buyer_id = $1`, [userId]);
        buyerOrders = ordersRes.rows || [];
      }
      // Fallback to demo buyer orders for unauthenticated/demo view
      if (buyerOrders.length === 0) {
        const demoRes = await db.query(`SELECT * FROM marketplace_orders WHERE o.buyer_id = $1`, [1788873169736]);
        buyerOrders = demoRes.rows || [];
      }

      const totalOrders = buyerOrders.length;
      const totalSpentLKR = buyerOrders.reduce((a, o) => a + parseFloat(o.total_price || 0), 0);
      const totalProcuredKg = buyerOrders.reduce((a, o) =>
        a + parseFloat(o.quantity_kg || o.requested_quantity_kg || 0), 0);
      const completedCount = buyerOrders.filter(o => o.status === 'DELIVERED' || o.status === 'COMPLETED').length;
      const recentOrders = buyerOrders.slice(0, 5).map(o => ({
        id: o.id,
        order_code: o.order_code,
        crop_name: o.crop_name || o.crop_name_en,
        quantity_kg: o.quantity_kg || o.requested_quantity_kg,
        total_price: o.total_price,
        status: o.status,
        farmer_name: o.farmer_name,
        farmer_location: o.farmer_location,
        date_received: o.date_received || o.created_at
      }));

      return ApiResponse.success(res, {
        surplus5kmKg,
        activeVerifiedFarmsCount,
        avgWholesalePrice,
        radiusKm,
        buyerHistorySummary: {
          totalOrders,
          totalSpentLKR,
          totalProcuredKg,
          completedCount,
          recentOrders
        },
        surplusCrops: allWithDist.slice(0, 12)
      }, 'Buyer summary loaded');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = MarketplaceController;
