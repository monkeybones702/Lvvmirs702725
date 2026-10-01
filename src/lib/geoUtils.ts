import { GeoCoordinate } from "../types";

/**
 * Calculates the great-circle distance between two points on the Earth
 * using the Haversine formula, returned in miles.
 */
export function calculateDistanceMiles(coord1: GeoCoordinate, coord2: GeoCoordinate): number {
  if (
    coord1.lat === coord2.lat &&
    coord1.lng === coord2.lng
  ) {
    return 0;
  }

  const R = 3958.8; // Earth radius in miles
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLng = toRad(coord2.lng - coord1.lng);
  const lat1 = toRad(coord1.lat);
  const lat2 = toRad(coord2.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Number((R * c).toFixed(1));
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Formats miles into human-readable proximity text
 */
export function formatDistance(miles: number): string {
  if (miles < 0.1) return "< 0.1 mi away";
  if (miles === 1.0) return "1.0 mi away";
  return `${miles.toFixed(1)} mi away`;
}

/**
 * Computes cardinal compass direction from origin to destination
 */
export function getCompassDirection(from: GeoCoordinate, to: GeoCoordinate): string {
  const dLng = toRad(to.lng - from.lng);
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

  let brng = (Math.atan2(y, x) * 180) / Math.PI;
  brng = (brng + 360) % 360;

  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(brng / 45) % 8;
  return directions[index];
}
