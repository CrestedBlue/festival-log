// The Pentaport map for the app (lib/app.mjs): the big area map's layer 1 at the bottom, then the small map's layers
// 1–3 over the venue — each its own image. Anchors are the drawn places the app lists (stages, gates, the security
// check: their real places); marks are the layer 3 pins.
//   node scripts/map/layers/pentaport/app.mjs   (after the layers) → src/assets/maps/pentaport/*.svg, src/assets/maps/pentaport.json
import fs from 'node:fs'
import path from 'node:path'
import { toLL } from './frame.mjs'
import { officialToM } from './official-to-m.mjs'
import { GROUPS } from './objects.mjs'
import * as geometry from './geometry.mjs'
import * as SP from './sprites.mjs'
import { OUT, ROOT } from './paths.mjs'
import { R, GATE_R } from './pin-design.mjs'
import { measureTexts } from '../lib/texts.mjs'
import { writeAppMap, boundsOf } from '../lib/app.mjs'

await measureTexts(SP, GROUPS)
const items = GROUPS.flatMap((g) => g.items)
// the real place of an object: its visual centre carried to the ground
const placeOf = (it) => { const [x, y] = it.s, [cx, cy] = geometry.centreOffset(it); return toLL(officialToM([x + cx, y + cy])) }
const byId = (id) => { const it = items.find((i) => i.id === id); if (!it) throw new Error(`no object ${id}`); return placeOf(it) }
const mean = (pts) => [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length]
const anchors = {
  kbStage: byId('kbStage'), monsterStage: byId('monsterStage'), stanleyStage: byId('stanleyStage'), gate1: byId('gate1'), gate2: byId('gate2'),
  securityCheck: mean(items.filter((it) => it.tag === '물품검색').map(placeOf)),
}
// Tapping the drawing selects the place: within half the sprite's size of a stage or gate, along the row of
// security-check containers.
const M = geometry.PX_TO_M
const half = (it) => (Math.max(...geometry.sizeOf(it)) / 2) * M
const anchorTaps = Object.fromEntries(['kbStage', 'monsterStage', 'stanleyStage', 'gate1', 'gate2'].map((id) => [id, +half(items.find((i) => i.id === id)).toFixed(1)]))
const metres = (a, b) => Math.hypot((a[0] - b[0]) * 111_320, (a[1] - b[1]) * 111_320 * Math.cos((a[0] * Math.PI) / 180))
const checks = items.filter((it) => it.tag === '물품검색')
anchorTaps.securityCheck = +Math.max(...checks.map((it) => metres(placeOf(it), anchors.securityCheck) + half(it))).toFixed(1)
const pins = JSON.parse(fs.readFileSync(path.join(OUT, 'layer3-pins.json'))).pins
const badgeRadius = (type) => +((type === 'gate' ? GATE_R : R) * M * 1.2).toFixed(1) // a little over the drawn badge
const marks = pins.map((p, i) => ({ id: i + 1, kind: p.type, zone: '', lat: p.lat, lng: p.lng, tap: { lat: p.badge[0], lng: p.badge[1], radius: badgeRadius(p.type) } })) // numbered in layer 3's order
const small = boundsOf(path.join(OUT, 'north-up-bounds.json'))
// Opens on the small map (the venue); the big map around it is there to zoom out to the station and shuttle stops.
const initialView = small

writeAppMap({ root: ROOT, code: 'pentaport',
  layers: [
    { src: path.join(OUT, 'big-layer1-ground-north-up.svg'), file: 'big-layer1.svg', bounds: boundsOf(path.join(OUT, 'big-north-up-bounds.json')) },
    { src: path.join(OUT, 'layer1-ground-north-up.svg'), file: 'layer1.svg', bounds: small },
    { src: path.join(OUT, 'layer2-operations-north-up.svg'), file: 'layer2.svg', bounds: small },
    { src: path.join(OUT, 'layer3-pins-north-up.svg'), file: 'layer3.svg', bounds: small },
  ],
  initialView, anchors, anchorTaps, marks, maxZoom: 19.5,
  background: '#f3e9ce', fillOnOpen: false, // the big map's cream ground runs on around it
  attribution: '지도: 2026 인천펜타포트 락 페스티벌 공식 행사장 안내도를 실제 위치에 맞춰 다시 그림 · 지형: © OpenStreetMap 기여자',
})
