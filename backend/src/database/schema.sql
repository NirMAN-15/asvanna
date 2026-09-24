-- ==============================================================================
-- ASVANNA - Complete PostgreSQL Database Schema v2.0
-- Institute of Technology, University of Moratuwa - Final Year Project
-- Pilot Deployment: Bandarawela, Uva Province, Sri Lanka
-- ==============================================================================

-- Enable UUID extension if supported
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100),
    middle_name VARCHAR(100),
    last_name VARCHAR(100),
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    nic VARCHAR(20) UNIQUE,
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('FARMER', 'OFFICER', 'BUYER', 'ADMIN')),
    language_preference VARCHAR(10) DEFAULT 'si' CHECK (language_preference IN ('si', 'ta', 'en')),
    district VARCHAR(100) DEFAULT 'Badulla',
    division VARCHAR(100) DEFAULT 'Bandarawela',
    gnd_division VARCHAR(100),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100) DEFAULT 'Bandarawela',
    postal_code VARCHAR(20) DEFAULT '90100',
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    total_land_size DECIMAL(8, 2),
    preferred_search_radius DECIMAL(4, 1) DEFAULT 5.0,
    business_name VARCHAR(200),
    business_type VARCHAR(50),
    profile_photo_url TEXT,
    fcm_token TEXT,
    verification_status VARCHAR(20) DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING', 'APPROVED', 'REJECTED')),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Master Crops Table (Bandarawela Upcountry Vegetables)
