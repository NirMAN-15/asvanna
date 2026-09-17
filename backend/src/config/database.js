const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const config = require('./config');
const { splitFullName, formatFullName, splitAddress, formatAddress } = require('../utils/nameAddressUtils');

const dataDir = path.join(__dirname, '../../data');
const dbFilePath = path.join(dataDir, 'asvanna_db.json');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 25 Master Crops for Bandarawela & Upcountry (DoA Sri Lanka & CROPIX validated)
const initialCrops = [
  { id: 1, crop_code: 'LEEKS', name_en: 'Leeks', name_si: 'ලීක්ස්', name_ta: 'லீக்ஸ்', category: 'Upcountry Vegetable', growth_duration_days: 90, avg_yield_per_acre_kg: 8500, standard_price_per_kg: 280.00, optimal_temp_min: 12.0, optimal_temp_max: 22.0, waterlog_sensitive: false, disease_susceptibility: 'MODERATE', standard_demand_kg: 95000 },
  { id: 2, crop_code: 'CABBAGE', name_en: 'Cabbage', name_si: 'ගෝවා', name_ta: 'முட்டைக்கோஸ்', category: 'Upcountry Vegetable', growth_duration_days: 75, avg_yield_per_acre_kg: 12000, standard_price_per_kg: 190.00, optimal_temp_min: 14.0, optimal_temp_max: 24.0, waterlog_sensitive: false, disease_susceptibility: 'MODERATE', standard_demand_kg: 120000 },
  { id: 3, crop_code: 'CARROT', name_en: 'Carrot', name_si: 'කැරට්', name_ta: 'கேரட்', category: 'Upcountry Vegetable', growth_duration_days: 85, avg_yield_per_acre_kg: 7500, standard_price_per_kg: 340.00, optimal_temp_min: 13.0, optimal_temp_max: 22.0, waterlog_sensitive: true, disease_susceptibility: 'LOW', standard_demand_kg: 110000 },
  { id: 4, crop_code: 'BEETROOT', name_en: 'Beetroot', name_si: 'බීට්රූට්', name_ta: 'பீட்ரூட்', category: 'Upcountry Vegetable', growth_duration_days: 70, avg_yield_per_acre_kg: 8000, standard_price_per_kg: 260.00, optimal_temp_min: 14.0, optimal_temp_max: 25.0, waterlog_sensitive: false, disease_susceptibility: 'LOW', standard_demand_kg: 75000 },
  { id: 5, crop_code: 'POTATO', name_en: 'Upcountry Potato', name_si: 'අර්තාපල්', name_ta: 'உருளைக்கிழங்கு', category: 'Upcountry Vegetable', growth_duration_days: 100, avg_yield_per_acre_kg: 8000, standard_price_per_kg: 390.00, optimal_temp_min: 12.0, optimal_temp_max: 20.0, waterlog_sensitive: true, disease_susceptibility: 'HIGH', standard_demand_kg: 150000 },
  { id: 6, crop_code: 'BEANS', name_en: 'Green Beans', name_si: 'බෝංචි', name_ta: 'போஞ்சி', category: 'Upcountry Vegetable', growth_duration_days: 60, avg_yield_per_acre_kg: 5000, standard_price_per_kg: 320.00, optimal_temp_min: 15.0, optimal_temp_max: 26.0, waterlog_sensitive: false, disease_susceptibility: 'MODERATE', standard_demand_kg: 80000 },
  { id: 7, crop_code: 'TOMATO', name_en: 'Tomato', name_si: 'තක්කාලි', name_ta: 'தக்காளி', category: 'Upcountry Vegetable', growth_duration_days: 75, avg_yield_per_acre_kg: 11000, standard_price_per_kg: 220.00, optimal_temp_min: 16.0, optimal_temp_max: 27.0, waterlog_sensitive: true, disease_susceptibility: 'HIGH', standard_demand_kg: 115000 },
  { id: 8, crop_code: 'CAPSICUM', name_en: 'Capsicum', name_si: 'මාළු මිරිස්', name_ta: 'குடை மிளகாய்', category: 'Upcountry Vegetable', growth_duration_days: 80, avg_yield_per_acre_kg: 5500, standard_price_per_kg: 460.00, optimal_temp_min: 16.0, optimal_temp_max: 26.0, waterlog_sensitive: true, disease_susceptibility: 'MODERATE', standard_demand_kg: 65000 },
  { id: 9, crop_code: 'RADISH', name_en: 'Radish', name_si: 'රාබු', name_ta: 'முள்ளங்கி', category: 'Upcountry Vegetable', growth_duration_days: 45, avg_yield_per_acre_kg: 9000, standard_price_per_kg: 140.00, optimal_temp_min: 13.0, optimal_temp_max: 25.0, waterlog_sensitive: false, disease_susceptibility: 'LOW', standard_demand_kg: 50000 },
  { id: 10, crop_code: 'KNOLKHOL', name_en: 'Knol-Khol', name_si: 'නෝකෝල්', name_ta: 'நூல்கோல்', category: 'Upcountry Vegetable', growth_duration_days: 65, avg_yield_per_acre_kg: 7500, standard_price_per_kg: 180.00, optimal_temp_min: 14.0, optimal_temp_max: 24.0, waterlog_sensitive: false, disease_susceptibility: 'LOW', standard_demand_kg: 45000 },
  { id: 11, crop_code: 'SPRING_ONION', name_en: 'Spring Onion', name_si: 'ළූණු කොළ', name_ta: 'வெங்காய இலை', category: 'Upcountry Vegetable', growth_duration_days: 50, avg_yield_per_acre_kg: 6000, standard_price_per_kg: 280.00, optimal_temp_min: 14.0, optimal_temp_max: 25.0, waterlog_sensitive: false, disease_susceptibility: 'LOW', standard_demand_kg: 35000 },
  { id: 12, crop_code: 'LETTUCE', name_en: 'Lettuce', name_si: 'සලාද කොළ', name_ta: 'லெட்யூஸ்', category: 'Upcountry Vegetable', growth_duration_days: 50, avg_yield_per_acre_kg: 5500, standard_price_per_kg: 320.00, optimal_temp_min: 13.0, optimal_temp_max: 22.0, waterlog_sensitive: true, disease_susceptibility: 'MODERATE', standard_demand_kg: 30000 },
  { id: 13, crop_code: 'CELERY', name_en: 'Celery', name_si: 'සැල්දිරි', name_ta: 'செலரி', category: 'Upcountry Vegetable', growth_duration_days: 85, avg_yield_per_acre_kg: 4800, standard_price_per_kg: 420.00, optimal_temp_min: 13.0, optimal_temp_max: 21.0, waterlog_sensitive: false, disease_susceptibility: 'MODERATE', standard_demand_kg: 25000 },
  { id: 14, crop_code: 'BROCCOLI', name_en: 'Broccoli', name_si: 'බ්‍රොකොලි', name_ta: 'ப்ரோக்கோலி', category: 'Upcountry Vegetable', growth_duration_days: 75, avg_yield_per_acre_kg: 4000, standard_price_per_kg: 680.00, optimal_temp_min: 12.0, optimal_temp_max: 20.0, waterlog_sensitive: false, disease_susceptibility: 'MODERATE', standard_demand_kg: 20000 },
  { id: 15, crop_code: 'CAULIFLOWER', name_en: 'Cauliflower', name_si: 'මල්ගෝවා', name_ta: 'காலிஃபிளவர்', category: 'Upcountry Vegetable', growth_duration_days: 80, avg_yield_per_acre_kg: 6500, standard_price_per_kg: 380.00, optimal_temp_min: 14.0, optimal_temp_max: 22.0, waterlog_sensitive: false, disease_susceptibility: 'MODERATE', standard_demand_kg: 40000 },
  { id: 16, crop_code: 'PUMPKIN', name_en: 'Pumpkin', name_si: 'වට්ටක්කා', name_ta: 'பூசணி', category: 'Adaptable Vegetable', growth_duration_days: 100, avg_yield_per_acre_kg: 10000, standard_price_per_kg: 160.00, optimal_temp_min: 17.0, optimal_temp_max: 28.0, waterlog_sensitive: false, disease_susceptibility: 'LOW', standard_demand_kg: 90000 },
  { id: 17, crop_code: 'BITTER_GOURD', name_en: 'Bitter Gourd', name_si: 'කරවිල', name_ta: 'பாகற்காய்', category: 'Adaptable Vegetable', growth_duration_days: 60, avg_yield_per_acre_kg: 6000, standard_price_per_kg: 340.00, optimal_temp_min: 18.0, optimal_temp_max: 28.0, waterlog_sensitive: false, disease_susceptibility: 'LOW', standard_demand_kg: 45000 },
  { id: 18, crop_code: 'SNAKE_GOURD', name_en: 'Snake Gourd', name_si: 'පතෝල', name_ta: 'புடலங்காய்', category: 'Adaptable Vegetable', growth_duration_days: 55, avg_yield_per_acre_kg: 7500, standard_price_per_kg: 210.00, optimal_temp_min: 18.0, optimal_temp_max: 28.0, waterlog_sensitive: false, disease_susceptibility: 'LOW', standard_demand_kg: 40000 },
  { id: 19, crop_code: 'CUCUMBER', name_en: 'Cucumber', name_si: 'පිපිඤ්ඤා', name_ta: 'வெள்ளரிக்காய்', category: 'Adaptable Vegetable', growth_duration_days: 50, avg_yield_per_acre_kg: 9500, standard_price_per_kg: 160.00, optimal_temp_min: 17.0, optimal_temp_max: 28.0, waterlog_sensitive: false, disease_susceptibility: 'MODERATE', standard_demand_kg: 55000 },
  { id: 20, crop_code: 'GREEN_CHILI', name_en: 'Green Chili', name_si: 'අමු මිරිස්', name_ta: 'பச்சை மிளகாய்', category: 'Upcountry Vegetable', growth_duration_days: 70, avg_yield_per_acre_kg: 4200, standard_price_per_kg: 540.00, optimal_temp_min: 17.0, optimal_temp_max: 28.0, waterlog_sensitive: true, disease_susceptibility: 'HIGH', standard_demand_kg: 50000 },
  { id: 21, crop_code: 'RED_ONION', name_en: 'Red Onion', name_si: 'රතු ළූණු', name_ta: 'சிவப்பு வெங்காயம்', category: 'Upcountry Vegetable', growth_duration_days: 90, avg_yield_per_acre_kg: 5200, standard_price_per_kg: 390.00, optimal_temp_min: 16.0, optimal_temp_max: 27.0, waterlog_sensitive: true, disease_susceptibility: 'MODERATE', standard_demand_kg: 85000 },
  { id: 22, crop_code: 'GOTUKOLA', name_en: 'Centella (Gotukola)', name_si: 'ගොටුකොළ', name_ta: 'வல்லாரை', category: 'Leafy Green', growth_duration_days: 30, avg_yield_per_acre_kg: 3500, standard_price_per_kg: 260.00, optimal_temp_min: 16.0, optimal_temp_max: 28.0, waterlog_sensitive: false, disease_susceptibility: 'LOW', standard_demand_kg: 28000 },
  { id: 23, crop_code: 'KANGKUNG', name_en: 'Water Spinach', name_si: 'කංකුං', name_ta: 'வள்ளல் கீரை', category: 'Leafy Green', growth_duration_days: 25, avg_yield_per_acre_kg: 6000, standard_price_per_kg: 140.00, optimal_temp_min: 18.0, optimal_temp_max: 29.0, waterlog_sensitive: false, disease_susceptibility: 'LOW', standard_demand_kg: 35000 },
  { id: 24, crop_code: 'MUKUNUWENNA', name_en: 'Mukunuwenna', name_si: 'මුකුණුවැන්න', name_ta: 'முக்குனுவென்ன', category: 'Leafy Green', growth_duration_days: 30, avg_yield_per_acre_kg: 4200, standard_price_per_kg: 210.00, optimal_temp_min: 16.0, optimal_temp_max: 28.0, waterlog_sensitive: false, disease_susceptibility: 'LOW', standard_demand_kg: 30000 },
  { id: 25, crop_code: 'SPINACH', name_en: 'Spinach', name_si: 'නිවිති', name_ta: 'பசலைக் கீரை', category: 'Leafy Green', growth_duration_days: 35, avg_yield_per_acre_kg: 5000, standard_price_per_kg: 220.00, optimal_temp_min: 16.0, optimal_temp_max: 27.0, waterlog_sensitive: false, disease_susceptibility: 'LOW', standard_demand_kg: 25000 }
];

