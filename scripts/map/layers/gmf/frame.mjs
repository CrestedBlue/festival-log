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
// and 올림픽공원역 (5·9호선, south-east), same origin — as far as the OSM extract reaches.
export const bigFrame = makeFrame({
  lat0: 37.519, lng0: 127.126, ppm: 2, name: 'big',
  box: { west: -1290, east: 620, south: -540, north: 470 },
  tileBox: { south: 37.5141, west: 127.1114, north: 37.5233, east: 127.1331 },
  cache: CACHE, osmJson: OSM_JSON,
})
