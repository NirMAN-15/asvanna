/**
 * Migration & Cleanup script for backend/data/asvanna_db.json
 * Fixes shifted fields, deduplicates demo accounts, and populates:
 * - first_name, middle_name, last_name, full_name
 * - address_line1, address_line2, city, postal_code, address
 */
const fs = require('fs');
const path = require('path');
const { splitFullName, formatFullName, splitAddress, formatAddress } = require('../utils/nameAddressUtils');

const dbPath = path.join(__dirname, '../../data/asvanna_db.json');

if (!fs.existsSync(dbPath)) {
  console.error('❌ asvanna_db.json not found');
  process.exit(1);
}

const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

if (!db.users || !Array.isArray(db.users)) {
  console.error('❌ No users array in asvanna_db.json');
  process.exit(1);
}

console.log(`Starting cleanup of ${db.users.length} users in asvanna_db.json...`);

const validRoles = ['FARMER', 'OFFICER', 'BUYER', 'ADMIN'];

const cleanedUsers = [];
const seenPhones = new Set();

for (const raw of db.users) {
  const u = { ...raw };

  // 1. Detect and fix shifted fields where seed params were misaligned
  if (validRoles.includes(u.district)) {
    const realRole = u.district;
    const realPasswordHash = (typeof u.role === 'string' && u.role.startsWith('$2a$')) ? u.role : u.password_hash;
    const realEmail = (typeof u.password_hash === 'string' && u.password_hash.includes('@')) ? u.password_hash : null;
    const realDistrict = u.division || 'Badulla';
    const realDivision = u.gnd_division || 'Bandarawela';
    const realLat = typeof u.address === 'number' ? u.address : 6.8304;
    const realLng = typeof u.latitude === 'number' ? u.latitude : 80.9878;

    u.role = realRole;
    u.password_hash = realPasswordHash;
    u.email = realEmail;
    u.district = realDistrict;
    u.division = realDivision;
    u.gnd_division = null;
    u.address = null;
    u.latitude = realLat;
    u.longitude = realLng;
  }

  // Ensure role is valid
  if (!validRoles.includes(u.role)) {
    u.role = 'FARMER';
  }

  // 2. Standardize Name: first_name, middle_name, last_name, full_name
  const nameParts = splitFullName(u.full_name);
  u.first_name = u.first_name || nameParts.first_name;
  u.middle_name = u.middle_name !== undefined ? u.middle_name : nameParts.middle_name;
  u.last_name = u.last_name || nameParts.last_name;
  u.full_name = u.full_name || formatFullName(u.first_name, u.middle_name, u.last_name);

  // 3. Standardize Address: address_line1, address_line2, city, postal_code, address
  const defaultCity = u.division || 'Bandarawela';
  let addrParts;
  if (typeof u.address === 'string' && u.address.trim() && !u.address.match(/^\d+(\.\d+)?$/)) {
    addrParts = splitAddress(u.address, defaultCity, '90100');
  } else {
    // Generate realistic address based on division/role
    addrParts = {
      address_line1: u.gnd_division ? `Main Road, ${u.gnd_division}` : `Agrarian Division Road`,
      address_line2: null,
      city: defaultCity,
      postal_code: '90100'
    };
  }

  u.address_line1 = u.address_line1 || addrParts.address_line1;
  u.address_line2 = u.address_line2 || addrParts.address_line2;
  u.city = u.city || addrParts.city || defaultCity;
  u.postal_code = u.postal_code || addrParts.postal_code || '90100';
  u.address = formatAddress(u.address_line1, u.address_line2, u.city, u.postal_code);

  // 4. Default verification status
  if (!u.verification_status) {
    u.verification_status = u.role === 'BUYER' ? 'APPROVED' : 'PENDING';
  }
  u.is_verified = u.verification_status === 'APPROVED';

  // 5. Deduplicate by phone
  const cleanPhone = String(u.phone).trim();
  if (cleanPhone && !seenPhones.has(cleanPhone)) {
    seenPhones.add(cleanPhone);
    cleanedUsers.push(u);
  } else if (!cleanPhone) {
    cleanedUsers.push(u);
  }
}

db.users = cleanedUsers;

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');

console.log(`✅ Successfully cleaned up and saved ${cleanedUsers.length} users in asvanna_db.json.`);
cleanedUsers.forEach((u, i) => {
  console.log(`[${i+1}] ${u.role}: ${u.first_name} | ${u.middle_name || '-'} | ${u.last_name} ("${u.full_name}") - ${u.address_line1}, ${u.city} (${u.phone})`);
});
