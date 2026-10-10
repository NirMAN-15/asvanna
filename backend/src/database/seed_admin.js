const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const config = require('../config/config');

async function seedAdmin() {
  console.log('🛡️  Bootstrapping ASVANNA Super Admin & Master User Accounts...');
  try {
    const salt = await bcrypt.genSalt(10);

    // -------------------------------------------------------------------------
    // 1. System Default Super Admin (Used for internal system validation)
    // -------------------------------------------------------------------------
    const adminPhone = process.env.INITIAL_ADMIN_PHONE || '0770000000';
    const adminNic = process.env.INITIAL_ADMIN_NIC || '200000000000';
    const adminEmail = process.env.INITIAL_ADMIN_EMAIL || 'admin@asvanna.gov.lk';
    const rawAdminCredential = process.env.INITIAL_ADMIN_PASSWORD || Buffer.from('QXN2YW5uYUBBZG1pbjIwMjY=', 'base64').toString('utf-8');
    const adminPasswordHash = await bcrypt.hash(rawAdminCredential, salt);

    const checkAdmin = await db.query(
      'SELECT id, full_name, phone FROM users WHERE phone = $1 OR nic = $2',
      [adminPhone, adminNic]
    );

    let systemAdminId;
    if (checkAdmin.rows && checkAdmin.rows.length > 0) {
      systemAdminId = checkAdmin.rows[0].id;
      console.log(`ℹ️  System Super Admin already exists (ID: ${systemAdminId}, Phone: ${adminPhone}).`);
    } else {
      const insertAdminRes = await db.query(
        `INSERT INTO users (
          first_name, last_name, full_name,
          phone, nic, email, password_hash, role,
          district, division, gnd_division,
          verification_status, is_verified, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING id, full_name, phone, nic, email, role, created_at`,
        [
          'Super', 'Admin', 'ASVANNA Super Admin',
          adminPhone, adminNic, adminEmail, adminPasswordHash, 'ADMIN',
          'Badulla', 'Bandarawela', 'Central', 'APPROVED', true, true
        ]
      );
      systemAdminId = insertAdminRes.rows[0].id;
      console.log(`✅ System Super Admin provisioned (ID: ${systemAdminId}, Phone: ${adminPhone}, NIC: ${adminNic}).`);
    }

    // -------------------------------------------------------------------------
    // 2. Nirman's Master User Account (All 3 User Portals: FARMER, OFFICER, BUYER + ADMIN)
    // -------------------------------------------------------------------------
    const masterNic = '200322610371';
    const masterPhone = '0772261037';
    const masterEmail = 'nirman@asvanna.gov.lk';
    const masterCredential = process.env.MASTER_USER_PASSWORD || Buffer.from('TmFAMjAwMzA4MTM=', 'base64').toString('utf-8');
    const masterPasswordHash = await bcrypt.hash(masterCredential, salt);

    const checkMaster = await db.query(
      'SELECT id, full_name, phone, nic FROM users WHERE nic = $1 OR phone = $2',
      [masterNic, masterPhone]
    );

    let masterUserId;
    if (checkMaster.rows && checkMaster.rows.length > 0) {
      masterUserId = checkMaster.rows[0].id;
      // Update credentials to guarantee exact password hash and verified properties
      await db.query(
        `UPDATE users SET
          first_name = $1, last_name = $2, full_name = $3,
          password_hash = $4, role = 'ADMIN',
          district = 'Badulla', division = 'Bandarawela', gnd_division = 'Bandarawela Central',
          address_line1 = 'No. 15, Station Road', city = 'Bandarawela', postal_code = '90100',
          address = 'No. 15, Station Road, Bandarawela',
          total_land_size = 5.0,
          business_name = 'Nirman Agro Enterprises',
          business_type = 'Wholesale Procurement & Commercial Farm',
          verification_status = 'APPROVED', is_verified = TRUE, is_active = TRUE
         WHERE id = $5`,
        ['Nirman', 'Weddikkara', 'Nirman Weddikkara (Master User)', masterPasswordHash, masterUserId]
      );
      console.log(`ℹ️  Master User already exists; updated credentials and permissions (ID: ${masterUserId}).`);
    } else {
      const insertMasterRes = await db.query(
        `INSERT INTO users (
          first_name, last_name, full_name,
          phone, nic, email, password_hash, role,
          district, division, gnd_division,
          address_line1, city, postal_code, address,
          total_land_size, business_name, business_type,
          verification_status, is_verified, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
        RETURNING id, full_name, phone, nic, email, role, created_at`,
        [
          'Nirman', 'Weddikkara', 'Nirman Weddikkara (Master User)',
          masterPhone, masterNic, masterEmail, masterPasswordHash, 'ADMIN',
          'Badulla', 'Bandarawela', 'Bandarawela Central',
          'No. 15, Station Road', 'Bandarawela', '90100', 'No. 15, Station Road, Bandarawela',
          5.0, 'Nirman Agro Enterprises', 'Wholesale Procurement & Commercial Farm',
          'APPROVED', true, true
        ]
      );
      masterUserId = insertMasterRes.rows[0].id;
      console.log(`✅ Master User account provisioned successfully!`);
    }

    // Ensure farmer verification record exists for seamless Farmer portal usage
    await db.query(
      `INSERT INTO farmer_verifications (
        farmer_id, verification_status, nic_verified, land_gps_verified, land_size_verified, verified_by_officer_id
      ) VALUES ($1, 'APPROVED', TRUE, TRUE, TRUE, $2)
      ON CONFLICT (farmer_id) DO UPDATE SET
        verification_status = 'APPROVED',
        nic_verified = TRUE,
        land_gps_verified = TRUE,
        land_size_verified = TRUE`,
      [masterUserId, systemAdminId]
    );

    // -------------------------------------------------------------------------
    // 3. Sync to local JSON fallback database
    // -------------------------------------------------------------------------
    const jsonPath = path.join(__dirname, '../../data/asvanna_db.json');
    if (fs.existsSync(jsonPath)) {
      try {
        const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        if (!Array.isArray(jsonData.users)) jsonData.users = [];

        // Remove old entries with these phone/nic
        jsonData.users = jsonData.users.filter(u => u.phone !== adminPhone && u.nic !== adminNic && u.nic !== masterNic && u.phone !== masterPhone);

        // Add System Admin
        jsonData.users.push({
          id: 1,
          full_name: 'ASVANNA Super Admin',
          phone: adminPhone,
          nic: adminNic,
          email: adminEmail,
          password_hash: adminPasswordHash,
          role: 'ADMIN',
          district: 'Badulla',
          division: 'Bandarawela',
          verification_status: 'APPROVED',
          is_verified: true,
          is_active: true
        });

        // Add Nirman Master User
        jsonData.users.push({
          id: 2,
          first_name: 'Nirman',
          last_name: 'Weddikkara',
          full_name: 'Nirman Weddikkara (Master User)',
          phone: masterPhone,
          nic: masterNic,
          email: masterEmail,
          password_hash: masterPasswordHash,
          role: 'ADMIN',
          district: 'Badulla',
          division: 'Bandarawela',
          gnd_division: 'Bandarawela Central',
          address_line1: 'No. 15, Station Road',
          city: 'Bandarawela',
          postal_code: '90100',
          total_land_size: 5.0,
          business_name: 'Nirman Agro Enterprises',
          business_type: 'Wholesale Procurement & Commercial Farm',
          verification_status: 'APPROVED',
          is_verified: true,
          is_active: true
        });

        fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), 'utf8');
        console.log('✅ Fallback local JSON database synchronized with Super Admin & Master User.');
      } catch (jsonErr) {
        console.warn('⚠️ JSON fallback sync note:', jsonErr.message);
      }
    }

    console.log('\n============================================================');
    console.log('🌟 MASTER USER ACCOUNT READY FOR TESTING:');
    console.log('   - ID / NIC: 200322610371');
    console.log('   - Phone:    0772261037');
    console.log('   - Access:   FARMER | OFFICER | BUYER | ADMIN (All Portals)');
    console.log('============================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to seed admin accounts:', error);
    process.exit(1);
  }
}

seedAdmin();
