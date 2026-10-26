// The GMF map for the app (lib/app.mjs): the big area map's layer 1 at the bottom, then the small map's layers 1 and 2
// over the venue — each its own image. Layer 3's pins become marks the app draws as icons at a fixed size, and layer
// 2's stage names, zone flags, the stations and big landmarks become labels the app writes (both shown by zoom, like a
// street map).
//   node scripts/map/layers/gmf/app.mjs   (after the layers) → src/assets/maps/gmf/*.svg, src/assets/maps/gmf.json
import fs from 'node:fs'
import path from 'node:path'
import { toLL, toM, BOX, OSM, bigFrame } from './frame.mjs'
import { officialToM } from './official-to-m.mjs'
import { GROUPS } from './objects.mjs'
import * as geometry from './geometry.mjs'
import * as SP from './sprites.mjs'
import { OUT, CACHE, ROOT, SRC } from './paths.mjs'
import { PIN_R, TYPES, badge } from './pin-design.mjs'
import { STATIONS } from './stations.mjs'
import { badgeIcon, exitIcon } from '../lib/app-icons.mjs'
import { stationNameAt } from '../lib/big-layer1.mjs'
import { measureTexts } from '../lib/texts.mjs'
import { writeAppMap, boundsOf } from '../lib/app.mjs'

const ll = ([lat, lng]) => ({ lat: +lat.toFixed(6), lng: +lng.toFixed(6) })
const near = (a, b) => Math.hypot(...toM([a.lat, a.lng]).map((v, i) => v - toM([b.lat, b.lng])[i]))

await measureTexts(SP, GROUPS)
const items = GROUPS.flatMap((g) => g.items)
// the real place of an object: its visual centre carried to the ground by its zone's fit
const placeOf = (it) => { const [x, y] = it.s, [cx, cy] = geometry.centreOffset(it); return toLL(officialToM([x + cx, y + cy], it.zone)) }
const small = boundsOf(path.join(OUT, 'north-up-bounds.json'))
const northUpLL = ([x, y]) => toLL([x + BOX.west, BOX.north - y]).map((v) => +v.toFixed(6))

// Marks: the layer 3 pins, drawn by the app as icons where layer 3 puts them (`spot`), each with the festival zone it
// stands in. Things that share a booth are one mark: the Mint Shop sells the official MD and shows the slogans; the
// Artist & Label booth sells the vinyl too.
const ZONE_NAMES = { mintBreeze: 'Mint Breeze', lovingForest: 'Loving Forest Garden', clubMidnight: 'Club Midnight Sunset', artZone: 'Art Zone', hungryEast: 'Hungry Zone', ticketBooth: '티켓 부스', between: '' }
const zoneOf = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(SRC, 'pins-official.json'))).map((p) => [`gmf-pin-${p.id}`, ZONE_NAMES[p.zone] ?? '']))
const MERGED = { shop: 'mintShop', slogan: 'mintShop', artist: 'artistVinyl', vinyl: 'artistVinyl' }
const marks = []
for (const p of JSON.parse(fs.readFileSync(path.join(OUT, 'layer3-pins.json'))).pins) {
  const kind = MERGED[p.type] ?? p.type
  const spot = { lat: p.badge[0], lng: p.badge[1] }
  const twin = MERGED[p.type] && marks.find((m) => m.kind === kind)
  if (twin) { // halfway between the two
    if (near(twin.spot, spot) > 40) throw new Error(`${kind}: the two badges are ${Math.round(near(twin.spot, spot))} m apart`)
    twin.lat = +((twin.lat + p.lat) / 2).toFixed(6); twin.lng = +((twin.lng + p.lng) / 2).toFixed(6)
    twin.spot = { lat: +((twin.spot.lat + spot.lat) / 2).toFixed(6), lng: +((twin.spot.lng + spot.lng) / 2).toFixed(6) }
    continue
  }
  marks.push({ id: marks.length + 1, kind, zone: zoneOf[p.id], lat: p.lat, lng: p.lng, spot }) // numbered in layer 3's order
}

