// The WONDERLIVET map (lib/venue-map.mjs): the official 2026 festival map's halls and stages on the real halls of
// KINTEX's second exhibition centre (halls.mjs), in its dark look — the building in near-black, the 1F lobby brown, the
// halls black with orange walls, the stages orange — over the big area map with the stations. Then the places the
// catalog pins (places.mjs), in latitude and longitude, for series/wonderlivet.ts.
//   node scripts/map/layers/wonderlivet/map.mjs   → map-src/wonderlivet/layers/out/, src/assets/maps/wonderlivet/, src/assets/maps/wonderlivet.json
import fs from 'node:fs'
import path from 'node:path'
import { frame, bigFrame } from './frame.mjs'
import { OUT, CACHE, ROOT } from './paths.mjs'
import { STATIONS } from './stations.mjs'
import { HALLS, LOBBY, ROWS, FIT_ERRORS, officialToM } from './halls.mjs'
import { STAGE_BOXES, STAGE_LIFT_PX, OFFICIAL, AT_ENTRANCE, RESTROOMS } from './places.mjs'
import { LANDMARKS } from './landmarks.mjs'
import { buildVenueMap } from '../lib/venue-map.mjs'

// Colours of the official festival map (sampled): black ground, brown floors, black halls with orange lines and grid,
// orange stages. The building's other parts (hall 6, the service strips) a little lighter than the ground.
const BUILDING = '#2a2420', LOBBY_FLOOR = '#3d1d0c', HALL = '#100b09', ORANGE = '#f16623'
const ll = (pts) => pts.map((p) => frame.toLL(p))
const centre = (pts) => frame.toLL([pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length])
const stageM = (key) => STAGE_BOXES[key].px.map(([x, y]) => officialToM([x, y + STAGE_LIFT_PX], STAGE_BOXES[key].zone))
console.log('fit error (m, mean over the corners)', FIT_ERRORS)

await buildVenueMap({ root: ROOT, code: 'wonderlivet', out: OUT, cache: CACHE, frame, bigFrame,
  venue: { osm: ['6921083'], fill: BUILDING, path: BUILDING },
  zones: [
    { name: 'lobby', label: '1층 로비', colour: LOBBY_FLOOR, solid: true, ll: ll(LOBBY), labelAt: centre([HALLS.h78[3], HALLS.h10[0], HALLS.h9[1], HALLS.h78[2]]) },
    { name: 'hall78', label: '7·8홀', unnamed: true, colour: HALL, edge: ORANGE, solid: true, ll: ll(HALLS.h78) },
    { name: 'hall9', label: '9홀', unnamed: true, colour: HALL, edge: ORANGE, solid: true, ll: ll(HALLS.h9) },
    { name: 'hall10', label: '10홀', unnamed: true, colour: HALL, edge: ORANGE, solid: true, ll: ll(HALLS.h10) },
    { name: 'stageWonder', label: 'WONDER STAGE', unnamed: true, colour: ORANGE, solid: true, ll: ll(stageM('wonder')) },
    { name: 'stageLivet', label: 'LIVET STAGE', unnamed: true, colour: ORANGE, solid: true, ll: ll(stageM('livet')) },
  ],
  stages: [
    { text: 'WONDER STAGE', stage: 'wonder', colour: '#ff6800', at: centre(stageM('wonder')) },
    { text: 'LIVET STAGE', stage: 'livet', colour: '#9c3d00', at: centre(stageM('livet')) },
  ],
  // the halls' names by their outer walls, as the official map writes them
  places: [
    { text: '7홀', colour: ORANGE, at: frame.toLL(ROWS.se(200, 28)) },
    { text: '8홀', colour: ORANGE, at: frame.toLL(ROWS.se(72, 28)) },
    { text: '10홀', colour: ORANGE, at: frame.toLL(ROWS.h10(74, 26)) },
    { text: '9홀', colour: ORANGE, at: frame.toLL(ROWS.h9(74, 26)) },
  ],
  stations: STATIONS,
  landmarks: LANDMARKS,
  attribution: '지도: 원더리벳 2026 페스티벌 맵을 킨텍스 제2전시장 평면도에 맞춰 다시 그림 · 지형: © OpenStreetMap 기여자',
})

// The places the catalog pins, [lat, lng] (series/wonderlivet.ts), and a check file for the preview.
const round = ([lat, lng]) => [+lat.toFixed(6), +lng.toFixed(6)]
const places = {
  ...Object.fromEntries(Object.entries(OFFICIAL).map(([key, [px, zone]]) => [key, round(frame.toLL(officialToM(px, zone)))])),
  ...Object.fromEntries(Object.entries(AT_ENTRANCE).map(([key, m]) => [key, round(frame.toLL(m))])),
  ...Object.fromEntries(Object.entries(RESTROOMS).map(([key, [rowKey, t, s]]) => [`restroom-${key}`, round(frame.toLL(ROWS[rowKey](t, s)))])),
}
fs.writeFileSync(path.join(CACHE, 'places.json'), `${JSON.stringify(places, null, 2)}\n`)
for (const [key, [lat, lng]] of Object.entries(places)) console.log(key.padEnd(24), lat, lng)
