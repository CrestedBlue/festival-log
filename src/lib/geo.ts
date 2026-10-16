export interface LatLng {
  lat: number
  lng: number
}

const EARTH_RADIUS_M = 6_371_000
const NEAR_THRESHOLD_M = 10
const toRad = (deg: number) => (deg * Math.PI) / 180

/** Great-circle distance (haversine). Plenty accurate at festival-ground scale. */
export function distanceMeters(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)))
}

export function formatDistance(meters: number): string {
  if (meters < NEAR_THRESHOLD_M) return `${NEAR_THRESHOLD_M}m 이내`
  if (meters < 1000) return `${Math.round(meters / 10) * 10}m`
  return `${(meters / 1000).toFixed(1)}km`
}

/** [[south, west], [north, east]] — the same shape Leaflet uses. */
export type LatLngBounds = readonly [readonly [number, number], readonly [number, number]]

export function isInsideBounds(point: LatLng, [[south, west], [north, east]]: LatLngBounds): boolean {
  return point.lat >= south && point.lat <= north && point.lng >= west && point.lng <= east
}
