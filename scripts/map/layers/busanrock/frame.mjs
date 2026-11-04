// The Busan Rock map's frames (lib/frame.mjs): the venue map over the sports grounds of 삼락생태공원 and the big area map
// from the river to 사상역 (line 2 and the 부산김해경전철). Same origin (the plaza in the middle of the grounds). Inside the
// OSM extract (2026-11-04).
import { makeFrame } from '../lib/frame.mjs'
import { CACHE, OSM_JSON } from './paths.mjs'

export const ORIGIN = { lat0: 35.168765, lng0: 128.9735 }
export const frame = makeFrame({
  ...ORIGIN, box: { west: -300, east: 200, south: -380, north: 470 },
  tileBox: { south: 35.1650, west: 128.9702, north: 35.1730, east: 128.9758 },
  cache: CACHE, osmJson: OSM_JSON,
})
export const bigFrame = makeFrame({
  ...ORIGIN, ppm: 2, name: 'big', box: { west: -650, east: 1150, south: -900, north: 650 },
  tileBox: { south: 35.1606, west: 128.9664, north: 35.1747, east: 128.9862 },
  cache: CACHE, osmJson: OSM_JSON,
})
