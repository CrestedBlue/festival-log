// Layer 1 (ground) for GMF: the park around the festival as the venue, and each festival zone on the real place its
// name gives (the official map lays them out as it likes, so its shapes are not used): Mint Breeze = 88잔디마당 (its
// south part the picnic zone), Loving Forest Garden = 88호수 수변무대 and the space before it, Club Midnight Sunset =
// KSPO DOME (올림픽체조경기장), Hungry Zone = between 체조경기장 and 올림픽수영경기장, Art Zone = 한얼광장 (the plaza between
// 체조경기장 and 핸드볼경기장), ticket booth = the canopy at its south-east end. Zones are whole faces between real paths
// and buildings (as for Pentaport); real paths on top as one shape.
//   node scripts/map/layers/gmf/layer1.mjs   (DEBUG_FACES=1 dumps the faces and seeds → cache debug-faces.png)
import path from 'node:path'
import * as frame from './frame.mjs'
import { CLASSES } from './classes.mjs'
import { makeGround } from '../lib/ground.mjs'
import { makeFaces } from '../lib/faces.mjs'
import { OUT, CACHE } from './paths.mjs'

const { sharp, OSM, W, H, BOX, toM, toPx, llToPx, pathD, curve } = frame
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
// Faces are bounded by every path and by the buildings and water the zones are named after.
const BOUNDS = ['올림픽체조경기장', '올림픽수영경기장', 'SK올림픽핸드볼경기장', '88호수', '88잔디마당', '88호수 수변무대']
const { barriers, makeRunOn, labelFaces } = makeFaces(frame, (t) => !!t.highway && t.highway !== 'construction')
// Split lines (local metres) where a zone has no path to end it; both ends run on to the nearest path or building.
const SPLITS = {
  // the hungry zone between the arenas, closed off from the open ground around them
  hungryNorthWest: [[-6, 200], [-12, 200]], // west of 올림픽수영경기장
  hungryNorth: [[124, 195], [150, 195]], // east of 올림픽수영경기장 (the car park road beyond)
  hungryEast: [[188, 65], [191, 65]], // 체조경기장's north-east side, dome to the first path (the ring round the dome is not the zone)
  hungryWest: [[70, 65], [55, 65]], // 체조경기장's north-west side (the way down to 한얼광장 beyond)
}
// Zones: points inside the faces they take (local metres).
const ZONES = [
  { name: 'lfg', seeds: [[-49, 225], [-80, 205]] }, // 수변무대 with its seating ring, and the space before it
  { name: 'hungry', seeds: [[80, 130]] }, // between the two arenas
  { name: 'art', seeds: [[30, -80], [110, -80], [85, -115], [145, -100]] }, // 한얼광장: the paving, the brick square, the ramp
  { name: 'ticket', seeds: [[177, -147]] }, // the canopy at the plaza's south-east end, on the way to 올림픽공원역
]
const PICNIC_NORTH = -15 // the lawn south of this (m) is the picnic zone; the stage and standing zone are north

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
for (let i = 0; i < W * H; i++) if (cls[i] === C.lawn && Math.floor(i / W) > (BOX.north - PICNIC_NORTH) * frame.PPM) cls[i] = C.picnic
const boundsSvg = OSM.ways.filter((w) => BOUNDS.includes(w.tags?.name)).map((w) => `<path d="${pathD(w.pts.map(llToPx), true)}" fill="none" stroke="#000" stroke-width="4"/>`).join('')
const runOn = makeRunOn(await barriers(boundsSvg))
const splitLines = Object.values(SPLITS).map((l) => runOn(l, false, 80))
const { lab } = await labelFaces(boundsSvg + splitLines.map((l) => `<path d="${pathD(l.map(toPx))}" fill="none" stroke="#000" stroke-width="4"/>`).join(''))
const faceAt = (p) => { const [x, y] = toPx(p); const f = lab[Math.round(y) * W + Math.round(x)]; if (f <= 0) throw new Error(`seed ${p} sits on a line`); return f }
if (process.env.DEBUG_FACES) {
  const rgb = Buffer.alloc(W * H * 3); const hue = (f) => [(f * 97) % 200 + 40, (f * 57) % 200 + 40, (f * 151) % 200 + 40]
  for (let i = 0; i < W * H; i++) rgb.set(lab[i] <= 0 ? [0, 0, 0] : hue(lab[i]), i * 3)
  const lines = splitLines.map((l) => `<path d="${pathD(l.map(toPx))}" fill="none" stroke="#f00" stroke-width="3"/>`).join('')
  const dots = ZONES.flatMap((z) => z.seeds.map((p) => { const [x, y] = toPx(p); return `<circle cx="${x}" cy="${y}" r="7" fill="#fff" stroke="#000" stroke-width="2"/><text x="${x + 9}" y="${y + 6}" font-size="22" font-family="Arial" font-weight="700" fill="#fff" stroke="#000" stroke-width="3" paint-order="stroke">${z.name}</text>` })).join('')
  const buf = await sharp(rgb, { raw: { width: W, height: H, channels: 3 } }).composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${lines}${dots}</svg>`) }]).png().toBuffer()
  await sharp(buf).resize(1120).toFile(path.join(CACHE, 'debug-faces.png'))
  process.exit(0)
}
for (const { name, seeds } of ZONES) {
  const faces = new Set(seeds.map(faceAt))
  for (let i = 0; i < W * H; i++) if (venue[i] > 127 && faces.has(lab[i])) cls[i] = C[name]
}
// split lines and building outlines take the zone beside them (no seam of park colour inside a zone)
for (let pass = 0; pass < 3; pass++) {
  const next = Int8Array.from(cls)
  for (let i = 0; i < W * H; i++) { if (lab[i] !== 0 || cls[i] !== C.park) continue
    const x = i % W; for (const j of [x > 0 ? i - 1 : -1, x < W - 1 ? i + 1 : -1, i - W, i + W]) if (j >= 0 && j < W * H && cls[j] > C.park && cls[j] !== C.picnic && cls[j] !== C.lawn && cls[j] !== C.cms) { next[i] = cls[j]; break } }
  cls.set(next)
}
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
