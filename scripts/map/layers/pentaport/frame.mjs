// The frame for drawing the Pentaport venue in real coordinates (local metres, north-up); see lib/frame.mjs.
import { makeFrame } from '../lib/frame.mjs'
import { CACHE, OSM_JSON } from './paths.mjs'

export const { sharp, OSM, LAT0, LNG0, toM, toLL, BOX, PPM, W, H, toPx, pxToM, llToPx, pathD, satellite, trace, curve } = makeFrame({
  lat0: 37.406, lng0: 126.632,
  box: { west: -220, east: 400, south: -170, north: 340 },
  tileBox: { south: 37.4022, west: 126.628, north: 37.4098, east: 126.639 }, // Esri imagery dated 2026-01-01 here
  cache: CACHE, osmJson: OSM_JSON,
})
