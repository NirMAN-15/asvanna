const { realtimeDb } = require('../config/firebase');

class MarketplaceService {
  /**
   * Sync active listing to Firebase Realtime Database
   */
  static async syncListingToFirebase(listing) {
    if (!realtimeDb) return;
    try {
      await Promise.race([
        realtimeDb.ref(`marketplace_listings/${listing.id}`).set({
          ...listing,
          updatedAt: Date.now()
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Firebase RTDB timeout')), 2500))
      ]);
    } catch (err) {
      console.warn('⚠️ Firebase RTDB sync failed:', err.message);
    }
  }

  /**
   * Remove listing from Firebase Realtime Database
   */
  static async removeListingFromFirebase(listingId) {
    if (!realtimeDb) return;
    try {
      await Promise.race([
        realtimeDb.ref(`marketplace_listings/${listingId}`).remove(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Firebase RTDB timeout')), 2500))
      ]);
    } catch (err) {
      console.warn('⚠️ Firebase RTDB remove failed:', err.message);
    }
  }
}

module.exports = MarketplaceService;