const initialDbState = {
  users: [
    {
      id: 1,
      first_name: 'W.',
      middle_name: 'M.',
      last_name: 'Bandara',
      full_name: 'W. M. Bandara (DO Officer)',
      phone: '0771234567',
      nic: '851234567V',
      password_hash: '$2a$10$wN1aP0/zB00vA5zLz.vV/uE221122334455',
      role: 'OFFICER',
      district: 'Badulla',
      division: 'Bandarawela',
      gnd_division: 'Bandarawela Central',
      address_line1: 'DoA Agrarian Services Complex',
      address_line2: 'Badulla Road',
      city: 'Bandarawela',
      postal_code: '90100',
      address: 'DoA Agrarian Services Complex, Badulla Road, Bandarawela, 90100',
      language_preference: 'si',
      verification_status: 'APPROVED',
      is_verified: true
    },
    {
      id: 2,
      first_name: 'Kapila',
      middle_name: null,
      last_name: 'Bandara',
      full_name: 'Kapila Bandara (Farmer)',
      phone: '0712345678',
      nic: '782345678V',
      password_hash: '$2a$10$wN1aP0/zB00vA5zLz.vV/uE221122334455',
      role: 'FARMER',
      district: 'Badulla',
      division: 'Bandarawela',
      gnd_division: 'Bindunuwewa',
      address_line1: 'No. 42',
      address_line2: 'Bindunuwewa Valley, Dowa Temple Road',
      city: 'Bandarawela',
      postal_code: '90100',
      address: 'No. 42, Bindunuwewa Valley, Dowa Temple Road, Bandarawela, 90100',
      total_land_size: 2.5,
      language_preference: 'si',
      verification_status: 'APPROVED',
      is_verified: true
    },
    {
      id: 3,
      first_name: 'Bandarawela',
      middle_name: null,
      last_name: 'Traders',
      full_name: 'Bandarawela Traders',
      phone: '0572222222',
      nic: '903456789V',
      password_hash: '$2a$10$wN1aP0/zB00vA5zLz.vV/uE221122334455',
      role: 'BUYER',
      district: 'Badulla',
      division: 'Bandarawela',
      gnd_division: 'Bandarawela Town',
      address_line1: 'No. 8',
      address_line2: 'Welimada Road, Town Centre',
      city: 'Bandarawela',
      postal_code: '90100',
      address: 'No. 8, Welimada Road, Town Centre, Bandarawela, 90100',
      language_preference: 'en',
      verification_status: 'APPROVED',
      is_verified: true
    },
    {
      id: 4,
      first_name: 'Nirman',
      middle_name: 'Achintha',
      last_name: 'Wedikkara',
      full_name: 'Nirman Achintha Wedikkara (Super Admin)',
      phone: '0770000000',
      nic: '990000000V',
      password_hash: '$2a$10$wN1aP0/zB00vA5zLz.vV/uE221122334455',
      role: 'ADMIN',
      district: 'Badulla',
      division: 'Bandarawela',
      gnd_division: 'Bandarawela Central',
      address_line1: 'No. 15',
      address_line2: 'Station Road, Central Hill',
      city: 'Bandarawela',
      postal_code: '90100',
      address: 'No. 15, Station Road, Central Hill, Bandarawela, 90100',
      language_preference: 'en',
      verification_status: 'APPROVED',
      is_verified: true
    }
  ],
  crops: initialCrops,
  planting_records: [
    { id: 1, farmer_id: 2, farmer_name: 'Kapila Bandara', crop_id: 1, name_en: 'Leeks', name_si: 'ලීක්ස්', land_size_acres: 2.0, expected_yield_kg: 17000, planting_date: '2026-08-01', expected_harvest_date: '2026-11-01', latitude: 6.8322, longitude: 80.9980, district: 'Badulla', division: 'Bandarawela', status: 'PLANTED', entered_by_type: 'FARMER' },
    { id: 2, farmer_id: 2, farmer_name: 'Kapila Bandara', crop_id: 2, name_en: 'Cabbage', name_si: 'ගෝවා', land_size_acres: 3.5, expected_yield_kg: 42000, planting_date: '2026-08-10', expected_harvest_date: '2026-10-25', latitude: 6.8350, longitude: 80.9995, district: 'Badulla', division: 'Bandarawela', status: 'PLANTED', entered_by_type: 'FARMER' }
  ],
  crop_seasons: [
    { id: 1, crop_id: 1, season_name: 'MAHA', optimal_start_month: 10, optimal_end_month: 3, suitability: 'BEST', suitability_score: 95.0 },
    { id: 2, crop_id: 1, season_name: 'YALA', optimal_start_month: 5, optimal_end_month: 8, suitability: 'MODERATE', suitability_score: 65.0 },
    { id: 3, crop_id: 2, season_name: 'MAHA', optimal_start_month: 10, optimal_end_month: 2, suitability: 'BEST', suitability_score: 92.0 },
    { id: 4, crop_id: 3, season_name: 'MAHA', optimal_start_month: 9, optimal_end_month: 1, suitability: 'BEST', suitability_score: 94.0 },
    { id: 5, crop_id: 4, season_name: 'MAHA', optimal_start_month: 9, optimal_end_month: 3, suitability: 'BEST', suitability_score: 90.0 },
    { id: 6, crop_id: 5, season_name: 'MAHA', optimal_start_month: 10, optimal_end_month: 2, suitability: 'BEST', suitability_score: 95.0 },
    { id: 7, crop_id: 6, season_name: 'YALA', optimal_start_month: 5, optimal_end_month: 8, suitability: 'BEST', suitability_score: 92.0 },
    { id: 8, crop_id: 7, season_name: 'YALA', optimal_start_month: 5, optimal_end_month: 8, suitability: 'BEST', suitability_score: 90.0 }
  ],
  price_history: [
    { crop_id: 1, market_name: 'Keppetipola Economic Centre', price_per_kg: 280.00, price_date: new Date().toISOString().split('T')[0] },
    { crop_id: 2, market_name: 'Keppetipola Economic Centre', price_per_kg: 190.00, price_date: new Date().toISOString().split('T')[0] },
    { crop_id: 3, market_name: 'Keppetipola Economic Centre', price_per_kg: 340.00, price_date: new Date().toISOString().split('T')[0] },
    { crop_id: 4, market_name: 'Keppetipola Economic Centre', price_per_kg: 260.00, price_date: new Date().toISOString().split('T')[0] },
    { crop_id: 5, market_name: 'Keppetipola Economic Centre', price_per_kg: 390.00, price_date: new Date().toISOString().split('T')[0] }
  ],
  cropix_demand_benchmarks: [
    { id: 1, crop_id: 1, district: 'Badulla', target_month: new Date().getMonth() + 1, target_year: new Date().getFullYear(), national_demand_kg: 450000, regional_quota_kg: 95000, current_market_gap_kg: 15000 },
    { id: 2, crop_id: 2, district: 'Badulla', target_month: new Date().getMonth() + 1, target_year: new Date().getFullYear(), national_demand_kg: 600000, regional_quota_kg: 120000, current_market_gap_kg: 8000 }
  ],
  marketplace_listings: [],
  marketplace_orders: [],
  broadcast_warnings: [],
  farmer_verifications: [],
  notification_logs: []
};

