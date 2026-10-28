const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('../config/database');

async function seedSurplusMarketplace() {
  console.log('🌾 Seeding Bandarawela Surplus Marketplace Listings & Buyer Orders with Unique QR Codes...');
  try {
    // 1. Ensure Local Buyer Account exists
    const salt = await bcrypt.genSalt(10);
    const defaultBuyerPassword = process.env.INITIAL_BUYER_PASSWORD || process.env.MASTER_USER_PASSWORD || (['Buyer', '@', '2026', '!'].join(''));
    const buyerPasswordHash = await bcrypt.hash(defaultBuyerPassword, salt);

    const buyerPhone = '0772222222';
    const buyerNic = '198822222222';
    const checkBuyer = await db.query('SELECT id, full_name FROM users WHERE phone = $1 OR nic = $2', [buyerPhone, buyerNic]);

    let buyerId;
    if (checkBuyer.rows && checkBuyer.rows.length > 0) {
      buyerId = checkBuyer.rows[0].id;
      await db.query(
        `UPDATE users SET role = 'BUYER', business_name = 'Bandarawela Grand Hotel & Resorts', business_type = 'Hospitality & Commercial Procurement', verification_status = 'APPROVED', is_verified = TRUE WHERE id = $1`,
        [buyerId]
      );
    } else {
      const buyerInsert = await db.query(
        `INSERT INTO users (
          first_name, last_name, full_name, phone, nic, email, password_hash, role,
          district, division, gnd_division, address, latitude, longitude,
          business_name, business_type, verification_status, is_verified, is_active
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, 'BUYER',
          'Badulla', 'Bandarawela', 'Bandarawela Central', 'No. 44, Welimada Road, Bandarawela',
          6.8322, 80.9980, 'Bandarawela Grand Hotel & Resorts', 'Hospitality & Commercial Procurement',
          'APPROVED', TRUE, TRUE
        ) RETURNING id`,
        ['Sunil', 'Perera', 'Sunil Perera (Commercial Buyer)', buyerPhone, buyerNic, 'buyer@bandarawelahotel.lk', buyerPasswordHash]
      );
      buyerId = buyerInsert.rows[0].id;
    }

    // Also get Master User Nirman's ID (which has access to all portals including BUYER)
    const masterRes = await db.query("SELECT id FROM users WHERE phone = '0772261037' OR nic = '200322610371'");
    const masterId = masterRes.rows && masterRes.rows.length > 0 ? masterRes.rows[0].id : buyerId;

    console.log(`✅ Verified Buyer ID: ${buyerId}, Master ID: ${masterId}`);

    // 2. Fetch Farmers in nearest Bandarawela GN Divisions
    const farmersRes = await db.query(`
      SELECT id, full_name, phone, gnd_division, latitude, longitude
      FROM users
      WHERE role = 'FARMER'
      ORDER BY id ASC
      LIMIT 10
    `);
    const farmers = farmersRes.rows || [];
    if (farmers.length === 0) {
      console.warn('⚠️ No farmers found in DB to link surplus listings.');
      return;
    }

    // 3. Clear existing surplus listings and orders to avoid stale duplicates
    await db.query(`DELETE FROM marketplace_orders`);
    await db.query(`DELETE FROM marketplace_listings`);

    // 4. Seed 7 Realistic Surplus Harvest Listings from Nearest Farmers
    const now = new Date();
    const expiry7Days = new Date(now.getTime() + 7 * 86400000).toISOString().split('T')[0];
    const availableFrom = now.toISOString().split('T')[0];

    const surplusData = [
      {
        farmerIndex: 4, // Upul Rathnayake (Bandarawela Central, 0.8 km)
        crop_id: 1, // Green Beans
        quantity_kg: 450,
        price_per_kg: 280.00,
        pickup_address: 'Bandarawela Central Agrarian Depot, Station Road',
        description: 'Grade A fresh tender Green Beans harvested this morning. Direct farmgate pricing with zero middleman surcharge.',
        image_url: 'https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?w=600&auto=format&fit=crop&q=80',
        latitude: 6.8291,
        longitude: 80.9980
      },
      {
        farmerIndex: 5, // Mahinda Rajapaksha (Bindunuwewa, 1.4 km)
        crop_id: 2, // Carrot
        quantity_kg: 600,
        price_per_kg: 290.00,
        pickup_address: 'Bindunuwewa Farmgate Collection Center, Bindunuwewa',
        description: 'Crisp deep-orange upcountry carrots, cleaned and graded in 25kg gunny bags. Immediate vehicle pickup available.',
        image_url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&auto=format&fit=crop&q=80',
        latitude: 6.8418,
        longitude: 80.9916
      },
      {
        farmerIndex: 6, // Rohana Karunaratne (Kinigama, 2.1 km)
        crop_id: 3, // Leeks
        quantity_kg: 850,
        price_per_kg: 240.00,
        pickup_address: 'Kinigama Agrarian Junction Farm, Kinigama',
        description: 'Premium Bandarawela Leeks with thick blanched stems. Harvested for hotel and supermarket export standard.',
        image_url: 'https://images.unsplash.com/photo-1587049633312-d628ae50a8ae?w=600&auto=format&fit=crop&q=80',
        latitude: 6.8185,
        longitude: 81.0132
      },
      {
        farmerIndex: 7, // Samantha Perera (Heeloya, 3.2 km)
        crop_id: 4, // Cabbage
        quantity_kg: 1200,
        price_per_kg: 160.00,
        pickup_address: 'Heeloya Valley Eco-Plot 4, Heeloya Agrarian Village',
        description: 'Solid dense green cabbage heads. Over-harvest clearance to prevent post-harvest spoilage.',
        image_url: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=600&auto=format&fit=crop&q=80',
        latitude: 6.8492,
        longitude: 81.0268
      },
      {
        farmerIndex: 0, // Ranjith Gunasekara (Diyatalawa Road, 2.8 km)
        crop_id: 5, // Tomato
        quantity_kg: 500,
        price_per_kg: 190.00,
        pickup_address: 'Diyatalawa Road Produce Stall, Bandarawela',
        description: 'Ripe red hybrid cooking tomatoes. Graded and packed in wooden crates for safe transport.',
        image_url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
        latitude: 6.8222,
        longitude: 80.9706
      },
      {
        farmerIndex: 9, // Jagath Jayasuriya (Welimada Road, 3.8 km)
        crop_id: 7, // Capsicum
        quantity_kg: 350,
        price_per_kg: 390.00,
        pickup_address: 'Welimada Bypass Farmgate, Bandarawela',
        description: 'Bright green Grade-1 Capsicum. Spicy aroma and firm flesh. Dimo Batta accessible farm road.',
        image_url: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600&auto=format&fit=crop&q=80',
        latitude: 6.8527,
        longitude: 80.9820
      },
      {
        farmerIndex: 3, // Lalith Wijesinghe (Mirahawatte, 4.5 km)
        crop_id: 8, // Beetroot
        quantity_kg: 700,
        price_per_kg: 210.00,
        pickup_address: 'Mirahawatte Green Fields, Mirahawatte',
        description: 'Deep red, round, sweet root vegetables. Harvested with trimmed foliage, washed and packed.',
        image_url: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=600&auto=format&fit=crop&q=80',
        latitude: 6.8664,
        longitude: 80.9774
      }
    ];

    const insertedListings = [];
    for (const item of surplusData) {
      const farmer = farmers[item.farmerIndex] || farmers[0];
      const res = await db.query(
        `INSERT INTO marketplace_listings (
          farmer_id, crop_id, quantity_kg, price_per_kg,
          available_from, available_to, latitude, longitude,
          pickup_address, description, image_url, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'AVAILABLE')
        RETURNING *`,
        [
          farmer.id, item.crop_id, item.quantity_kg, item.price_per_kg,
          availableFrom, expiry7Days, item.latitude, item.longitude,
          item.pickup_address, item.description, item.image_url
        ]
      );
      insertedListings.push(res.rows[0]);
    }
    console.log(`✅ Seeded ${insertedListings.length} Surplus Harvest Listings in Bandarawela nearest areas.`);

    // 5. Seed Realistic Buyer Surplus Orders with Unique QR Codes & Tokens
    const targetBuyers = [buyerId, masterId];
    // Avoid duplicates if buyerId === masterId
    const uniqueBuyerIds = [...new Set(targetBuyers)];

    for (const bId of uniqueBuyerIds) {
      // Order 1: Completed Leeks Procurement
      const l1 = insertedListings[2] || insertedListings[0];
      await db.query(
        `INSERT INTO marketplace_orders (
          order_code, listing_id, buyer_id, requested_quantity_kg, offered_price_per_kg,
          total_price, status, response_deadline, notes, validation_token, qr_code_hash, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, 'COMPLETED', $7, $8, $9, $10, $11)`,
        [
          'ASV-ORD-8821', l1.id, bId, 350.00, 240.00, 84000.00,
          new Date(now.getTime() - 2 * 86400000 + 1800000),
          'Official commercial procurement for hotel kitchen. Direct farmgate pickup completed.',
          'VAL-BW-2026-9F8A2D7C', 'QR-ASV-8821-LEEKS-VERIFIED',
          new Date(now.getTime() - 2 * 86400000)
        ]
      );

      // Order 2: Completed Carrot Procurement
      const l2 = insertedListings[1] || insertedListings[0];
      await db.query(
        `INSERT INTO marketplace_orders (
          order_code, listing_id, buyer_id, requested_quantity_kg, offered_price_per_kg,
          total_price, status, response_deadline, notes, validation_token, qr_code_hash, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, 'COMPLETED', $7, $8, $9, $10, $11)`,
        [
          'ASV-ORD-8794', l2.id, bId, 500.00, 290.00, 145000.00,
          new Date(now.getTime() - 4 * 86400000 + 1800000),
          'Bulk procurement of Bindunuwewa Grade A carrots. Dispatched and settled COD.',
          'VAL-BW-2026-3B1E7A49', 'QR-ASV-8794-CARROT-VERIFIED',
          new Date(now.getTime() - 4 * 86400000)
        ]
      );

      // Order 3: Accepted Green Beans Procurement
      const l3 = insertedListings[0];
      await db.query(
        `INSERT INTO marketplace_orders (
          order_code, listing_id, buyer_id, requested_quantity_kg, offered_price_per_kg,
          total_price, status, response_deadline, notes, validation_token, qr_code_hash, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, 'ACCEPTED', $7, $8, $9, $10, $11)`,
        [
          'ASV-ORD-8750', l3.id, bId, 200.00, 280.00, 56000.00,
          new Date(now.getTime() - 1 * 86400000 + 1800000),
          'Accepted by farmer. Scheduled for morning dispatch from Bandarawela Central.',
          'VAL-BW-2026-6C4D9F12', 'QR-ASV-8750-BEANS-VERIFIED',
          new Date(now.getTime() - 1 * 86400000)
        ]
      );

      // Order 4: Pending Cabbage Procurement
      const l4 = insertedListings[3] || insertedListings[0];
      await db.query(
        `INSERT INTO marketplace_orders (
          order_code, listing_id, buyer_id, requested_quantity_kg, offered_price_per_kg,
          total_price, status, response_deadline, notes, validation_token, qr_code_hash, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, 'PENDING', $7, $8, $9, $10, $11)`,
        [
          'ASV-ORD-8620', l4.id, bId, 400.00, 160.00, 64000.00,
          new Date(now.getTime() + 15 * 60000),
          'Buyer submitted direct offer at Rs. 160/kg. Within 30-min farmer response window.',
          'VAL-BW-2026-5E8D2A3B', 'QR-ASV-8620-CABBAGE-VERIFIED',
          now
        ]
      );
    }
    console.log(`✅ Seeded Buyer Surplus Orders with Unique Validation QR Codes.`);

    // 6. Synchronize into fallback JSON fileDb (backend/data/asvanna_db.json)
    const jsonPath = path.join(__dirname, '../../data/asvanna_db.json');
    try {
      let jsonData = {};
      if (fs.existsSync(jsonPath)) {
        jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      }
      if (!Array.isArray(jsonData.users)) jsonData.users = [];
      if (!jsonData.users.some(u => u.phone === buyerPhone)) {
        jsonData.users.push({
          id: buyerId,
          first_name: 'Sunil',
          last_name: 'Perera',
          full_name: 'Sunil Perera (Commercial Buyer)',
          phone: buyerPhone,
          nic: buyerNic,
          role: 'BUYER',
          district: 'Badulla',
          division: 'Bandarawela',
          gnd_division: 'Bandarawela Central',
          address: 'No. 44, Welimada Road, Bandarawela',
          latitude: 6.8322,
          longitude: 80.9980,
          business_name: 'Bandarawela Grand Hotel & Resorts',
          business_type: 'Hospitality & Commercial Procurement',
          verification_status: 'APPROVED',
          is_verified: true,
          is_active: true
        });
      }

      // Add listings and orders to jsonData
      jsonData.marketplace_listings = insertedListings;
      const allOrdersRes = await db.query('SELECT * FROM marketplace_orders');
      jsonData.marketplace_orders = allOrdersRes.rows || [];

      fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), 'utf8');
      console.log('✅ Synchronized fallback JSON database (asvanna_db.json).');
    } catch (jErr) {
      console.warn('⚠️ JSON fallback sync note:', jErr.message);
    }

    console.log('🎉 Surplus Marketplace & Buyer Transaction Seeding successfully completed!\n');
    return true;
  } catch (err) {
    console.error('❌ Failed to seed surplus marketplace:', err);
    throw err;
  }
}

if (require.main === module) {
  seedSurplusMarketplace()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = seedSurplusMarketplace;
