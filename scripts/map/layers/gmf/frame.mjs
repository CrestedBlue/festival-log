// The frame for drawing the Grand Mint Festival venue (Olympic Park) in real coordinates (local metres, north-up); see
// lib/frame.mjs.
import { makeFrame } from '../lib/frame.mjs'
import { CACHE, OSM_JSON } from './paths.mjs'

export const { sharp, OSM, LAT0, LNG0, toM, toLL, BOX, PPM, W, H, toPx, pxToM, llToPx, pathD, satellite, trace, curve } = makeFrame({
  lat0: 37.519, lng0: 127.126,
  box: { west: -260, east: 300, south: -230, north: 360 },
  tileBox: { south: 37.5158, west: 127.1225, north: 37.5236, east: 127.1300 },
  cache: CACHE, osmJson: OSM_JSON,
})
// The big area map (layer 1 only): the park plus the walks from 몽촌토성역 (8호선, west), 한성백제역 (9호선, south-west)
// and 올림픽공원역 (5·9호선, south-east), same origin. Tall rather than wide (the OSM extract was widened north and
// south for it, 2026-10-26): a phone held upright should be able to zoom out to a station and the venue together
// with the map still filling the screen.
export const bigFrame = makeFrame({
  lat0: 37.519, lng0: 127.126, ppm: 2, name: 'big',
  box: { west: -1290, east: 620, south: -1150, north: 1200 },
  tileBox: { south: 37.5082, west: 127.1108, north: 37.5303, east: 127.1336 },
  cache: CACHE, osmJson: OSM_JSON,
})
