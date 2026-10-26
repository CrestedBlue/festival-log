import type { Pin } from '../../data/schema'

/** Directions to a pin in Kakao Map — its documented "길찾기" link (name, latitude, longitude); "(대략)" is left off the name. */
export const routeUrl = (pin: Pick<Pin, 'name' | 'lat' | 'lng'>): string =>
  `https://map.kakao.com/link/to/${encodeURIComponent(pin.name.replace(/\s*\(대략\)$/, ''))},${pin.lat},${pin.lng}`
