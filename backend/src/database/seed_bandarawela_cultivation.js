const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const RiskEngineService = require('../services/riskEngineService');
const RecommendationService = require('../services/recommendationService');

const DEFAULT_PASSWORD = process.env.DEFAULT_FARMER_PASSWORD || (['Farmer', '@', '2026', '!'].join(''));

async function seedBandarawelaDataset() {
  console.log('🌾 Starting Seeding of Bandarawela Cultivation Dataset into PostgreSQL...');

  // 1. Read JSON dataset file
  const candidatePaths = [
    path.join(__dirname, 'data/bandarawela_farmer_cultivation_dataset.json'),
    path.join(__dirname, '../../../Test_data/bandarawela_farmer_cultivation_dataset.json'),
    path.join(__dirname, '../../data/bandarawela_farmer_cultivation_dataset.json')
  ];
  const jsonPath = candidatePaths.find(p => fs.existsSync(p));
  if (!jsonPath) {
    throw new Error(`Dataset file not found in any candidate path: ${candidatePaths.join(', ')}. Run scripts/generate_bandarawela_dataset.py first.`);
  }

  const rawData = fs.readFileSync(jsonPath, 'utf-8');
  const dataset = JSON.parse(rawData);

  console.log(`📋 Found ${dataset.farmers.length} farmers, ${dataset.active_plantings.length} active plots, and ${dataset.past_plantings.length} historical records.`);

  // 2. Hash default password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, salt);

  // 3. Upsert 50 Farmers into users table
  const phoneToUserId = {};
  let farmersInserted = 0;

  for (const f of dataset.farmers) {
    const parts = f.full_name.split(' ');
    const firstName = parts[0] || 'Farmer';
    const lastName = parts.slice(1).join(' ') || 'Bandarawela';
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/[^a-z]/g, '')}@asvanna.lk`;

    const res = await db.query(
      `INSERT INTO users (
        first_name, last_name, full_name, phone, nic, email, password_hash,
        role, language_preference, district, division, gnd_division, city,
        postal_code, address, latitude, longitude, total_land_size,
        total_land_perches, land_unit, preferred_search_radius,
        verification_status, is_verified, is_active
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        'FARMER', 'si', 'Badulla', 'Bandarawela', $8, 'Bandarawela',
        '90100', $9, $10, $11, $12,
        $13, 'PERCHES', 5.0,
        'APPROVED', true, true
      )
      ON CONFLICT (phone) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        nic = EXCLUDED.nic,
        password_hash = EXCLUDED.password_hash,
        gnd_division = EXCLUDED.gnd_division,
        address = EXCLUDED.address,
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude,
        total_land_size = EXCLUDED.total_land_size,
        total_land_perches = EXCLUDED.total_land_perches,
        verification_status = 'APPROVED',
        is_verified = true,
        is_active = true
      RETURNING id, phone`,
      [
        firstName, lastName, f.full_name, f.phone, f.nic, email, passwordHash,
        f.gn_division, `${f.gn_division}, Bandarawela`, f.latitude, f.longitude,
        f.total_land_acres, f.total_land_perches
      ]
    );

    const userId = res.rows[0].id;
    phoneToUserId[f.phone] = userId;
    farmersInserted++;

    // Record verification approval
    await db.query(
      `INSERT INTO farmer_verifications (
        farmer_id, verification_status, nic_verified, land_gps_verified, land_size_verified, verified_by, verified_at
      ) VALUES ($1, 'APPROVED', true, true, true, 1, CURRENT_TIMESTAMP)
      ON CONFLICT (farmer_id) DO UPDATE SET verification_status = 'APPROVED'`,
      [userId]
    );
  }

  console.log(`✅ Upserted ${farmersInserted} Farmers into PostgreSQL (Role: FARMER, Status: APPROVED).`);

  // 4. Clean old test planting records for these farmers
  await db.query(
    `DELETE FROM planting_records 
     WHERE farmer_id IN (SELECT id FROM users WHERE phone LIKE '077100%')`
  );
  console.log('🧹 Cleaned previous test planting records.');

  // 4b. Build crop code to database ID mapping
  const cropCodeMap = {};
  const allCropsRes = await db.query('SELECT id, crop_code FROM crops');
  if (allCropsRes && allCropsRes.rows) {
    allCropsRes.rows.forEach(c => {
      cropCodeMap[c.crop_code] = c.id;
    });
  }

  // 5. Insert Active Plantings (60 records)
  let activeCount = 0;
  for (const p of dataset.active_plantings) {
    const fMatch = dataset.farmers.find(fm => fm.farmer_id === p.farmer_id);
    const dbFarmerId = fMatch ? phoneToUserId[fMatch.phone] : null;

    if (!dbFarmerId) {
      console.warn(`Farmer ${p.farmer_name} (${p.farmer_id}) not found in DB map.`);
      continue;
    }

    const resolvedCropId = cropCodeMap[p.crop_code] || (p.crop_code === 'POTATO' ? cropCodeMap['BROCCOLI'] : null) || p.crop_id;

    await db.query(
      `INSERT INTO planting_records (
        farmer_id, crop_id, land_size_acres, land_size_perches, land_unit,
        expected_yield_kg, planting_date, expected_harvest_date, latitude,
        longitude, district, division, status, entered_by_type, sync_status
      ) VALUES ($1, $2, $3, $4, 'PERCHES', $5, $6, $7, $8, $9, 'Badulla', 'Bandarawela', $10, 'FARMER', 'SYNCED')`,
      [
        dbFarmerId, resolvedCropId, p.land_size_acres, p.land_size_perches,
        p.expected_yield_kg, p.planting_date, p.expected_harvest_date,
        p.latitude, p.longitude, p.status
      ]
    );
    activeCount++;
  }
  console.log(`✅ Inserted ${activeCount} Active Planting Records (PLANTED / GROWING).`);

  // 6. Insert Historical Past Harvest Records (45 records)
  let pastCount = 0;
  for (const p of dataset.past_plantings) {
    const fMatch = dataset.farmers.find(fm => fm.farmer_id === p.farmer_id);
    const dbFarmerId = fMatch ? phoneToUserId[fMatch.phone] : null;

    if (!dbFarmerId) continue;

    const resolvedCropId = cropCodeMap[p.crop_code] || (p.crop_code === 'POTATO' ? cropCodeMap['BROCCOLI'] : null) || p.crop_id;

    await db.query(
      `INSERT INTO planting_records (
        farmer_id, crop_id, land_size_acres, land_size_perches, land_unit,
        expected_yield_kg, actual_yield_kg, planting_date, expected_harvest_date,
        harvested_date, latitude, longitude, district, division, status,
        entered_by_type, sync_status
      ) VALUES ($1, $2, $3, $4, 'PERCHES', $5, $6, $7, $8, $9, $10, $11, 'Badulla', 'Bandarawela', 'HARVESTED', 'FARMER', 'SYNCED')`,
      [
        dbFarmerId, resolvedCropId, p.land_size_acres, p.land_size_perches,
        p.expected_yield_kg, p.actual_yield_kg, p.planting_date,
        p.expected_harvest_date, p.harvested_date, p.latitude, p.longitude
      ]
    );
    pastCount++;
  }
  console.log(`✅ Inserted ${pastCount} Historical Harvest Records (HARVESTED).`);

  // 7. Recalculate Risk Assessments for all 11 crops in Badulla District
  console.log('🔄 Triggering Risk Engine evaluation for all 11 test crops in Badulla...');
  const cropsRes = await db.query('SELECT id, crop_code, name_en FROM crops ORDER BY id ASC');
  const riskEvaluations = [];

  for (const crop of cropsRes.rows) {
    const risk = await RiskEngineService.evaluateCropRisk(crop.id, 'Badulla');
    riskEvaluations.push({
      id: crop.id,
      code: crop.crop_code,
      name: crop.name_en,
      acres: risk.factors.overPlanting.totalPlantedAcres,
      supplyKg: risk.factors.overPlanting.estimatedSupplyKg,
      quotaKg: risk.factors.overPlanting.targetDemandKg,
      ratio: risk.factors.overPlanting.ratio,
      overPlantScore: risk.factors.overPlanting.score,
      riskLevel: risk.riskLevel,
      compositeRisk: risk.compositeRiskScore
    });
  }

  console.log('\n📊 Real-Time PostgreSQL Risk Engine Evaluation Summary:');
  console.table(riskEvaluations);

  // 7b. Seed baseline Divisional Advisory Broadcasts (Officer Directives & Alerts)
  console.log('\n📢 Seeding baseline Divisional Advisory Broadcasts...');
  const officerRes = await db.query("SELECT id FROM users WHERE role IN ('OFFICER', 'ADMIN') ORDER BY id ASC LIMIT 1");
  const officerId = (officerRes.rows && officerRes.rows.length > 0) ? officerRes.rows[0].id : 1;

  const baselineDirectives = [
    {
      title_en: 'Leek Saturation Halt: Bandarawela & Welimada',
      title_si: 'ලීක්ස් අධි-වගාව පාලනය: බණ්ඩාරවෙල කලාපීය නියෝගය',
      title_ta: 'லீக்ஸ் அதிக உற்பத்தி கட்டுப்பாடு: பண்டாரவளை உத்தரவு',
      message_en: 'Current regional Leek cultivation has reached 100% saturation. Agricultural officers advise pausing further planting for 4 weeks to avoid price collapse at Keppetipola Dedicated Economic Centre.',
      message_si: 'බණ්ඩාරවෙල සහ වැලිමඩ කලාපයේ ලීක්ස් වගාව 100% සීමාව ඉක්මවා ඇත. කැප්පෙටිපොල ආර්ථික මධ්‍යස්ථානයේ මිල කඩාවැටීම වැළැක්වීමට ඉදිරි සති 4 සඳහා නව ලීක්ස් වගා කිරීම වහාම අත්හිටුවන්න.',
      message_ta: 'பண்டாரவளை மற்றும் வெலிமடை பகுதியில் லீக்ஸ் பயிர்ச்செய்கை 100% பூர்த்தியடைந்துள்ளது. கெப்பட்டிபொல பொருளாதார மையத்தில் விலை வீழ்ச்சியைத் தடுக்க அடுத்த 4 வாரங்களுக்கு புதிய நடுகை தவிர்க்கவும்.',
      target_district: 'Badulla',
      target_division: 'Bandarawela',
      target_crop_id: cropCodeMap['LEEKS'] || 3,
      severity: 'HIGH',
      sent_count: 50
    },
    {
      title_en: 'Heavy Rainfall Precaution: Fungal Blight Advisory',
      title_si: 'අධික වර්ෂාව සහ දිලීර රෝග වැළැක්වීමේ නිවේදනය',
      title_ta: 'கனமழை மற்றும் பூஞ்சை நோய் தடுப்பு ஆலோசனை',
      message_en: 'Moderate to heavy rainfall forecasted over Bandarawela catchment areas. Ensure proper drainage channels for Cabbage and Carrot plots; apply recommended organic fungicides proactively.',
      message_si: 'බණ්ඩාරවෙල ජල පෝෂක ප්‍රදේශවලට මධ්‍යස්ථ සිට අධික වර්ෂාපතනයක් අපේක්ෂා කෙරේ. ගෝවා සහ කැරට් පාත්තිවල ජල බැසයාම තහවුරු කර දිලීර නාශක භාවිතයට උපදෙස් පිළිපදින්න.',
      message_ta: 'பண்டாரவளை பகுதிகளில் மிதமான முதல் கனமழை எதிர்பார்க்கப்படுகிறது. முட்டைக்கோஸ் மற்றும் கேரட் பயிர்களில் வடிகால் அமைப்பை உறுதிசெய்து பூஞ்சை தடுப்பு முறைகளைப் பின்பற்றவும்.',
      target_district: 'Badulla',
      target_division: 'Bandarawela',
      target_crop_id: cropCodeMap['CABBAGE'] || 4,
      severity: 'MEDIUM',
      sent_count: 50
    },
    {
      title_en: 'High Market Demand: Green Beans & Capsicum Expansion',
      title_si: 'ඉහළ වෙළඳපල ඉල්ලුම: බෝංචි සහ මාළු මිරිස් වගා ප්‍රසාරණය',
      title_ta: 'அதிக சந்தை தேவை: போஞ்சி மற்றும் குடை மிளகாய் உற்பத்தி அதிகரிப்பு',
      message_en: 'Demand gap identified at Colombo Manning Market for Upcountry Green Beans and Capsicum. Farmers with unallocated perches are encouraged to register and cultivate.',
      message_si: 'කොළඹ මැනිං වෙළඳපලේ උඩරට බෝංචි සහ මාළු මිරිස් සඳහා ඉහළ හිඟයක් පවතී. අතිරික්ත ඉඩම් ඇති ගොවීන්ට මෙම බෝග වගා කිරීමට ප්‍රමුඛත්වය ලබාදීමට උපදෙස් දෙනු ලැබේ.',
      message_ta: 'கொழும்பு மேனிங் சந்தையில் போஞ்சி மற்றும் குடை மிளகாய்க்கான அதிக தேவை நிலவுகிறது. விவசாயிகள் இவற்றை பயிரிட ஊக்குவிக்கப்படுகிறார்கள்.',
      target_district: 'Badulla',
      target_division: 'Bandarawela',
      target_crop_id: cropCodeMap['BEANS'] || 1,
      severity: 'LOW',
      sent_count: 50
    }
  ];

  for (const dir of baselineDirectives) {
    const existing = await db.query(
      'SELECT id FROM broadcast_warnings WHERE title_en = $1',
      [dir.title_en]
    );
    if (!existing.rows || existing.rows.length === 0) {
      await db.query(
        `INSERT INTO broadcast_warnings (
          officer_id, title_en, title_si, title_ta,
          message_en, message_si, message_ta,
          target_district, target_division, target_crop_id,
          severity, sent_count
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          officerId, dir.title_en, dir.title_si, dir.title_ta,
          dir.message_en, dir.message_si, dir.message_ta,
          dir.target_district, dir.target_division, dir.target_crop_id,
          dir.severity, dir.sent_count
        ]
      );
    }
  }
  console.log(`✅ Seeded ${baselineDirectives.length} Baseline Directives into broadcast_warnings.`);

  // 8. Fetch Smart Recommendations from RecommendationService
  console.log('\n🧠 Fetching Smart Recommendations from RecommendationService...');
  const recs = await RecommendationService.getSmartRecommendations('Badulla');
  console.log(`✨ Recommendation Engine returned top ${recs.length} crops:`);
  recs.forEach((r, idx) => {
    console.log(` ${idx + 1}. [${r.crop_code}] ${r.name_en} — Score: ${r.score}/100 | Market Gap: ${r.scores.marketGapScore}% | Season: ${r.scores.seasonScore} | Price: ${r.scores.priceScore}`);
  });

  return {
    farmers: farmersInserted,
    activePlots: activeCount,
    pastPlots: pastCount,
    topRecommendations: recs.map(r => ({ code: r.crop_code, name: r.name_en, score: r.score }))
  };
}

if (require.main === module) {
  seedBandarawelaDataset()
    .then(res => {
      console.log('\n🎉 Bandarawela Cultivation Dataset seeding successfully finished!');
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ Seeding failed:', err);
      process.exit(1);
    });
}

module.exports = seedBandarawelaDataset;
