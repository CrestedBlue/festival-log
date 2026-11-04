// The BML map's frames (lib/frame.mjs): the venue map over 문화비축기지 (the Oil Tank Culture Park) and the big area map
// around it — 월드컵경기장역 (line 6), the stadium and the 난지천공원 car park with the ticket booth. Same origin (the
// plaza 문화마당). Inside the OSM extract (2026-11-04).
import { makeFrame } from '../lib/frame.mjs'
import { CACHE, OSM_JSON } from './paths.mjs'

const ORIGIN = { lat0: 37.5708, lng0: 126.8942 }
export const frame = makeFrame({
  ...ORIGIN, box: { west: -260, east: 200, south: -170, north: 240 },
  tileBox: { south: 37.5692, west: 126.8912, north: 37.5730, east: 126.8966 },
  cache: CACHE, osmJson: OSM_JSON,
})
export const bigFrame = makeFrame({
  ...ORIGIN, ppm: 2, name: 'big', box: { west: -650, east: 650, south: -750, north: 700 },
  tileBox: { south: 37.5640, west: 126.8868, north: 37.5772, east: 126.9016 },
  cache: CACHE, osmJson: OSM_JSON,
})
