// The SJF map's frames (lib/frame.mjs): GMF's (the same Olympic Park, the same origin), the venue map reaching a little
// further south for 티켓링크 라이브 아레나 (the handball arena, PINK AVENUE).
import { makeFrame } from '../lib/frame.mjs'
import { CACHE, OSM_JSON } from './paths.mjs'

const ORIGIN = { lat0: 37.519, lng0: 127.126 }
export const frame = makeFrame({
  ...ORIGIN, box: { west: -260, east: 300, south: -265, north: 360 },
  tileBox: { south: 37.5155, west: 127.1225, north: 37.5236, east: 127.1300 },
  cache: CACHE, osmJson: OSM_JSON,
})
export const bigFrame = makeFrame({
  ...ORIGIN, ppm: 2, name: 'big', box: { west: -1290, east: 620, south: -1150, north: 1200 },
  tileBox: { south: 37.5082, west: 127.1108, north: 37.5303, east: 127.1336 },
  cache: CACHE, osmJson: OSM_JSON,
})
