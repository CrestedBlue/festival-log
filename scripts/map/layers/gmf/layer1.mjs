// Layer 1 (ground) for GMF: the park around the festival as the venue; real shapes from OSM (88잔디마당,
// KSPO DOME); the official map's festival zones (picnic circles, Loving Forest, Hungry Zone, Art Zone, ticket booth) as
// loops carried over with each zone's fit; real paths on top as one shape. Unlike Pentaport the zones are not read
// from the official colours per face — the GMF official map is a schematic, so its blobs are placed zone by zone.
//   node scripts/map/layers/gmf/layer1.mjs
import * as frame from './frame.mjs'
import { CLASSES } from './classes.mjs'
import { makeGround } from '../lib/ground.mjs'
import { officialToM } from './official-to-m.mjs'
import { OUT, CACHE } from './paths.mjs'

const { OSM, W, H, BOX, toM, toPx, curve } = frame
const { maskOf, toF, joinLooseEnds, pathStrokes, closeOpen, zoneGroups, writeNorthUp, areas } = makeGround(frame)
const C = Object.fromEntries(CLASSES.map(([n], i) => [n, i]))
const colour = Object.fromEntries(CLASSES.map(([n, c]) => [n, c]))
const SNAP_M = 5
const isPath = (t) => t.highway && !/motorway|trunk|primary|secondary|tertiary|residential/.test(t.highway)
const way = (id) => OSM.ways.find((w) => w.id === String(id))
const LAWN = way(469354406).pts.map(toM) // 88잔디마당
const DOME = way(75956855).pts.map(toM) // 올림픽체조경기장 = KSPO DOME

// The venue: the park the official map shows (lawn, the way north to 88호수 수변무대, around the dome, the east hungry
// zone below the swimming pool, Art Zone and the ticket booth), local metres, read on the satellite with lib/read-osm-ways.mjs.
const VENUE = [[-220, -20], [-215, 40], [-200, 110], [-150, 160], [-95, 205], [-80, 250], [-45, 275], [-5, 255], [-15, 215], [20, 150], [90, 145], [160, 150], [220, 150],
  [255, 145], [282, 118], [268, 88], [240, 70], [232, 40], [215, -40], [215, -120], [205, -175], [160, -185], [110, -160], [60, -120], [10, -122], [-60, -140], [-120, -145], [-170, -125], [-205, -80]]
// Official blobs (official px: centre, radii) carried to the ground with their zone's fit, in drawing order.
const BLOBS = [
  ['picnic', 'mintBreeze', [172, 338], [42, 42]], ['picnic', 'mintBreeze', [227, 381], [33, 33]], ['picnic', 'mintBreeze', [310, 383], [32, 32]], ['picnic', 'mintBreeze', [360, 320], [28, 28]],
  ['lfg', 'lovingForest', [605, 255], [72, 72]],
  ['hungry', 'hungryEast', [660, 460], [80, 52]],
  ['art', 'artZone', [255, 628], [92, 68]],
  ['ticket', 'ticketBooth', [272, 755], [55, 26]],
]
const ellipse = ([cx, cy], [rx, ry], zone, n = 48) => Array.from({ length: n }, (_, i) => { const a = (i / n) * 2 * Math.PI; return officialToM([cx + rx * Math.cos(a), cy + ry * Math.sin(a)], zone) })

const frameD = (pts, closed) => curve(pts.map(([e, n]) => [e - BOX.west, BOX.north - n]), closed) // metres in SVG units
const pxD = (pts) => pts.map(toPx).map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join('') + 'Z'
const venueSmooth = curve(VENUE.map(toPx), true)
const venue = await maskOf(`<path d="${venueSmooth}" fill="#000"/>`)

// Zones per pixel, painted in order: park → lawn → official blobs → dome. (88호수 only grazes the venue edge and the
// official map does not draw it, so it is left out.)
const cls = new Int8Array(W * H).fill(-1)
const paint = async (name, d) => { const m = await maskOf(`<path d="${d}" fill="#000"/>`); for (let i = 0; i < W * H; i++) if (venue[i] > 127 && m[i] > 127) cls[i] = C[name] }
for (let i = 0; i < W * H; i++) if (venue[i] > 127) cls[i] = C.park
await paint('lawn', pxD(LAWN))
for (const [name, zone, c, r] of BLOBS) await paint(name, curve(ellipse(c, r, zone).map(toPx), true))
await paint('cms', pxD(DOME))

// Paths: real OSM paths (not the decorative rings inside the lawn), loose ends joined, drawn at real widths.
const inside = ([e, n], ring) => { let c = false; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const [xi, yi] = ring[i], [xj, yj] = ring[j]; if ((yi > n) !== (yj > n) && e < ((xj - xi) * (n - yi)) / (yj - yi) + xi) c = !c } return c }
const ways = OSM.ways.filter((w) => isPath(w.tags || {})).map((w) => ({ hw: w.tags.highway, pts: w.pts.map(toM) })).filter((w) => !w.pts.every((p) => inside(p, LAWN)))
joinLooseEnds(ways, SNAP_M)
const strokes = await maskOf(`<g fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round">${pathStrokes(ways)}</g>`)
const grey = await closeOpen(Buffer.from(strokes.map((v, i) => (v > 127 && venue[i] > 127 && cls[i] !== C.cms ? 255 : 0))), (i) => venue[i] > 127)

// Vectors.
const ORDER = ['lawn', 'picnic', 'lfg', 'hungry', 'art', 'ticket', 'cms']
const LABEL = { lawn: '88잔디마당', picnic: '피크닉존', lfg: 'Loving Forest Garden', hungry: 'Hungry Zone', art: 'Art Zone', ticket: '티켓 부스', cms: 'KSPO DOME' }
const zones = zoneGroups(ORDER, LABEL, cls, C, colour)
const venueD = frameD(VENUE, true)
const greyD = frame.trace(toF((i) => grey[i] > 0), { sigma: 2, tolerance: 0.2 })
const content = `<defs><clipPath id="venue-clip"><path d="${venueD}"/></clipPath></defs>
<g id="layer1" data-name="레이어 1 · 바닥">
<path id="venue" data-name="공원" d="${venueD}" fill="${colour.park}"/>
<g id="zones" data-name="구역" clip-path="url(#venue-clip)">${zones}</g>
<path id="paved" data-name="길" d="${greyD}" fill="${colour.path}" fill-rule="evenodd" clip-path="url(#venue-clip)"/>
</g>`
writeNorthUp({ content, cls, colour, out: OUT, cache: CACHE })
console.log('areas m²', areas(cls, CLASSES))
