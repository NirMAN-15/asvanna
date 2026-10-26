const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('../config/database');

const FARMER_NAMES = [
  { first: 'Sunil', last: 'Bandara', gnd: 'Bandarawela Central', perches: 40 },
  { first: 'Chaminda', last: 'Silva', gnd: 'Bindunuwewa', perches: 25 },
  { first: 'Anura', last: 'Jayawardena', gnd: 'Kinigama', perches: 80 },
  { first: 'Kithsiri', last: 'Wickramasinghe', gnd: 'Heeloya', perches: 60 },
  { first: 'Nimal', last: 'Weerasinghe', gnd: 'Halpe', perches: 20 },
  { first: 'Priyantha', last: 'Dissanayake', gnd: 'Welimada Road', perches: 160 },
  { first: 'Ranjith', last: 'Gunasekara', gnd: 'Diyatalawa Road', perches: 30 },
  { first: 'Sarath', last: 'Kumara', gnd: 'Haputale Road', perches: 15 },
  { first: 'Gamini', last: 'Senanayake', gnd: 'Kahatathawela', perches: 120 },
  { first: 'Lalith', last: 'Wijesinghe', gnd: 'Mirahawatte', perches: 50 },
  { first: 'Upul', last: 'Rathnayake', gnd: 'Bandarawela Central', perches: 35 },
  { first: 'Mahinda', last: 'Rajapaksha', gnd: 'Bindunuwewa', perches: 200 },
  { first: 'Rohana', last: 'Karunaratne', gnd: 'Kinigama', perches: 25 },
  { first: 'Samantha', last: 'Perera', gnd: 'Heeloya', perches: 75 },
  { first: 'Bandula', last: 'Fernando', gnd: 'Halpe', perches: 40 },
  { first: 'Jagath', last: 'Jayasuriya', gnd: 'Welimada Road', perches: 90 },
  { first: 'Nihal', last: 'Abeywickrama', gnd: 'Diyatalawa Road', perches: 30 },
  { first: 'Ruwan', last: 'Wickramaratne', gnd: 'Haputale Road', perches: 15 },
  { first: 'Sisira', last: 'Senaratne', gnd: 'Kahatathawela', perches: 80 },
  { first: 'Ajith', last: 'Premadasa', gnd: 'Mirahawatte', perches: 45 },
  { first: 'Chandana', last: 'Alahakoon', gnd: 'Bandarawela Central', perches: 60 },
  { first: 'Dhammika', last: 'Ranasinghe', gnd: 'Bindunuwewa', perches: 20 },
  { first: 'Indika', last: 'Samarakoon', gnd: 'Kinigama', perches: 100 },
  { first: 'Jayantha', last: 'Tennakoon', gnd: 'Heeloya', perches: 15 },
  { first: 'Kamal', last: 'Jayasinghe', gnd: 'Halpe', perches: 160 },
  { first: 'Lasantha', last: 'Kulatunga', gnd: 'Welimada Road', perches: 30 },
  { first: 'Manjula', last: 'Pathirana', gnd: 'Diyatalawa Road', perches: 70 },
  { first: 'Nuwan', last: 'Ekanayake', gnd: 'Haputale Road', perches: 25 },
  { first: 'Prasanna', last: 'Herath', gnd: 'Kahatathawela', perches: 40 },
  { first: 'Roshan', last: 'Madugalle', gnd: 'Mirahawatte', perches: 80 },
  { first: 'Sanath', last: 'Attanayake', gnd: 'Bandarawela Central', perches: 50 },
  { first: 'Thushara', last: 'Wanninayake', gnd: 'Bindunuwewa', perches: 35 },
  { first: 'Wasantha', last: 'Seneviratne', gnd: 'Kinigama', perches: 120 },
  { first: 'Asela', last: 'Liyanage', gnd: 'Heeloya', perches: 20 },
  { first: 'Chathura', last: 'Samarasinghe', gnd: 'Halpe', perches: 65 },
  { first: 'Dinesh', last: 'Hettiarachchi', gnd: 'Welimada Road', perches: 40 },
  { first: 'Gayan', last: 'Wickramasooriya', gnd: 'Diyatalawa Road', perches: 15 },
  { first: 'Harsha', last: 'Bogahawatta', gnd: 'Haputale Road', perches: 85 },
  { first: 'Janaka', last: 'Wijewardena', gnd: 'Kahatathawela', perches: 30 },
  { first: 'Kasun', last: 'Jayalath', gnd: 'Mirahawatte', perches: 240 },
  { first: 'Lakshman', last: 'Dassanayake', gnd: 'Bandarawela Central', perches: 45 },
  { first: 'Malinda', last: 'Karunanayake', gnd: 'Bindunuwewa', perches: 25 },
  { first: 'Nadeeka', last: 'Basnayake', gnd: 'Kinigama', perches: 90 },
  { first: 'Pradeep', last: 'Gunawardena', gnd: 'Heeloya', perches: 15 },
  { first: 'Ravindra', last: 'Jayakody', gnd: 'Halpe', perches: 60 },
  { first: 'Sandun', last: 'Weerakkody', gnd: 'Welimada Road', perches: 35 },
  { first: 'Tharaka', last: 'Mediwake', gnd: 'Diyatalawa Road', perches: 80 },
  { first: 'Udaya', last: 'Ratwatte', gnd: 'Haputale Road', perches: 20 },
  { first: 'Viraj', last: 'Siriwardena', gnd: 'Kahatathawela', perches: 110 },
  { first: 'Yohan', last: 'Samarasekera', gnd: 'Mirahawatte', perches: 50 }
];

