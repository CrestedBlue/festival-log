// The big area map of WONDERLIVET (layer 1 only, no festival map yet): KINTEX's second exhibition centre and the
// stations of the official directions (킨텍스역 GTX-A, 대화역 3호선), origin at the exhibition centre. Tall rather than
// wide, so a phone held upright can zoom out to 대화역 with the map still filling the screen. Inside the OSM extract
// (2026-10-27).
import { makeFrame } from '../lib/frame.mjs'
import { CACHE, OSM_JSON } from './paths.mjs'

export const bigFrame = makeFrame({
  lat0: 37.664738, lng0: 126.74187, ppm: 2, name: 'big',
  box: { west: -1200, east: 1300, south: -1500, north: 1700 },
  tileBox: { south: 37.6507, west: 126.7276, north: 37.6805, east: 126.7573 },
  cache: CACHE, osmJson: OSM_JSON,
})
