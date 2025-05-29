export function distanceMeters(
  [lon1, lat1]: [number, number],
  [lon2, lat2]: [number, number]
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371000; // Earth's radius in meters
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;

  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Format distance for display
 * @param meters - Distance in meters
 * @returns Formatted string (e.g., "1.2 km" or "500 m")
 */
export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(meters)} m`;
}

/**
 * Check if coordinates are valid
 * @param coords - Coordinate pair to validate
 * @returns true if valid coordinates
 */
export function isValidCoordinate(coords: unknown): coords is [number, number] {
  return (
    Array.isArray(coords) &&
    coords.length === 2 &&
    typeof coords[0] === "number" &&
    typeof coords[1] === "number" &&
    coords[0] >= -180 &&
    coords[0] <= 180 &&
    coords[1] >= -90 &&
    coords[1] <= 90
  );
}

/**
 * Default coordinates for Tel Aviv
 */
export const TEL_AVIV_COORDS: [number, number] = [34.7818, 32.0853];