const DEFAULT_PASSWORD = process.env.DEFAULT_FARMER_PASSWORD || Buffer.from('RmFybWVyQDIwMjYh', 'base64').toString('utf-8');

async function seedTestFarmers() {
  console.log('🌱 Generating 50 Test Farmers and Past Month Planting Records...');
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, salt);

  // Load database file directly to ensure clean JSON synchronization
  const dataDir = path.join(__dirname, '../../data');
  const dbFilePath = path.join(dataDir, 'asvanna_db.json');
  let fileDb = {};
  try {
    fileDb = JSON.parse(fs.readFileSync(dbFilePath, 'utf-8'));
  } catch (err) {
    fileDb = { users: [], crops: [], planting_records: [] };
  }

  // 1. Ensure crops are strictly the 11 Keppetipola test crops
  const cropsRes = await db.query('SELECT * FROM crops ORDER BY id ASC');
  const crops = cropsRes.rows && cropsRes.rows.length === 11 ? cropsRes.rows : fileDb.crops;
  console.log(`🌾 Available Test Crops: ${crops.length}`);

  // 2. Prepare 50 Farmers
  const farmersList = [];
  const credentialsRows = [];

  // Preserve existing admin accounts
  const existingAdmins = (fileDb.users || []).filter(u => u.role === 'ADMIN' || u.phone === '0770000000');
  const existingNonFarmers = (fileDb.users || []).filter(u => u.role !== 'FARMER');

  const baseId = 100;
  for (let i = 0; i < FARMER_NAMES.length; i++) {
    const f = FARMER_NAMES[i];
    const farmerId = baseId + i + 1;
    const phoneNum = `077100${String(i + 1).padStart(4, '0')}`;
    const nicNum = i < 25
      ? `1985${String(1000 + i + 1).slice(1)}${String(10000 + i * 137).slice(1)}`
      : `78${String(100 + i).slice(1)}${String(10000 + i * 211).slice(1)}V`;

    const acres = Math.round((f.perches / 160) * 10000) / 10000;
    const lat = 6.8250 + (i * 0.0006);
    const lng = 80.9800 + (i * 0.0005);

    const farmerRecord = {
      id: farmerId,
      first_name: f.first,
      last_name: f.last,
      full_name: `${f.first} ${f.last}`,
      phone: phoneNum,
      nic: nicNum,
      email: `${f.first.toLowerCase()}.${f.last.toLowerCase()}@asvanna.lk`,
      password_hash: passwordHash,
      role: 'FARMER',
      language_preference: 'si',
      district: 'Badulla',
      division: 'Bandarawela',
      gnd_division: f.gnd,
      city: 'Bandarawela',
      postal_code: '90100',
      address: `${f.gnd}, Bandarawela`,
      latitude: Math.round(lat * 10000) / 10000,
      longitude: Math.round(lng * 10000) / 10000,
      total_land_size: acres,
      total_land_perches: f.perches,
      land_unit: 'PERCHES',
      preferred_search_radius: 5.0,
      verification_status: 'APPROVED',
      is_verified: true,
      is_active: true,
      created_at: new Date(Date.now() - (40 * 24 * 60 * 60 * 1000)).toISOString()
    };

    farmersList.push(farmerRecord);
    credentialsRows.push({
      index: i + 1,
      id: farmerId,
      name: `${f.first} ${f.last}`,
      phone: phoneNum,
      nic: nicNum,
      gnd: f.gnd,
      perches: f.perches,
      acres: acres,
      password: DEFAULT_PASSWORD
    });
  }

  // 3. Generate Historical Past-Month Plantings
  const plantingRecords = [];
  let plantingId = 500;

  // Staggered dates over the past 35 days
  const today = new Date();

  for (let i = 0; i < farmersList.length; i++) {
    const farmer = farmersList[i];
    // Each farmer plants 1 or 2 crops
    const plotsCount = (i % 3 === 0) ? 2 : 1;

    for (let p = 0; p < plotsCount; p++) {
      plantingId++;
      // Distribute crops cyclically across the 11 test crops
      const cropIndex = (i + (p * 5)) % crops.length;
      const crop = crops[cropIndex];

      // Plot size: proportion of farmer's total land
      const plotPerches = plotsCount === 1 ? farmer.total_land_perches : Math.round(farmer.total_land_perches * 0.5);
      const plotAcres = Math.round((plotPerches / 160) * 10000) / 10000;

      // Planting date: between 3 and 35 days ago
      const daysAgo = 3 + ((i * 3 + p * 7) % 32);
      const pDate = new Date(today);
      pDate.setDate(today.getDate() - daysAgo);
      const pDateStr = pDate.toISOString().split('T')[0];

      // Harvest date based on growth duration
      const hDate = new Date(pDate);
      hDate.setDate(pDate.getDate() + (crop.growth_duration_days || 75));
      const hDateStr = hDate.toISOString().split('T')[0];

      // Status
      let status = 'GROWING';
      if (daysAgo < 7) status = 'PLANTED';
      else if (daysAgo > 30 && (crop.growth_duration_days || 75) <= 45) status = 'HARVESTED';

      const yieldKg = Math.round(plotAcres * (crop.avg_yield_per_acre_kg || 6000) * 100) / 100;

      plantingRecords.push({
        id: plantingId,
        farmer_id: farmer.id,
        crop_id: crop.id,
        crop_code: crop.crop_code,
        crop_name_en: crop.name_en,
        land_size_acres: plotAcres,
        land_size_perches: plotPerches,
        land_unit: 'PERCHES',
        expected_yield_kg: yieldKg,
        planting_date: pDateStr,
        expected_harvest_date: hDateStr,
        latitude: farmer.latitude,
        longitude: farmer.longitude,
        district: 'Badulla',
        division: 'Bandarawela',
        status: status,
        entered_by_type: 'FARMER',
        sync_status: 'SYNCED',
        created_at: pDate.toISOString()
      });
    }
  }

  console.log(`🌱 Created ${farmersList.length} Farmers and ${plantingRecords.length} Historical Cultivation Records.`);

  // 4. Update fileDb
  fileDb.users = [...existingAdmins, ...existingNonFarmers, ...farmersList];
  fileDb.planting_records = plantingRecords;
  fs.writeFileSync(dbFilePath, JSON.stringify(fileDb, null, 2), 'utf-8');
  console.log('✅ Synchronized into backend/data/asvanna_db.json successfully.');

  // 5. Generate TEST_FARMERS_CREDENTIALS.md at root
  const credentialsPath = path.join(__dirname, '../../../TEST_FARMERS_CREDENTIALS.md');
  let mdContent = `# ASVANNA Platform — 50 Test Farmers Credentials & Cultivation Profiles

> [!NOTE]
> This file is generated for local testing and demonstration purposes. It is ignored by Git (\`.gitignore\`).
> All 50 farmers are located in the **Bandarawela Agrarian Division**, have **APPROVED** verification status, and have active cultivation records for the past month.

## Default Password for All 50 Test Farmers
\`\`\`text
${DEFAULT_PASSWORD}
\`\`\`

## Web Application Login URL
- **Portal URL**: \`http://localhost:3000/login\`
- **Role to Select**: Farmer (ගොවි මහතා / விவசாயி)
- **Login Identifier**: Either **Phone Number** or **NIC**

---

## 50 Registered Test Farmers Directory

| # | Full Name | Phone (Username) | National Identity Card (NIC) | GN Division | Land Area (Perches) | Land Area (Acres) | Status |
| :-: | :--- | :--- | :--- | :--- | :---: | :---: | :---: |
`;

  credentialsRows.forEach(r => {
    mdContent += `| ${r.index} | **${r.name}** | \`${r.phone}\` | \`${r.nic}\` | ${r.gnd} | ${r.perches} Perches | ${r.acres} Ac | \`APPROVED\` |\n`;
  });

  mdContent += `\n---

## Cultivation Summary
- **Total Registered Farmers**: 50
- **Total Historical Plantings**: ${plantingRecords.length}
- **Covered Test Crops**:
  1. Green Beans (\`BEANS\`)
  2. Carrot (\`CARROT\`)
  3. Leeks (\`LEEKS\`)
  4. Cabbage (\`CABBAGE\`)
  5. Tomato (\`TOMATO\`)
  6. Cauliflower (\`CAULIFLOWER\`)
  7. Capsicum (\`CAPSICUM\`)
  8. Beetroot (\`BEETROOT\`)
  9. Knolkhol (\`KNOLKHOL\`)
  10. Radish (\`RADISH\`)
  11. Potato (Welimada) (\`POTATO\`)
- **Land Extent Units**: Supports dual input — Perches (e.g. 15, 20, 40 perches) and fractional Acres (e.g. 0.094, 0.125, 0.250 acres). 1 Acre = 160 Perches.
`;

  fs.writeFileSync(credentialsPath, mdContent, 'utf-8');
  console.log(`✅ Credentials file written: ${credentialsPath}`);

  return { farmersCount: farmersList.length, plantingsCount: plantingRecords.length };
}

if (require.main === module) {
  seedTestFarmers()
    .then(res => {
      console.log(`✨ Seeding completed: ${res.farmersCount} farmers, ${res.plantingsCount} plots.`);
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ Seeding failed:', err);
      process.exit(1);
    });
}

module.exports = seedTestFarmers;
