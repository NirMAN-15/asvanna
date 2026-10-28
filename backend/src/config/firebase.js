const fs = require('fs');
const path = require('path');
const config = require('./config');

let admin = null;
try {
  admin = require('firebase-admin');
} catch (e) {
  // firebase-admin not installed, running in local fallback mode
}

let firebaseApp = null;
let realtimeDb = null;
let messaging = null;
let credentialSource = 'NONE';
let activeProjectId = null;

function findServiceAccountKey() {
  const candidateDirs = [
    path.join(__dirname, '../..'),       // backend/
    path.join(__dirname, '.'),          // backend/src/config/
    path.join(__dirname, '../../..')     // project root/
  ];

  // 1. Check explicit environment variable
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
    return process.env.GOOGLE_APPLICATION_CREDENTIALS;
  }

  // 2. Check standard named files in candidate directories
  const standardNames = [
    'firebase-service-account.json',
    'serviceAccountKey.json'
  ];

  for (const dir of candidateDirs) {
    for (const name of standardNames) {
      const fullPath = path.join(dir, name);
      if (fs.existsSync(fullPath)) {
        return fullPath;
      }
    }
  }

  // 3. Check for any downloaded *firebase-adminsdk*.json file
  for (const dir of candidateDirs) {
    if (fs.existsSync(dir)) {
      try {
        const files = fs.readdirSync(dir);
        const match = files.find(f => f.includes('firebase-adminsdk') && f.endsWith('.json'));
        if (match) {
          return path.join(dir, match);
        }
      } catch (e) {}
    }
  }

  return null;
}

try {
  if (admin) {
    const keyFilePath = findServiceAccountKey();

    if (keyFilePath) {
      // Priority 1: Initialize using Service Account JSON file
      const raw = fs.readFileSync(keyFilePath, 'utf8');
      const serviceAccount = JSON.parse(raw);
      activeProjectId = serviceAccount.project_id;
      const dbUrl = config.firebase.databaseURL || `https://${activeProjectId}-default-rtdb.firebaseio.com`;

      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: dbUrl
      });
      realtimeDb = admin.database();
      messaging = admin.messaging();
      credentialSource = `FILE (${path.basename(keyFilePath)})`;
      console.log(`🔥 Firebase Admin SDK initialized successfully via service account file: ${path.basename(keyFilePath)} (Project: ${activeProjectId})`);
    } else if (config.firebase.projectId && config.firebase.privateKey && config.firebase.clientEmail) {
      // Priority 2: Initialize using Environment Variables
      activeProjectId = config.firebase.projectId;
      const dbUrl = config.firebase.databaseURL || `https://${activeProjectId}-default-rtdb.firebaseio.com`;

      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: config.firebase.projectId,
          clientEmail: config.firebase.clientEmail,
          privateKey: config.firebase.privateKey
        }),
        databaseURL: dbUrl
      });
      realtimeDb = admin.database();
      messaging = admin.messaging();
      credentialSource = 'ENVIRONMENT_VARIABLES';
      console.log(`🔥 Firebase Admin SDK initialized successfully via environment variables (Project: ${activeProjectId})`);
    } else {
      credentialSource = 'MOCK';
      console.warn('⚠️ Firebase credentials not configured. Realtime sync and push notifications running in mock mode.');
      console.log("💡 To activate live Firebase: download your Service Account JSON from Firebase Console and save it as 'backend/firebase-service-account.json'");
    }
  }
} catch (error) {
  console.warn('⚠️ Firebase initialization failed, running in fallback mode:', error.message);
  credentialSource = 'ERROR';
}

function getFirebaseStatus() {
  return {
    initialized: !!firebaseApp,
    source: credentialSource,
    projectId: activeProjectId || config.firebase.projectId || 'asvanna-agritech',
    services: {
      realtimeDatabase: !!realtimeDb,
      cloudMessaging: !!messaging
    }
  };
}

module.exports = {
  admin,
  realtimeDb,
  messaging,
  getFirebaseStatus
};
