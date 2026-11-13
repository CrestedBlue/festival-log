// The WONDERLIVET map's frames (lib/frame.mjs): the venue map over KINTEX's second exhibition centre (halls 7–10 and
// the lobbies between them), and the big area map with the stations of the official directions (킨텍스역 GTX-A, 대화역
// 3호선). Same origin (the exhibition centre). The big one is tall rather than wide, so a phone held upright can zoom
// out to 대화역 with the map still filling the screen. Inside the OSM extract (2026-10-27).
import { makeFrame } from '../lib/frame.mjs'
import { CACHE, OSM_JSON } from './paths.mjs'

const ORIGIN = { lat0: 37.664738, lng0: 126.74187 }
export const frame = makeFrame({
  ...ORIGIN, box: { west: -260, east: 340, south: -240, north: 240 },
  tileBox: { south: 37.6623, west: 126.7387, north: 37.6672, east: 126.7460 },
  cache: CACHE, osmJson: OSM_JSON,
})
export const bigFrame = makeFrame({
  ...ORIGIN, ppm: 2, name: 'big',
  box: { west: -1200, east: 1300, south: -1500, north: 1700 },
  tileBox: { south: 37.6507, west: 126.7276, north: 37.6805, east: 126.7573 },
  cache: CACHE, osmJson: OSM_JSON,
})