// Icons the app draws at a fixed size: every badge of layer 3 (the pin's head) and the subway exit numbers.
const icons = Object.fromEntries(Object.keys(TYPES).filter((type) => !MERGED[type]).map((type) => [type, badgeIcon(badge(type), PIN_R)]))
icons.mintShop = badgeIcon(badge('shop'), PIN_R)
icons.artistVinyl = badgeIcon(badge('artist'), PIN_R)
for (const n of [1, 2, 3, 4, 5]) icons[`exit-${n}`] = exitIcon(n)

// Names the app writes on the map (fixed size, shown from `minZoom` on, fewer when they would overlap).
const mean = (pts) => [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length]
const centre = (ids) => mean(ids.flatMap((id) => { const w = OSM.ways.find((x) => x.id === id); if (!w) throw new Error(`no OSM way ${id}`); return w.pts }))
const LANDMARKS = [ // [name, OSM ways]: big places on the walks from the stations
  ['평화의광장', ['473971980']], ['몽촌호', OSM.relations.find((r) => r.tags.name === '몽촌호').outer], ['한성백제박물관', ['415026027']],
  ['올림픽홀', ['75956846']], ['핸드볼경기장', ['75956853']], ['올림픽수영경기장', ['75956856']],
]
const LAYOUT = JSON.parse(fs.readFileSync(path.join(CACHE, 'labels-northup.json')))
const stageLabels = GROUPS.find((g) => g.id === 'labels').items.map((it, i) => ({ it, key: `labels:${i}` }))
// zone flags with a pin of their own (RADAR, Mint Shop) are named by the pin
const flags = items.filter((it) => it.kind === 'flag' && !['RADAR', 'Mint Shop'].includes(it.args[0]))
const labels = [
  // past the north end of each station box the big map draws, with the lines' badges, as on Korean street maps
  ...STATIONS.map((s) => ({ text: s.name, kind: 'station', badges: s.lines, minZoom: 14, ...ll(stationNameAt(bigFrame, s)) })),
  ...LANDMARKS.map(([text, ids]) => ({ text, kind: 'building', minZoom: 15.5, ...ll(centre(ids)) })),
  ...flags.map((it) => ({ text: it.args[0], kind: 'zone', colour: it.args[1], minZoom: 16.5, ...ll(placeOf(it)) })),
  // layer 2's stage names; TICKET BOOTH is what the ticket booth pin says, so it is left out
  ...stageLabels.filter(({ it }) => it.of !== 'ticket').map(({ it, key }) => ({
    text: it.args[0].map(([t]) => t).join(' '), colour: it.args[0][0][1], kind: 'stage', minZoom: 15.3, ...ll(northUpLL(LAYOUT[key])),
  })),
]

writeAppMap({ root: ROOT, code: 'gmf',
  layers: [
    { src: path.join(OUT, 'big-layer1-ground-north-up.svg'), file: 'big-layer1.svg', bounds: boundsOf(path.join(OUT, 'big-north-up-bounds.json')) },
    { src: path.join(OUT, 'layer1-ground-north-up.svg'), file: 'layer1.svg', bounds: small },
    // its name labels and zone flags are written by the app (fixed size); layer 3's pins are drawn by the app as icons
    { src: path.join(OUT, 'layer2-operations-north-up.svg'), file: 'layer2.svg', bounds: small, strip: ['l2-labels', 'l2-flags'] },
  ],
  // Opens on the small map (the venue); the big map around it is there to zoom out to the stations.
  initialView: small, marks, icons, labels, maxZoom: 19.5,
  background: '#f3e9ce', fillOnOpen: false, // the big map's cream ground runs on around it
  zoomOutFills: true, // zoomed right out the big map still fills the screen; a station is a pan away
  attribution: '지도: 2026 그랜드 민트 페스티벌 공식 지도를 실제 위치에 맞춰 다시 그림 · 지형: © OpenStreetMap 기여자',
})
