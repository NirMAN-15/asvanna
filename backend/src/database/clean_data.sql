-- ==============================================================================
-- ASVANNA - Clean Database Script (Wipe dummy seed & test data)
-- Preserves Master Crops, Crop Seasons, Price History, and Demand Quotas
-- Removes all dummy users, plantings, verifications, listings, orders, and broadcasts
-- ==============================================================================

TRUNCATE TABLE 
    notification_logs,
    audit_logs,
    broadcast_warnings,
    marketplace_orders,
    marketplace_listings,
    planting_records,
    farmer_verifications,
    users,
    risk_assessments,
    crop_recommendations
RESTART IDENTITY CASCADE;

-- Ensure sequence reset
ALTER SEQUENCE IF EXISTS users_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS planting_records_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS marketplace_listings_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS marketplace_orders_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS broadcast_warnings_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS farmer_verifications_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS notification_logs_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS audit_logs_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS risk_assessments_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS crop_recommendations_id_seq RESTART WITH 1;

-- Verification query
SELECT 'users' AS table_name, count(*) AS remaining_count FROM users
UNION ALL
SELECT 'planting_records', count(*) FROM planting_records
UNION ALL
SELECT 'marketplace_listings', count(*) FROM marketplace_listings
UNION ALL
SELECT 'crops', count(*) FROM crops;
