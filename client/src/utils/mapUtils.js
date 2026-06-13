// Map utilities (Leaflet-based - no API key needed!)

/**
 * Calculate distance between two points using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lng1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lng2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Convert degrees to radians
 */
export const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * Format distance for display
 */
export const formatDistance = (distanceKm) => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
};

/**
 * Get center point from array of coordinates
 */
export const getCenterFromCoordinates = (coordinates) => {
  if (!coordinates || coordinates.length === 0) {
    return { lat: -13.1339, lng: 27.8493 }; // Default to Zambia center
  }

  const total = coordinates.reduce(
    (acc, coord) => {
      return {
        lat: acc.lat + coord.lat,
        lng: acc.lng + coord.lng,
      };
    },
    { lat: 0, lng: 0 }
  );

  return {
    lat: total.lat / coordinates.length,
    lng: total.lng / coordinates.length,
  };
};

/**
 * Check if a point is within a bounding box
 */
export const isPointInBounds = (point, bounds) => {
  return (
    point.lat >= bounds.south &&
    point.lat <= bounds.north &&
    point.lng >= bounds.west &&
    point.lng <= bounds.east
  );
};

/**
 * Get bounding box from array of coordinates
 */
export const getBoundsFromCoordinates = (coordinates) => {
  if (!coordinates || coordinates.length === 0) {
    return null;
  }

  const lats = coordinates.map((c) => c.lat);
  const lngs = coordinates.map((c) => c.lng);

  return {
    north: Math.max(...lats),
    south: Math.min(...lats),
    east: Math.max(...lngs),
    west: Math.min(...lngs),
  };
};

export default {
  calculateDistance,
  toRadians,
  formatDistance,
  getCenterFromCoordinates,
  isPointInBounds,
  getBoundsFromCoordinates,
};