CREATE TABLE IF NOT EXISTS crops (
    id SERIAL PRIMARY KEY,
    crop_code VARCHAR(50) UNIQUE NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    name_si VARCHAR(100) NOT NULL,
    name_ta VARCHAR(100) NOT NULL,
    category VARCHAR(50) DEFAULT 'Upcountry Vegetable',
    growth_duration_days INT NOT NULL,
    optimal_temp_min DECIMAL(4, 1),
    optimal_temp_max DECIMAL(4, 1),
    optimal_humidity_min DECIMAL(4, 1),
    optimal_humidity_max DECIMAL(4, 1),
    rainfall_min_mm INT,
    rainfall_max_mm INT,
    soil_type VARCHAR(100),
    avg_yield_per_acre_kg DECIMAL(10, 2) NOT NULL,
    standard_price_per_kg DECIMAL(8, 2) DEFAULT 0.00,
    price_range_min DECIMAL(8, 2) DEFAULT 0.00,
    price_range_max DECIMAL(8, 2) DEFAULT 0.00,
    standard_demand_kg DECIMAL(12, 2) DEFAULT 100000.00,
    waterlog_sensitive BOOLEAN DEFAULT FALSE,
    disease_susceptibility VARCHAR(20) DEFAULT 'MODERATE',
    image_url TEXT,
    description_en TEXT,
    description_si TEXT,
    description_ta TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Planting Records Table
CREATE TABLE IF NOT EXISTS planting_records (
    id SERIAL PRIMARY KEY,
    farmer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    crop_id INT NOT NULL REFERENCES crops(id),
    land_size_acres DECIMAL(6, 2) NOT NULL CHECK (land_size_acres > 0),
    expected_yield_kg DECIMAL(10, 2) NOT NULL,
    planting_date DATE NOT NULL,
    expected_harvest_date DATE NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    district VARCHAR(100) NOT NULL DEFAULT 'Badulla',
    division VARCHAR(100) NOT NULL DEFAULT 'Bandarawela',
    status VARCHAR(20) DEFAULT 'PLANTED' CHECK (status IN ('PLANTED', 'GROWING', 'HARVESTED', 'CANCELLED')),
    entered_by_type VARCHAR(20) DEFAULT 'FARMER' CHECK (entered_by_type IN ('FARMER', 'OFFICER')),
    officer_id INT REFERENCES users(id) ON DELETE SET NULL,
    sync_status VARCHAR(20) DEFAULT 'SYNCED' CHECK (sync_status IN ('PENDING', 'SYNCED', 'FAILED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. CROPIX Demand Benchmarks Table
CREATE TABLE IF NOT EXISTS cropix_demand_benchmarks (
    id SERIAL PRIMARY KEY,
    crop_id INT NOT NULL REFERENCES crops(id),
    district VARCHAR(100) NOT NULL,
    target_month INT NOT NULL CHECK (target_month BETWEEN 1 AND 12),
    target_year INT NOT NULL,
    national_demand_kg DECIMAL(12, 2) NOT NULL,
    regional_quota_kg DECIMAL(12, 2) NOT NULL,
    current_market_gap_kg DECIMAL(12, 2) DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(crop_id, district, target_month, target_year)
);

-- 5. Predictive Risk Assessments Table
CREATE TABLE IF NOT EXISTS risk_assessments (
    id SERIAL PRIMARY KEY,
    crop_id INT NOT NULL REFERENCES crops(id),
    district VARCHAR(100) NOT NULL,
    total_planted_acres DECIMAL(10, 2) NOT NULL,
    estimated_supply_kg DECIMAL(12, 2) NOT NULL,
    target_demand_kg DECIMAL(12, 2) NOT NULL,
    risk_percentage DECIMAL(5, 2) NOT NULL,
    risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('SAFE', 'WARNING', 'OVER_PLANTED')),
    over_planting_score DECIMAL(5, 2) DEFAULT 0.0,
    weather_risk_score DECIMAL(5, 2) DEFAULT 0.0,
    seasonal_risk_score DECIMAL(5, 2) DEFAULT 0.0,
    price_risk_score DECIMAL(5, 2) DEFAULT 0.0,
    composite_risk_score DECIMAL(5, 2) DEFAULT 0.0,
    evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Smart Crop Recommendations Table
CREATE TABLE IF NOT EXISTS crop_recommendations (
    id SERIAL PRIMARY KEY,
    crop_id INT NOT NULL REFERENCES crops(id),
    district VARCHAR(100) NOT NULL,
    suitability_score DECIMAL(5, 2) NOT NULL,
    market_gap_score DECIMAL(5, 2) NOT NULL,
    weather_score DECIMAL(5, 2) NOT NULL,
    price_trend_score DECIMAL(5, 2) NOT NULL,
    seasonal_fit_score DECIMAL(5, 2) DEFAULT 80.0,
    composite_score DECIMAL(5, 2) NOT NULL,
    rationale TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Zero-Waste Marketplace Listings Table
CREATE TABLE IF NOT EXISTS marketplace_listings (
    id SERIAL PRIMARY KEY,
    farmer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    crop_id INT NOT NULL REFERENCES crops(id),
    quantity_kg DECIMAL(10, 2) NOT NULL CHECK (quantity_kg > 0),
    price_per_kg DECIMAL(8, 2) NOT NULL CHECK (price_per_kg > 0),
    available_from DATE NOT NULL,
    available_to DATE NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    pickup_address TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    status VARCHAR(20) DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'RESERVED', 'SOLD', 'EXPIRED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Marketplace Orders & Offers Table
CREATE TABLE IF NOT EXISTS marketplace_orders (
    id SERIAL PRIMARY KEY,
    order_code VARCHAR(30) UNIQUE,
    listing_id INT NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
    buyer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    requested_quantity_kg DECIMAL(10, 2) NOT NULL,
    offered_price_per_kg DECIMAL(8, 2) NOT NULL,
    total_price DECIMAL(12, 2),
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED', 'COUNTER_OFFER', 'COMPLETED', 'CANCELLED', 'EXPIRED')),
    response_deadline TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Divisional Officer Broadcast Warnings Table
CREATE TABLE IF NOT EXISTS broadcast_warnings (
    id SERIAL PRIMARY KEY,
    officer_id INT NOT NULL REFERENCES users(id),
    title_en VARCHAR(200) NOT NULL,
    title_si VARCHAR(200) NOT NULL,
    title_ta VARCHAR(200) NOT NULL,
    message_en TEXT NOT NULL,
    message_si TEXT NOT NULL,
    message_ta TEXT NOT NULL,
    target_district VARCHAR(100) NOT NULL,
    target_division VARCHAR(100),
    target_crop_id INT REFERENCES crops(id),
    severity VARCHAR(20) DEFAULT 'MEDIUM' CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    sent_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Weather Cache Table
CREATE TABLE IF NOT EXISTS weather_cache (
    id SERIAL PRIMARY KEY,
    location_key VARCHAR(50) NOT NULL DEFAULT 'bandarawela',
    latitude DECIMAL(10, 8) NOT NULL DEFAULT 6.8304,
    longitude DECIMAL(11, 8) NOT NULL DEFAULT 80.9878,
    forecast_date DATE NOT NULL,
    temp_min DECIMAL(4, 1),
    temp_max DECIMAL(4, 1),
    temp_avg DECIMAL(4, 1),
    humidity_avg DECIMAL(4, 1),
    rainfall_mm DECIMAL(6, 1),
    wind_speed_avg DECIMAL(4, 1),
    precipitation_probability INT,
    weather_risk_score DECIMAL(5, 2),
    raw_data JSONB,
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(location_key, forecast_date)
);

-- 12. Crop Seasons Table (Maha / Yala / Inter-monsoon Suitability)
CREATE TABLE IF NOT EXISTS crop_seasons (
    id SERIAL PRIMARY KEY,
    crop_id INT NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
    season_name VARCHAR(20) NOT NULL CHECK (season_name IN ('MAHA', 'YALA', 'INTER_MONSOON')),
    optimal_start_month INT NOT NULL CHECK (optimal_start_month BETWEEN 1 AND 12),
    optimal_end_month INT NOT NULL CHECK (optimal_end_month BETWEEN 1 AND 12),
    suitability VARCHAR(10) DEFAULT 'GOOD' CHECK (suitability IN ('BEST', 'GOOD', 'MODERATE', 'POOR')),
    suitability_score DECIMAL(5, 2) DEFAULT 80.0,
    notes TEXT,
    UNIQUE(crop_id, season_name)
);

-- 13. Price History Table (Daily Keppetipola / Dambulla Wholesale Rates)
CREATE TABLE IF NOT EXISTS price_history (
    id SERIAL PRIMARY KEY,
    crop_id INT NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
    market_name VARCHAR(100) DEFAULT 'Keppetipola Economic Centre',
    price_per_kg DECIMAL(8, 2) NOT NULL,
    price_date DATE NOT NULL,
    source VARCHAR(50) DEFAULT 'OFFICER_ENTRY',
    entered_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(crop_id, market_name, price_date)
);

-- 14. Notification Logs Table
CREATE TABLE IF NOT EXISTS notification_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    broadcast_id INT REFERENCES broadcast_warnings(id) ON DELETE SET NULL,
    notification_type VARCHAR(30) NOT NULL,
    channel VARCHAR(10) DEFAULT 'FCM' CHECK (channel IN ('FCM', 'IN_APP')),
    title TEXT,
    body TEXT,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SENT', 'DELIVERED', 'FAILED')),
    fcm_token TEXT,
    error_message TEXT,
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    delivered_at TIMESTAMP WITH TIME ZONE
);

-- 15. Farmer Verification Queue Table (Officer Validation Workflow)
CREATE TABLE IF NOT EXISTS farmer_verifications (
    id SERIAL PRIMARY KEY,
    farmer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    verification_status VARCHAR(20) DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING', 'APPROVED', 'REJECTED')),
    nic_verified BOOLEAN DEFAULT FALSE,
    land_gps_verified BOOLEAN DEFAULT FALSE,
    land_size_verified BOOLEAN DEFAULT FALSE,
    verified_by INT REFERENCES users(id) ON DELETE SET NULL,
    rejection_reason TEXT,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Idempotent Column Additions for Existing Tables
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_land_size DECIMAL(8, 2);
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_search_radius DECIMAL(4, 1) DEFAULT 5.0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS business_name VARCHAR(200);
ALTER TABLE users ADD COLUMN IF NOT EXISTS business_type VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'PENDING';

ALTER TABLE crops ADD COLUMN IF NOT EXISTS optimal_humidity_min DECIMAL(4, 1);
ALTER TABLE crops ADD COLUMN IF NOT EXISTS optimal_humidity_max DECIMAL(4, 1);
ALTER TABLE crops ADD COLUMN IF NOT EXISTS price_range_min DECIMAL(8, 2) DEFAULT 0.00;
ALTER TABLE crops ADD COLUMN IF NOT EXISTS price_range_max DECIMAL(8, 2) DEFAULT 0.00;
ALTER TABLE crops ADD COLUMN IF NOT EXISTS standard_demand_kg DECIMAL(12, 2) DEFAULT 100000.00;
ALTER TABLE crops ADD COLUMN IF NOT EXISTS waterlog_sensitive BOOLEAN DEFAULT FALSE;
ALTER TABLE crops ADD COLUMN IF NOT EXISTS disease_susceptibility VARCHAR(20) DEFAULT 'MODERATE';
ALTER TABLE crops ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE crops ADD COLUMN IF NOT EXISTS description_en TEXT;
ALTER TABLE crops ADD COLUMN IF NOT EXISTS description_si TEXT;
ALTER TABLE crops ADD COLUMN IF NOT EXISTS description_ta TEXT;

ALTER TABLE risk_assessments ADD COLUMN IF NOT EXISTS over_planting_score DECIMAL(5, 2) DEFAULT 0.0;
ALTER TABLE risk_assessments ADD COLUMN IF NOT EXISTS weather_risk_score DECIMAL(5, 2) DEFAULT 0.0;
ALTER TABLE risk_assessments ADD COLUMN IF NOT EXISTS seasonal_risk_score DECIMAL(5, 2) DEFAULT 0.0;
ALTER TABLE risk_assessments ADD COLUMN IF NOT EXISTS price_risk_score DECIMAL(5, 2) DEFAULT 0.0;
ALTER TABLE risk_assessments ADD COLUMN IF NOT EXISTS composite_risk_score DECIMAL(5, 2) DEFAULT 0.0;

ALTER TABLE crop_recommendations ADD COLUMN IF NOT EXISTS seasonal_fit_score DECIMAL(5, 2) DEFAULT 80.0;

-- Indices for High Performance
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_verification ON users(verification_status);
CREATE INDEX IF NOT EXISTS idx_planting_farmer ON planting_records(farmer_id);
CREATE INDEX IF NOT EXISTS idx_planting_crop_dist ON planting_records(crop_id, district);
CREATE INDEX IF NOT EXISTS idx_planting_status ON planting_records(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_status ON marketplace_listings(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_location ON marketplace_listings(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_risk_crop_district ON risk_assessments(crop_id, district);
CREATE INDEX IF NOT EXISTS idx_weather_location_date ON weather_cache(location_key, forecast_date);
CREATE INDEX IF NOT EXISTS idx_price_history_crop_date ON price_history(crop_id, price_date);
CREATE INDEX IF NOT EXISTS idx_crop_seasons_crop ON crop_seasons(crop_id);
