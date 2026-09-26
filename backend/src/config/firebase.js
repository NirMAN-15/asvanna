let admin = null;
try {
  admin = require('firebase-admin');
} catch (e) {
  // firebase-admin not installed, running in local fallback mode
}
const config = require('./config');

let firebaseApp = null;
let realtimeDb = null;
let messaging = null;

try {
  if (config.firebase.projectId && config.firebase.privateKey) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.firebase.projectId,
        clientEmail: config.firebase.clientEmail,
        privateKey: config.firebase.privateKey
      }),
      databaseURL: config.firebase.databaseURL
    });
    realtimeDb = admin.database();
    messaging = admin.messaging();
    console.log('🔥 Firebase Admin SDK initialized successfully');
  } else {
    console.warn('⚠️ Firebase credentials not configured. Realtime sync and push notifications running in mock mode.');
  }
} catch (error) {
  console.warn('⚠️ Firebase initialization failed, running in fallback mode:', error.message);
}

module.exports = {
  admin,
  realtimeDb,
  messaging
};
