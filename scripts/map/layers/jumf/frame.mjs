// The JUMF map's frames (lib/frame.mjs): the venue map over 전주대학교's artificial-turf fields A·B and the air dome
// 희망홀 beside them, and the big area map of the campus around it (no subway in Jeonju: the bus stops). Same origin
// (the fields). Inside the OSM extract (2026-11-04).
import { makeFrame } from '../lib/frame.mjs'
import { CACHE, OSM_JSON } from './paths.mjs'

const ORIGIN = { lat0: 35.81149, lng0: 127.08738 }
export const frame = makeFrame({
  ...ORIGIN, box: { west: -150, east: 110, south: -135, north: 125 },
  tileBox: { south: 35.8100, west: 127.0855, north: 35.8127, east: 127.0887 },
  cache: CACHE, osmJson: OSM_JSON,
})
export const bigFrame = makeFrame({
  ...ORIGIN, ppm: 2, name: 'big', box: { west: -560, east: 640, south: -640, north: 680 },
  tileBox: { south: 35.8055, west: 127.0805, north: 35.8175, east: 127.0955 },
  cache: CACHE, osmJson: OSM_JSON,
})
