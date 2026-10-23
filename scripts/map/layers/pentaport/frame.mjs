// The frame for drawing the Pentaport venue in real coordinates (local metres, north-up); see lib/frame.mjs.
import { makeFrame } from '../lib/frame.mjs'
import { CACHE, OSM_JSON } from './paths.mjs'

export const { sharp, OSM, LAT0, LNG0, toM, toLL, BOX, PPM, W, H, toPx, pxToM, llToPx, pathD, satellite, trace, curve } = makeFrame({
  lat0: 37.406, lng0: 126.632,
  box: { west: -220, east: 400, south: -170, north: 340 },
  tileBox: { south: 37.4022, west: 126.628, north: 37.4098, east: 126.639 }, // Esri imagery dated 2026-01-01 here
  cache: CACHE, osmJson: OSM_JSON,
})
// The big area map (layer 1 only): the venue plus the walk from 송도달빛축제공원역 and the shuttle stops, same origin.
export const bigFrame = makeFrame({
  lat0: 37.406, lng0: 126.632, ppm: 2, name: 'big',
  box: { west: -660, east: 430, south: -580, north: 400 },
  tileBox: { south: 37.4005, west: 126.624, north: 37.41, east: 126.639 },
  cache: CACHE, osmJson: OSM_JSON,
})
