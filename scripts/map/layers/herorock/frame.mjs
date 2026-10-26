// The big area map of Hero Rock (layer 1 only, no venue map yet): 송도컨벤시아 and the 인천 1호선 stations around it
// (인천대입구역, 센트럴파크역, 지식정보단지역), origin at the Convensia. Tall rather than wide, so a phone held upright
// can zoom out to the stations with the map still filling the screen. Inside the OSM extract (2026-10-27).
import { makeFrame } from '../lib/frame.mjs'
import { CACHE, OSM_JSON } from './paths.mjs'

export const bigFrame = makeFrame({
  lat0: 37.388776, lng0: 126.646738, ppm: 2, name: 'big',
  box: { west: -1500, east: 700, south: -1400, north: 1400 },
  tileBox: { south: 37.3757, west: 126.6291, north: 37.4019, east: 126.6554 },
  cache: CACHE, osmJson: OSM_JSON,
})
