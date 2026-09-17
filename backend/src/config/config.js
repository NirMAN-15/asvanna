try {
  require('dotenv').config();
} catch (e) {
  // Fallback to process.env or defaults if dotenv module is not installed
}

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres123',
    database: process.env.DB_NAME || 'asvanna_db',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'asvanna_secret_jwt_moratuwa_2026',
    farmerExpiresIn: process.env.JWT_EXPIRES_IN_FARMER || '24h',
    officerExpiresIn: process.env.JWT_EXPIRES_IN_OFFICER || '8h',
    buyerExpiresIn: process.env.JWT_EXPIRES_IN_BUYER || '24h'
  },
  riskThresholds: {
    safe: parseFloat(process.env.RISK_SAFE_THRESHOLD) || 40.0,
    warning: parseFloat(process.env.RISK_WARNING_THRESHOLD) || 65.0
  },
  geofence: {
    defaultRadiusKm: parseFloat(process.env.DEFAULT_GEOFENCE_RADIUS_KM) || 5.0,
    maxRadiusKm: parseFloat(process.env.MAX_GEOFENCE_RADIUS_KM) || 20.0
  },
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : null,
    databaseURL: process.env.FIREBASE_DATABASE_URL
  },
  weather: {
    openMeteoForecastUrl: process.env.OPEN_METEO_FORECAST_URL || 'https://api.open-meteo.com/v1/forecast',
    openMeteoArchiveUrl: process.env.OPEN_METEO_ARCHIVE_URL || 'https://archive-api.open-meteo.com/v1/archive',
    bandarawelaLat: 6.8304,
    bandarawelaLng: 80.9878,
    cacheTtlSeconds: 6 * 3600 // 6 hours
  },
  external: {
    cropixApiUrl: process.env.CROPIX_API_URL || 'https://api.cropix.gov.lk/v1',
    hartiApiUrl: process.env.HARTI_API_URL || 'http://www.harti.gov.lk/'
  },
  scheduler: {
    enabled: process.env.ENABLE_SCHEDULED_JOBS === 'true' || process.env.NODE_ENV === 'production'
  }
};
