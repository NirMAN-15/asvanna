const db = require('../config/database');

class ValidationService {
  /**
   * Get pending farmer verification list for Divisional Officer
   */
  static async getPendingVerifications(division = 'Bandarawela') {
    const query = `
      SELECT
        fv.id as verification_id,
        fv.verification_status,
        fv.nic_verified,
        fv.land_gps_verified,
        fv.land_size_verified,
        fv.created_at as submitted_at,
        u.id as farmer_id,
        u.full_name,
        u.phone,
        u.nic,
        u.address,
        u.gnd_division,
        u.latitude,
        u.longitude,
        u.total_land_size,
        u.business_name
      FROM farmer_verifications fv
      JOIN users u ON u.id = fv.farmer_id
      WHERE fv.verification_status = 'PENDING'
      ORDER BY fv.created_at ASC
    `;
    const res = await db.query(query);

    // Add automated anomaly detection flags
    return res.rows.map(farmer => {
      const anomalies = [];
      const land = parseFloat(farmer.total_land_size) || 0;
      const lat = parseFloat(farmer.latitude) || 0;
      const lng = parseFloat(farmer.longitude) || 0;

      // Anomaly 1: Unrealistic land size for Bandarawela valley (>15 acres is rare)
      if (land > 15.0) {
        anomalies.push({ type: 'LAND_SIZE_UNUSUAL', message: `Registered land size (${land} acres) is unusually large for Bandarawela.` });
      } else if (land <= 0) {
        anomalies.push({ type: 'LAND_SIZE_INVALID', message: 'Land size cannot be zero or negative.' });
      }

      // Anomaly 2: GPS coordinate boundary check for Bandarawela Agrarian Division (Lat 6.75 to 6.90 N, Lng 80.90 to 81.05 E)
      if (lat < 6.75 || lat > 6.90 || lng < 80.90 || lng > 81.05) {
        anomalies.push({ type: 'GPS_OUT_OF_BOUNDS', message: 'Farmland GPS lies outside the Bandarawela Agrarian Division jurisdiction (Lat 6.75–6.90, Lng 80.90–81.05).' });
      }

      // Anomaly 3: NIC format validation (old 9-digit + V or new 12-digit) with trimming
      const cleanNic = (farmer.nic || '').trim();
      const nicValid = /^[0-9]{9}[vVxX]$/.test(cleanNic) || /^[0-9]{12}$/.test(cleanNic);
      if (!nicValid) {
        anomalies.push({ type: 'NIC_FORMAT_SUSPICIOUS', message: 'NIC does not match standard Sri Lankan 9V/12-digit format.' });
      }

      return {
        ...farmer,
        anomalies,
        hasAnomalies: anomalies.length > 0
      };
    });
  }

  /**
   * Officer approves or rejects a farmer profile
   */
  static async reviewFarmer(farmerId, officerId, { approved, nicVerified, landGpsVerified, landSizeVerified, rejectionReason }) {
    const status = approved ? 'APPROVED' : 'REJECTED';

    // 1. Update verification record
    const verRes = await db.query(
      `UPDATE farmer_verifications
       SET verification_status = $1,
           nic_verified = $2,
           land_gps_verified = $3,
           land_size_verified = $4,
           verified_by = $5,
           rejection_reason = $6,
           verified_at = CURRENT_TIMESTAMP
       WHERE farmer_id = $7
       RETURNING *`,
      [status, nicVerified || approved, landGpsVerified || approved, landSizeVerified || approved, officerId, rejectionReason || null, farmerId]
    );

    // 2. Update user profile status
    await db.query(
      `UPDATE users
       SET verification_status = $1,
           is_verified = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [status, approved, farmerId]
    );

    // 3. Log into audit_logs
    await db.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
       VALUES ($1, $2, 'USER', $3, $4)`,
      [
        officerId,
        approved ? 'FARMER_VERIFICATION_APPROVED' : 'FARMER_VERIFICATION_REJECTED',
        farmerId,
        JSON.stringify({ status, nicVerified, landGpsVerified, landSizeVerified, rejectionReason })
      ]
    );

    return {
      farmerId,
      status,
      verification: verRes.rows[0]
    };
  }
}

module.exports = ValidationService;