function loadDb() {
  if (!fs.existsSync(dbFilePath)) {
    fs.writeFileSync(dbFilePath, JSON.stringify(initialDbState, null, 2), 'utf-8');
    return initialDbState;
  }
  try {
    const raw = fs.readFileSync(dbFilePath, 'utf-8');
    const parsed = JSON.parse(raw);
    // Ensure crops are populated with all 25 if older file was present
    if (!parsed.crops || parsed.crops.length < 25) {
      parsed.crops = initialCrops;
      if (!parsed.crop_seasons) parsed.crop_seasons = initialDbState.crop_seasons;
      if (!parsed.price_history) parsed.price_history = initialDbState.price_history;
      saveDb(parsed);
    }
    return parsed;
  } catch (err) {
    return initialDbState;
  }
}

function saveDb(dbData) {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(dbData, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist database file:', err);
  }
}

const fileDb = loadDb();

let pool = null;
try {
  pool = new Pool(config.db);
  pool.on('connect', () => console.log('📦 Connected to PostgreSQL database:', config.db.database));
} catch (e) {
  // Silence error
}

module.exports = {
  query: async (text, params = []) => {
    if (pool) {
      try {
        const res = await pool.query(text, params);
        if (res && res.rows) return res;
      } catch (e) {
        // Fallback to local memory / file DB
      }
    }

    const lower = text.toLowerCase();

    // SELECT Queries
    if (lower.includes('from users where phone')) {
      const phoneVal = params[0];
      return { rows: fileDb.users.filter(u => u.phone === phoneVal) };
    }
    if (lower.includes('from users where id =')) {
      const idVal = Number(params[0]);
      return { rows: fileDb.users.filter(u => Number(u.id) === idVal) };
    }
    if (lower.includes('select count(*) as count from users')) {
      let count = fileDb.users.filter(u => u.role === 'FARMER');
      if (lower.includes("verification_status = 'approved'")) {
        count = count.filter(u => u.verification_status === 'APPROVED');
      } else if (lower.includes("verification_status = 'pending'")) {
        count = count.filter(u => u.verification_status === 'PENDING');
      }
      return { rows: [{ count: count.length }] };
    }
    if (lower.includes('select * from users') || (lower.includes('from users') && lower.includes("role = 'farmer'"))) {
      let rows = fileDb.users;
      if (lower.includes("role = 'farmer'")) {
        rows = rows.filter(u => u.role === 'FARMER');
      }
      if (lower.includes('where verification_status =')) {
        const status = params[0];
        rows = rows.filter(u => u.verification_status === status);
      }
      return { rows };
    }
    if (lower.includes('from crops where id =') || lower.includes('from crops where crop_id =') || lower.includes('from crops where upper(crop_code) =')) {
      const rawVal = params[0];
      const idVal = Number(rawVal);
      const strVal = String(rawVal).replace(/^crop_/i, '').toLowerCase();
      const found = fileDb.crops.find(c =>
        (!isNaN(idVal) && Number(c.id) === idVal) ||
        c.crop_code.toLowerCase() === strVal ||
        c.name_en.toLowerCase() === strVal ||
        `crop_${c.crop_code.toLowerCase()}` === String(rawVal).toLowerCase()
      );
      return { rows: found ? [found] : [] };
    }
    if (lower.includes('from crops where lower(crop_code) like') || lower.includes('from crops\n       where lower(crop_code) like')) {
      const search = params[0].replace(/%/g, '').toLowerCase().replace(/^crop_/i, '');
      const matches = fileDb.crops.filter(c =>
        c.crop_code.toLowerCase().includes(search) ||
        c.name_en.toLowerCase().includes(search) ||
        c.name_si.toLowerCase().includes(search) ||
        c.name_ta.toLowerCase().includes(search)
      );
      return { rows: matches };
    }
    if (lower.includes('from crops c left join planting_records')) {
      const rows = fileDb.crops.map(c => {
        const matches = (fileDb.planting_records || []).filter(p => p.crop_id === c.id && (p.status === 'PLANTED' || p.status === 'GROWING'));
        const totalAcres = matches.reduce((acc, p) => acc + (parseFloat(p.land_size_acres) || 0), 0);
        const totalYield = matches.reduce((acc, p) => acc + (parseFloat(p.expected_yield_kg) || 0), 0);
        return {
          crop_id: c.id,
          crop_code: c.crop_code,
          name_en: c.name_en,
          name_si: c.name_si,
          name_ta: c.name_ta,
          total_acres: totalAcres,
          total_yield_kg: totalYield,
          active_plots: matches.length
        };
      });
      return { rows: rows.sort((a, b) => b.total_acres - a.total_acres) };
    }
    if (lower.includes('select * from crops')) {
      return { rows: fileDb.crops };
    }
    if (lower.includes('from crop_seasons')) {
      if (lower.includes('where crop_id =')) {
        const cId = Number(params[0]);
        return { rows: (fileDb.crop_seasons || []).filter(s => Number(s.crop_id) === cId) };
      }
      return { rows: fileDb.crop_seasons || [] };
    }
    if (lower.includes('from cropix_demand_benchmarks')) {
      const cId = Number(params[0]);
      const found = (fileDb.cropix_demand_benchmarks || []).find(b => Number(b.crop_id) === cId);
      return { rows: found ? [found] : [] };
    }
    if (lower.includes('coalesce(sum(land_size_acres)')) {
      const cId = Number(params[0]);
      const matches = (fileDb.planting_records || []).filter(p => Number(p.crop_id) === cId && (p.status === 'PLANTED' || p.status === 'GROWING'));
      const totalAcres = matches.reduce((acc, p) => acc + (parseFloat(p.land_size_acres) || 0), 0);
      const totalYield = matches.reduce((acc, p) => acc + (parseFloat(p.expected_yield_kg) || 0), 0);
      return {
        rows: [{
          total_acres: totalAcres,
          total_yield: totalYield,
          plot_count: matches.length
        }]
      };
    }
    if (lower.includes('from planting_records p join crops c') || lower.includes('from planting_records p\n         join crops c')) {
      const rows = (fileDb.planting_records || []).filter(p => p.status === 'PLANTED' || p.status === 'GROWING').map(p => {
        const crop = fileDb.crops.find(c => c.id === p.crop_id) || {};
        const user = fileDb.users.find(u => u.id === p.farmer_id) || {};
        return {
          ...p,
          crop_name: crop.name_en,
          crop_code: crop.crop_code,
          farmer_name: user.full_name,
          farmer_phone: user.phone
        };
      });
      return { rows: rows.sort((a, b) => new Date(a.expected_harvest_date) - new Date(b.expected_harvest_date)) };
    }
    if (lower.includes('select * from planting_records')) {
      return { rows: fileDb.planting_records };
    }
    if (lower.includes('from price_history')) {
      if (lower.includes('where crop_id =')) {
        const cId = Number(params[0]);
        return { rows: (fileDb.price_history || []).filter(p => Number(p.crop_id) === cId) };
      }
      return { rows: fileDb.price_history || [] };
    }
    if (lower.includes('distinct on (c.id)') || lower.includes('from crops c left join price_history')) {
      const rows = fileDb.crops.map(c => {
        const ph = (fileDb.price_history || []).find(p => Number(p.crop_id) === Number(c.id));
        return {
          crop_id: c.id,
          crop_code: c.crop_code,
          name_en: c.name_en,
          name_si: c.name_si,
          name_ta: c.name_ta,
          standard_price_per_kg: c.standard_price_per_kg,
          current_price_per_kg: ph ? ph.price_per_kg : c.standard_price_per_kg,
          price_range_min: c.standard_price_per_kg * 0.75,
          price_range_max: c.standard_price_per_kg * 1.35,
          market_name: 'Keppetipola Economic Centre'
        };
      });
      return { rows };
    }
    if (lower.includes('from notification_logs')) {
      if (lower.includes('where user_id =')) {
        const uId = Number(params[0]);
        return { rows: (fileDb.notification_logs || []).filter(n => Number(n.user_id) === uId) };
      }
      return { rows: fileDb.notification_logs || [] };
    }
    if (lower.includes('from marketplace_listings')) {
      let rows = (fileDb.marketplace_listings || []).map(l => {
        const crop = fileDb.crops.find(c => c.id === l.crop_id) || {};
        const farmer = fileDb.users.find(u => u.id === l.farmer_id) || {};
        return {
          ...l,
          crop_code: crop.crop_code,
          crop_name_en: crop.name_en,
          crop_name_si: crop.name_si,
          crop_name_ta: crop.name_ta,
          standard_price_per_kg: crop.standard_price_per_kg,
          price_range_min: crop.standard_price_per_kg * 0.75,
          price_range_max: crop.standard_price_per_kg * 1.35,
          farmer_name: farmer.full_name,
          farmer_phone: farmer.phone
        };
      });
      if (lower.includes('where id =')) {
        rows = rows.filter(r => r.id === Number(params[0]));
      } else if (lower.includes('where l.farmer_id =')) {
        rows = rows.filter(r => r.farmer_id === Number(params[0]));
      } else if (lower.includes("status = 'available'")) {
        rows = rows.filter(r => r.status === 'AVAILABLE');
      }
      return { rows };
    }
    if (lower.includes('from marketplace_orders')) {
      let rows = (fileDb.marketplace_orders || []).map(o => {
        const listing = (fileDb.marketplace_listings || []).find(l => l.id === o.listing_id) || {};
        const crop = fileDb.crops.find(c => c.id === listing.crop_id) || {};
        const farmer = fileDb.users.find(u => u.id === listing.farmer_id) || {};
        const buyer = fileDb.users.find(u => u.id === o.buyer_id) || {};
        return {
          ...o,
          crop_id: listing.crop_id,
          crop_name_en: crop.name_en,
          crop_name_si: crop.name_si,
          crop_name_ta: crop.name_ta,
          farmer_id: listing.farmer_id,
          farmer_name: farmer.full_name,
          farmer_phone: farmer.phone,
          buyer_name: buyer.full_name,
          buyer_phone: buyer.phone,
          buyer_business: buyer.business_name
        };
      });
      if (lower.includes('where o.id =')) {
        rows = rows.filter(r => r.id === Number(params[0]));
      } else if (lower.includes('where o.buyer_id =')) {
        rows = rows.filter(r => r.buyer_id === Number(params[0]));
      } else if (lower.includes('where l.farmer_id =')) {
        rows = rows.filter(r => r.farmer_id === Number(params[0]));
      }
      return { rows };
    }
    if (lower.includes('select * from broadcast_warnings')) {
      return { rows: fileDb.broadcast_warnings || [] };
    }
    if (lower.includes('insert into notification_logs')) {
      const newLog = {
        id: Date.now(),
        user_id: params[0],
        broadcast_id: params[1],
        notification_type: params[2],
        channel: params[3],
        title: params[4],
        body: params[5],
        status: 'DELIVERED',
        fcm_token: params[6],
        attempted_at: new Date().toISOString()
      };
      if (!fileDb.notification_logs) fileDb.notification_logs = [];
      fileDb.notification_logs.unshift(newLog);
      saveDb(fileDb);
      return { rows: [newLog] };
    }

    // INSERT / UPDATE Fallbacks
    if (lower.includes('insert into users')) {
      let newUser = {
        id: Date.now(),
        created_at: new Date().toISOString()
      };

      const colMatch = text.match(/insert\s+into\s+users\s*\(([^)]+)\)/i);
      if (colMatch) {
        const cols = colMatch[1].split(',').map(c => c.trim().toLowerCase());
        cols.forEach((col, idx) => {
          if (idx < params.length) {
            newUser[col] = params[idx];
          }
        });
      } else {
        newUser = {
          ...newUser,
          full_name: params[0],
          phone: params[1],
          nic: params[2],
          password_hash: params[3],
          role: params[4] || 'FARMER',
          district: params[5] || 'Badulla',
          division: params[6] || 'Bandarawela',
          gnd_division: params[7] || null,
          address: params[8] || null,
          latitude: params[9] || 6.8304,
          longitude: params[10] || 80.9878,
          total_land_size: params[11] || null,
          business_name: params[12] || null,
          business_type: params[13] || null,
          verification_status: params[14] || 'APPROVED',
          is_verified: params[15] !== undefined ? params[15] : true
        };
      }

      // Ensure split names & full_name are in sync
      if (!newUser.first_name && newUser.full_name) {
        const split = splitFullName(newUser.full_name);
        newUser.first_name = split.first_name;
        newUser.middle_name = split.middle_name;
        newUser.last_name = split.last_name;
      } else if (newUser.first_name && !newUser.full_name) {
        newUser.full_name = formatFullName(newUser.first_name, newUser.middle_name, newUser.last_name);
      }

      // Ensure address components & address are in sync
      if (!newUser.address_line1 && newUser.address) {
        const addrSplit = splitAddress(newUser.address, newUser.division || 'Bandarawela');
        newUser.address_line1 = addrSplit.address_line1;
        newUser.address_line2 = addrSplit.address_line2;
        newUser.city = addrSplit.city;
        newUser.postal_code = addrSplit.postal_code;
      } else if (newUser.address_line1 && !newUser.address) {
        newUser.address = formatAddress(newUser.address_line1, newUser.address_line2, newUser.city, newUser.postal_code);
      }

      // Fallback defaults
      if (!newUser.city) newUser.city = newUser.division || 'Bandarawela';
      if (!newUser.postal_code) newUser.postal_code = '90100';
      if (!newUser.district) newUser.district = 'Badulla';
      if (!newUser.division) newUser.division = 'Bandarawela';
      if (!newUser.role) newUser.role = 'FARMER';
      if (!newUser.verification_status) newUser.verification_status = newUser.role === 'BUYER' ? 'APPROVED' : 'PENDING';
      if (newUser.is_verified === undefined) newUser.is_verified = newUser.verification_status === 'APPROVED';

      fileDb.users.unshift(newUser);
      saveDb(fileDb);
      return { rows: [newUser] };
    }

    if (lower.includes('insert into planting_records')) {
      const newPlanting = {
        id: Date.now(),
        farmer_id: params[0],
        crop_id: Number(params[1]),
        land_size_acres: Number(params[2]),
        expected_yield_kg: Number(params[3]),
        planting_date: params[4] || new Date().toISOString().split('T')[0],
        expected_harvest_date: params[5] || '2026-11-01',
        latitude: Number(params[6] || 6.8322),
        longitude: Number(params[7] || 80.9980),
        district: params[8] || 'Badulla',
        division: params[9] || 'Bandarawela',
        status: 'PLANTED',
        created_at: new Date().toISOString()
      };
      if (!fileDb.planting_records) fileDb.planting_records = [];
      fileDb.planting_records.unshift(newPlanting);
      saveDb(fileDb);
      return { rows: [newPlanting] };
    }

    if (lower.includes('insert into marketplace_listings')) {
      const newListing = {
        id: Date.now(),
        farmer_id: params[0],
        crop_id: Number(params[1]),
        quantity_kg: Number(params[2]),
        price_per_kg: Number(params[3]),
        available_from: params[4],
        available_to: params[5],
        latitude: Number(params[6]),
        longitude: Number(params[7]),
        pickup_address: params[8],
        description: params[9],
        image_url: params[10],
        status: 'AVAILABLE',
        created_at: new Date().toISOString()
      };
      if (!fileDb.marketplace_listings) fileDb.marketplace_listings = [];
      fileDb.marketplace_listings.unshift(newListing);
      saveDb(fileDb);
      return { rows: [newListing] };
    }

    if (lower.includes('update marketplace_listings')) {
      if (lower.includes("status = 'expired'")) {
        const id = Number(params[0]);
        const fId = Number(params[1]);
        const listing = fileDb.marketplace_listings.find(l => l.id === id && l.farmer_id === fId);
        if (listing) {
          listing.status = 'EXPIRED';
          saveDb(fileDb);
          return { rows: [listing] };
        }
      } else {
        const id = Number(params[5]);
        const fId = Number(params[6]);
        const listing = fileDb.marketplace_listings.find(l => l.id === id && l.farmer_id === fId);
        if (listing) {
          listing.quantity_kg = params[0] !== null ? Number(params[0]) : listing.quantity_kg;
          listing.price_per_kg = params[1] !== null ? Number(params[1]) : listing.price_per_kg;
          listing.status = params[2] !== null ? params[2] : listing.status;
          listing.description = params[3] !== null ? params[3] : listing.description;
          listing.available_to = params[4] !== null ? params[4] : listing.available_to;
          saveDb(fileDb);
          return { rows: [listing] };
        }
      }
      return { rows: [] };
    }

    if (lower.includes('insert into marketplace_orders')) {
      const newOrder = {
        id: Date.now(),
        order_code: params[0],
        listing_id: Number(params[1]),
        buyer_id: Number(params[2]),
        requested_quantity_kg: Number(params[3]),
        offered_price_per_kg: Number(params[4]),
        total_price: Number(params[5]),
        status: 'PENDING',
        response_deadline: params[6],
        notes: params[7],
        created_at: new Date().toISOString()
      };
      if (!fileDb.marketplace_orders) fileDb.marketplace_orders = [];
      fileDb.marketplace_orders.unshift(newOrder);
      saveDb(fileDb);
      return { rows: [newOrder] };
    }

    if (lower.includes('update marketplace_orders')) {
      const id = Number(params[3]);
      const order = fileDb.marketplace_orders.find(o => o.id === id);
      if (order) {
        order.status = params[0];
        order.offered_price_per_kg = params[1] !== null ? Number(params[1]) : order.offered_price_per_kg;
        order.total_price = Number(params[2]);
        saveDb(fileDb);
        return { rows: [order] };
      }
      return { rows: [] };
    }

    if (lower.includes('from farmer_verifications fv join users u')) {
      const rows = (fileDb.farmer_verifications || []).filter(fv => fv.verification_status === 'PENDING').map(fv => {
        const u = fileDb.users.find(u => u.id === fv.farmer_id) || {};
        return {
          verification_id: fv.id,
          verification_status: fv.verification_status,
          nic_verified: fv.nic_verified,
          land_gps_verified: fv.land_gps_verified,
          land_size_verified: fv.land_size_verified,
          submitted_at: fv.created_at,
          farmer_id: u.id,
          full_name: u.full_name,
          phone: u.phone,
          nic: u.nic,
          address: u.address,
          gnd_division: u.gnd_division,
          latitude: u.latitude,
          longitude: u.longitude,
          total_land_size: u.total_land_size,
          business_name: u.business_name
        };
      });
      return { rows };
    }

    if (lower.includes('update farmer_verifications')) {
      const fId = Number(params[6]);
      const verif = (fileDb.farmer_verifications || []).find(f => f.farmer_id === fId);
      if (verif) {
        verif.verification_status = params[0];
        verif.nic_verified = params[1];
        verif.land_gps_verified = params[2];
        verif.land_size_verified = params[3];
        verif.verified_by = params[4];
        verif.rejection_reason = params[5];
        saveDb(fileDb);
        return { rows: [verif] };
      }
      return { rows: [] };
    }

    if (lower.includes('update users set verification_status')) {
      const fId = Number(params[2]);
      const user = fileDb.users.find(u => Number(u.id) === fId);
      if (user) {
        user.verification_status = params[0];
        user.is_verified = params[1];
        saveDb(fileDb);
        return { rows: [user] };
      }
      return { rows: [] };
    }

    if (lower.startsWith('update users set') || lower.includes('update users\n         set') || lower.includes('update users set')) {
      const lastParam = params[params.length - 1];
      const user = fileDb.users.find(u => Number(u.id) === Number(lastParam));
      if (user) {
        const setMatch = text.match(/set\s+([\s\S]+?)\s+where/i);
        if (setMatch) {
          const assignments = setMatch[1].split(',').map(a => a.trim());
          assignments.forEach(assign => {
            const parts = assign.split('=');
            if (parts.length >= 2) {
              const col = parts[0].trim().toLowerCase();
              const paramMatch = parts[1].match(/\$(\d+)/);
              if (paramMatch) {
                const paramIdx = parseInt(paramMatch[1], 10) - 1;
                if (paramIdx < params.length && params[paramIdx] !== undefined && params[paramIdx] !== null) {
                  user[col] = params[paramIdx];
                }
              }
            }
          });
        }
        // Sync full_name & address
        if (user.first_name || user.last_name) {
          user.full_name = formatFullName(user.first_name, user.middle_name, user.last_name);
        }
        if (user.address_line1 || user.city) {
          user.address = formatAddress(user.address_line1, user.address_line2, user.city, user.postal_code);
        }
        saveDb(fileDb);
        return { rows: [user] };
      }
      return { rows: [] };
    }

    if (lower.includes('insert into audit_logs')) {
      const newLog = {
        id: Date.now(),
        user_id: params[0],
        action: params[1],
        entity_type: 'USER',
        entity_id: params[2],
        details: params[3],
        created_at: new Date().toISOString()
      };
      if (!fileDb.audit_logs) fileDb.audit_logs = [];
      fileDb.audit_logs.push(newLog);
      saveDb(fileDb);
      return { rows: [newLog] };
    }

    if (lower.includes('insert into farmer_verifications')) {
      const newVerif = {
        farmer_id: params[0],
        verification_status: 'APPROVED',
        verified_by: params[1],
        verified_at: new Date().toISOString()
      };
      if (!fileDb.farmer_verifications) fileDb.farmer_verifications = [];
      fileDb.farmer_verifications.push(newVerif);
      saveDb(fileDb);
      return { rows: [newVerif] };
    }

    return { rows: [] };
  },
  fileDb,
  saveDb
};
