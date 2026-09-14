const { calculateDistance } = require('../utils/haversine');
const config = require('../config/config');

class GeofencingService {
  /**
   * Filter and rank items by distance within radius
   */
  static filterByProximity(userLat, userLng, items, maxRadiusKm = config.geofence.defaultRadiusKm) {
    const lat = parseFloat(userLat);
    const lng = parseFloat(userLng);

    return items
      .map(item => {
        const itemLat = parseFloat(item.latitude);
        const itemLng = parseFloat(item.longitude);
        const distanceKm = calculateDistance(lat, lng, itemLat, itemLng);
        return {
          ...item,
          distanceKm
        };
      })
      .filter(item => item.distanceKm <= maxRadiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }
}

module.exports = GeofencingService;
