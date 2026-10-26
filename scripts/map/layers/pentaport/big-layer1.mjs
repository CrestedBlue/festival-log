// Layer 1 (ground) of the big area map: the walk from 송도달빛축제공원역 and the shuttle stops to the venue, in real
// shapes (OSM) — roads at real widths as one shape with pale kerbs, parks, pitches, the lake, construction sites, and
// buildings as light 2.5D blocks (roof lifted over its walls, a soft shadow). The venue itself is only its outline here
// (in the small map's path grey): the small map's layers lie on top of it.
//   node scripts/map/layers/pentaport/big-layer1.mjs   (after layer1.mjs) → out/big-layer1-ground-north-up.svg, out/big-north-up-bounds.json
import fs from 'node:fs'
import path from 'node:path'
import { bigFrame as frame, BOX as SMALL_BOX } from './frame.mjs'
import { BIG_CLASSES as CLASSES, BIG_STYLE as STYLE } from './big-classes.mjs'
import { makeGround } from '../lib/ground.mjs'
import { OUT, CACHE } from './paths.mjs'

const { OSM, W, H, PPM, BOX, toPx, llToPx, pathD } = frame
const { maskOf, toF, joinLooseEnds, pathStrokes, closeOpen, zoneGroups, writeNorthUp, areas } = makeGround(frame)
const C = Object.fromEntries(CLASSES.map(([n], i) => [n, i]))
const colour = Object.fromEntries(CLASSES)
const SNAP_M = 5
// Road widths in metres per OSM way, read on the satellite. The big roads are mapped as two one-way carriageways
// (two ways side by side), so a carriageway with its pavement is about half the road.
const ROAD_WIDTH = { motorway: 14, motorway_link: 7, primary: 16, primary_link: 7, secondary: 16, secondary_link: 7, tertiary: 12, tertiary_link: 7,
  residential: 10, service: 5, construction: 10, footway: 3, pedestrian: 5, cycleway: 3, steps: 3, track: 3 }
const AREA = [ // tag test → class, painted in this order (later wins)
  [(t) => t.landuse === 'construction' || t.landuse === 'greenfield', 'open'],
  [(t) => t.leisure === 'park' || t.leisure === 'garden' || t.landuse === 'grass' || t.natural === 'grassland', 'park'],
  [(t) => t.leisure === 'pitch', 'pitch'],
  [(t) => t.natural === 'water', 'water'],
  [(t) => !!t.building, 'building'],
]
const closed = (w) => w.pts.length > 3 && w.pts[0][0] === w.pts[w.pts.length - 1][0] && w.pts[0][1] === w.pts[w.pts.length - 1][1]

// The venue: the small map's own outline (its layer 1 `venue` path, small-frame metres), moved into this frame.
const small = fs.readFileSync(path.join(OUT, 'layer1-ground-north-up.svg'), 'utf8')
const venueD = small.match(/<path id="venue"[^>]* d="([^"]+)"/)?.[1]
if (!venueD) throw new Error('run layer1.mjs first: no venue outline in the small layer 1')
const [dx, dy] = [SMALL_BOX.west - BOX.west, BOX.north - SMALL_BOX.north] // small-frame origin in this frame, metres
const venueSvg = `<path transform="scale(${PPM}) translate(${dx},${dy})" d="${venueD}" fill="#000"/>`
const venue = await maskOf(venueSvg)

const cls = new Int8Array(W * H).fill(C.land)
for (const [test, name] of AREA) {
  const d = OSM.ways.filter((w) => test(w.tags || {}) && closed(w)).map((w) => pathD(w.pts.map(llToPx), true)).join('')
  if (!d) continue
  const m = await maskOf(`<path d="${d}" fill="#000"/>`)
  for (let i = 0; i < W * H; i++) if (m[i] > 127) cls[i] = C[name]
}
for (let i = 0; i < W * H; i++) if (venue[i] > 127) cls[i] = C.venue

// Roads (and paths) at real widths as one shape, outside the venue (the small map has its own paths).
const ways = OSM.ways.filter((w) => w.tags?.highway in ROAD_WIDTH && w.tags.layer !== '-1').map((w) => ({ hw: w.tags.highway, width: ROAD_WIDTH[w.tags.highway], pts: w.pts.map(frame.toM) }))
const joined = joinLooseEnds(ways, SNAP_M)
const strokes = await maskOf(`<g fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round">${pathStrokes(ways)}</g>`)
const road = await closeOpen(Buffer.from(strokes.map((v, i) => (v > 127 && venue[i] <= 127 ? 255 : 0))), (i) => venue[i] <= 127)
for (let i = 0; i < W * H; i++) if (road[i]) cls[i] = C.road

const ORDER = ['open', 'park', 'pitch', 'water', 'venue']
const LABEL = { open: '공사장·빈터', park: '공원', pitch: '운동장', water: '호수', venue: '행사장(작은 지도 자리)' }
const zones = zoneGroups(ORDER, LABEL, cls, C, colour)
const roadD = frame.trace(toF((i) => cls[i] === C.road), { sigma: 1.5, tolerance: 0.3 })
const buildingD = frame.trace(toF((i) => cls[i] === C.building), { sigma: 1, tolerance: 0.2 })
const [sx, sy] = STYLE.shadowOffset
const VW = BOX.east - BOX.west, VH = BOX.north - BOX.south
const content = `<g id="layer1" data-name="레이어 1 · 바닥 (큰 지도)">
<rect id="land" data-name="땅" width="${VW}" height="${VH}" fill="${colour.land}"/>
<g id="zones" data-name="구역">${zones}</g>
<path id="roads" data-name="길" d="${roadD}" fill="${colour.road}" fill-rule="evenodd" stroke="${STYLE.kerb}" stroke-width="${STYLE.kerbWidth}" stroke-linejoin="round" paint-order="stroke"/>
<g id="buildings" data-name="건물" fill-rule="evenodd">
<path data-name="그림자" d="${buildingD}" fill="${STYLE.shadow}" transform="translate(${sx},${sy})"/>
<path data-name="벽" d="${buildingD}" fill="${STYLE.wall}"/>
<path data-name="지붕" d="${buildingD}" fill="${colour.building}" transform="translate(0,${-STYLE.roofLift})"/>
</g>
</g>`
writeNorthUp({ content, cls, colour, out: OUT, cache: CACHE, prefix: 'big-' })
console.log('path ends joined', joined, '| areas m²', areas(cls, CLASSES.map(([n, c]) => [n, c])))
