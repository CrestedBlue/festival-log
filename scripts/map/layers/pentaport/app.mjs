// The Pentaport map for the app (lib/app.mjs): the big area map's layer 1 at the bottom, then the small map's layers 1
// and 2 over the venue — each its own image. Layer 3's pins become marks the app draws as icons at a fixed size, and
// layer 2's name labels, the station and big buildings become labels the app writes (both shown by zoom, like a street
// map). Anchors are the real places of the drawn stages, gates and security check.
//   node scripts/map/layers/pentaport/app.mjs   (after the layers) → src/assets/maps/pentaport/*.svg, src/assets/maps/pentaport.json
import fs from 'node:fs'
import path from 'node:path'
import { toLL, toM, BOX, OSM } from './frame.mjs'
import { officialToM } from './official-to-m.mjs'
import { GROUPS } from './objects.mjs'
import * as geometry from './geometry.mjs'
import * as SP from './sprites.mjs'
import { OUT, CACHE, ROOT } from './paths.mjs'
import { R, GATE_R, TYPES, badge } from './pin-design.mjs'
import { badgeIcon, busIcon, exitIcon, ticketIcon, shuttleIcon } from '../lib/app-icons.mjs'
import { findStation } from '../lib/station.mjs'
import { BIG_STYLE } from './big-classes.mjs'
import { measureTexts } from '../lib/texts.mjs'
import { writeAppMap, boundsOf } from '../lib/app.mjs'

const ll = ([lat, lng]) => ({ lat: +lat.toFixed(6), lng: +lng.toFixed(6) })

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
const small = boundsOf(path.join(OUT, 'north-up-bounds.json'))
const northUpLL = ([x, y]) => toLL([x + BOX.west, BOX.north - y]).map((v) => +v.toFixed(6))

// Marks: the layer 3 pins, drawn by the app as icons where layer 3 puts them (`spot`). The security check and the
// lockers stand side by side, so they are one mark (their badges said nearly the same thing).
const pins = JSON.parse(fs.readFileSync(path.join(OUT, 'layer3-pins.json'))).pins
const MERGED = { securityCheck: 'checkLockers', lockers: 'checkLockers' }
const near = (p, a) => Math.hypot(p.lat - a[0], p.lng - a[1])
// a gate badge is GATE 1 or GATE 2, whichever arch it stands by
const gateOf = (p) => (near(p, anchors.gate1) < near(p, anchors.gate2) ? 'gate1' : 'gate2')
const marks = []
for (const p of pins) {
  const kind = MERGED[p.type] ?? (p.type === 'gate' ? gateOf(p) : p.type)
  const twin = MERGED[p.type] && marks.find((m) => m.kind === kind)
  if (twin) { // halfway between the two
    twin.lat = +((twin.lat + p.lat) / 2).toFixed(6); twin.lng = +((twin.lng + p.lng) / 2).toFixed(6)
    twin.spot = { lat: +((twin.spot.lat + p.badge[0]) / 2).toFixed(6), lng: +((twin.spot.lng + p.badge[1]) / 2).toFixed(6) }
    continue
  }
  marks.push({ id: marks.length + 1, kind, zone: '', lat: p.lat, lng: p.lng, spot: { lat: p.badge[0], lng: p.badge[1] } }) // numbered in layer 3's order
}

// Icons the app draws at a fixed size: every badge of layer 3, the exits, the station, ticket booths, shuttle stops.
const icons = Object.fromEntries(Object.keys(TYPES).map((type) => [type, badgeIcon(badge(type), type === 'gate' ? GATE_R : R)]))
icons.checkLockers = icons.lockers
icons.gate1 = icons.gate2 = icons.gate
for (const unused of ['lockers', 'securityCheck', 'gate']) delete icons[unused]
for (const n of [1, 2, 3, 4]) icons[`exit-${n}`] = exitIcon(n)
icons.ticket = ticketIcon()
icons.shuttle = shuttleIcon()
icons.bus = busIcon()

// Names the app writes on the map (fixed size, shown from `minZoom` on, fewer when they would overlap).
const STATION = BIG_STYLE.station
const station = findStation({ OSM, toM }, STATION.near, { length: STATION.length })
const way = (name) => { const w = OSM.ways.find((x) => x.tags?.name === name); if (!w) throw new Error(`no OSM ${name}`); return mean(w.pts) }
const labelItems = GROUPS.flatMap((g) => g.items.map((it, i) => ({ it, key: `${g.id}:${i}` }))).filter(({ it }) => it.kind === 'label')
const LAYOUT = JSON.parse(fs.readFileSync(path.join(CACHE, 'labels-northup.json')))
const STAGES = new Set(['kbStage', 'monsterStage', 'stanleyStage'])
const labels = [
  // past the north end of the station box the big map draws, with the line's badge, as on Korean street maps
  { text: '송도달빛축제공원역', kind: 'station', badge: { text: STATION.line, colour: STATION.fill }, minZoom: 14, ...ll(toLL(station.nameAt)) },
  { text: '송도 랜드마크 푸르지오시티', kind: 'building', minZoom: 15.5, ...ll(way('송도랜드마크푸르지오 오피스텔')) },
  { text: '송도 한라웨스턴파크', kind: 'building', minZoom: 15.5, ...ll(way('송도한라웨스턴파크 셀럽하우스 아파트')) },
  { text: '송도 씨워크인테라스 한라', kind: 'building', minZoom: 15.5, ...ll(way('송도씨워크인테라스한라')) },
  // city bus stops (OSM): the stop's name by a bus icon, close in
  ...(OSM.busStops ?? []).filter((stop) => stop.name).map((stop) => ({ text: stop.name, kind: 'bus', icon: 'bus', minZoom: 16.5, ...ll([stop.lat, stop.lng]) })),
  // layer 2's name labels; the two 입장동선 labels say what the gate pins say, so they are left out
  ...labelItems.filter(({ it }) => !it.of?.startsWith('gate')).map(({ it, key }) => ({
    text: it.args[0].map(([t]) => t.replace('&amp;', '&')).join(' '), colour: it.args[0][0][1],
    kind: STAGES.has(it.of) ? 'stage' : 'place', minZoom: STAGES.has(it.of) ? 15.3 : 16.5, ...ll(northUpLL(LAYOUT[key])),
  })),
]

writeAppMap({ root: ROOT, code: 'pentaport',
  layers: [
    { src: path.join(OUT, 'big-layer1-ground-north-up.svg'), file: 'big-layer1.svg', bounds: boundsOf(path.join(OUT, 'big-north-up-bounds.json')) },
    { src: path.join(OUT, 'layer1-ground-north-up.svg'), file: 'layer1.svg', bounds: small },
    // its name labels are written by the app (fixed size); layer 3's pins are drawn by the app as icons
    { src: path.join(OUT, 'layer2-operations-north-up.svg'), file: 'layer2.svg', bounds: small, strip: ['l2-labels'] },
  ],
  // Opens on the small map (the venue); the big map around it is there to zoom out to the station and shuttle stops.
  initialView: small, anchors, marks, icons, labels, maxZoom: 19.5,
  background: '#f3e9ce', fillOnOpen: false, // the big map's cream ground runs on around it
  attribution: '지도: 2026 인천펜타포트 락 페스티벌 공식 행사장 안내도를 실제 위치에 맞춰 다시 그림 · 지형: © OpenStreetMap 기여자',
})
