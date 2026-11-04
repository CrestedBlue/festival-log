// The Let's Rock map's frames (lib/frame.mjs): the venue map over 젊음의광장 in 난지한강공원 and the big area map of the
// park around it, between the river and 강변북로 (no station within a walk: the shuttle and bus stops). Same origin (the
// lawn). Inside the OSM extract (2026-11-04).
import { makeFrame } from '../lib/frame.mjs'
import { CACHE, OSM_JSON } from './paths.mjs'

const ORIGIN = { lat0: 37.5661, lng0: 126.8774 }
export const frame = makeFrame({
  ...ORIGIN, box: { west: -140, east: 140, south: -130, north: 130 },
  tileBox: { south: 37.5648, west: 126.8758, north: 37.5674, east: 126.8790 },
  cache: CACHE, osmJson: OSM_JSON,
})
export const bigFrame = makeFrame({
  ...ORIGIN, ppm: 2, name: 'big', box: { west: -650, east: 650, south: -700, north: 750 },
  tileBox: { south: 37.5598, west: 126.8700, north: 37.5729, east: 126.8848 },
  cache: CACHE, osmJson: OSM_JSON,
})
