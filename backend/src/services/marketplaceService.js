const { realtimeDb } = require('../config/firebase');

class MarketplaceService {
  /**
   * Sync active listing to Firebase Realtime Database
   */
  static async syncListingToFirebase(listing) {
    if (!realtimeDb) return;
    try {
      await realtimeDb.ref(`marketplace_listings/${listing.id}`).set({
        ...listing,
        updatedAt: Date.now()
      });
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
      await realtimeDb.ref(`marketplace_listings/${listingId}`).remove();
    } catch (err) {
      console.warn('⚠️ Firebase RTDB remove failed:', err.message);
    }
  }
}

module.exports = MarketplaceService;
