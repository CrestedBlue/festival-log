// Layer 1 (ground): every face between real paths gets one zone; a face is divided only by a single split line;
// the area behind the stages is one paved area; paths, edge band and stage pads are one grey shape.
//   node scripts/map/layers/pentaport/layer1.mjs   (needs official-frame.mjs first; DEBUG_FACES=1 [DEBUG_CROP=x,y,w,h] dumps the faces)
import fs from 'node:fs'
import path from 'node:path'
import { sharp, OSM, W, H, PPM, BOX, toM, toPx, pxToM, llToPx, pathD, toLL } from './frame.mjs'
import { CLASSES, barrierSvg, labelFaces } from './faces.mjs'
import { trace, curve } from './vector.mjs'
import { officialToM, mToOfficial } from './official-to-m.mjs'
import { OUT, CACHE } from './paths.mjs'

const C = Object.fromEntries(CLASSES.map(([n], i) => [n, i]))
const colour = Object.fromEntries(CLASSES.map(([n, c]) => [n, c]))
const PATH_WIDTH = { service: 8, footway: 6, cycleway: 4, steps: 4, pedestrian: 6, track: 4 }
const EDGE_BAND_M = 8
const SNAP_M = 5 // a path end this close to another path is joined to it
const SLIVER_M2 = 1000 // faces smaller than this between paths are paved, not a zone of their own
const isPath = (t) => t.highway && !/motorway|secondary|residential/.test(t.highway)

// Split lines in local metres, drawn along the earlier zone borders. Both ends run on until they meet a path.
const SPLITS = {
  monster: [[128, -33], [124, -25], [117, -17], [109, -10], [101, -3], [94, 4], [87, 12], [84, 20], [83, 30], [85, 40], [91, 48], [100, 52], [110, 50], [130, 47], [150, 47.3], [165, 50], [180, 54.5], [192, 60.5], [198, 64]],
  kbLawn: [[-80, 47.5], [-70, 47.8], [-50, 49], [-20, 49], [0, 48], [10, 46.5], [25, 44], [40, 41], [50, 38.5], [60, 36], [64, 34.5]],
  kbPitWest: [[-72, 10], [-70, 5], [-65, -12], [-58, -21], [-50, -24]], // to the stage's north-west corner
  kbPitSouth: [[26, -30.3], [44, -30.5]], // stage's north-east corner → path
}
// Festival walkways the official map draws in the north tree rows (not in OSM), an H: two legs from the ring path
// to the outer path, and a crossbar between them only. They split the grove | picnic zone + artist MD lawn | official MD
// lawn. Official-map pixels, converted with the shared similarity fit; legs first so the crossbar stops at them.
const WALKWAY_WIDTH_M = 5
const WALKWAYS = [
  { name: 'leftLeg', official: [[350, 915], [348, 950], [345, 990], [340, 1030]], reach: 40 }, // grove | picnic, artist MD
  { name: 'rightLeg', official: [[540, 915], [540, 950], [545, 990], [550, 1040]], reach: 40 }, // through the inner GATE
  { name: 'crossbar', official: [[360, 990], [440, 989], [515, 988]] }, // picnic | artist MD
]
// One point inside each (split) face → its zone.
const SEEDS = [
  [[-20, 185], 'asphalt'], [[135, 172], 'fnb'], [[182, 117], 'fnb'], [[220, 142], 'standing'],
  [[34, 212], 'lawn'], [[67, 222], 'lawn'], [[63, 154], 'lawn'], [[272, 86], 'lawn'], [[150, 285], 'lawn'], [[110, 109], 'picnic'],
  [[-94, 98], 'path'], // west tree strip: booth walkway
  [[-1, 79], 'picnic'], [[-1, 30], 'standing'], // KB lawn
  [[155, 70], 'picnic'], [[155, 20], 'standing'], [[95, 20], 'standing'], [[80, 0], 'picnic'], [[92, 62], 'picnic'], // MONSTER lawn
  [[159, 229], 'picnic'], [[226, 228], 'forest'], [[159, 272], 'lawn'], [[93, 230], 'lawn'], // north tree rows: picnic | grove | artist MD lawn | strip west of the picnic zone
  [[0, 0], 'kbPit'],
  // behind the stages: one paved area (KB pad, MONSTER pad, the wood between them, leftovers beside the KB pad)
  [[-14, -52], 'path'], [[151, -71], 'path'], [[77, -64], 'path'], [[-80, -20], 'path'], [[36, -34], 'path'],
]

const stage = OSM.ways.find((w) => w.tags?.leisure === 'bandstand')
const stageLine = `<path d="${pathD(stage.pts.map(llToPx), true)}" fill="none" stroke="#000" stroke-width="4"/>`

// Run each split line's ends on until they reach a barrier (path, circle edge, stage).
const { data: plain } = await sharp(Buffer.from(barrierSvg(stageLine))).greyscale().raw().toBuffer({ resolveWithObject: true })
const isBarrier = ([e, n]) => { const [x, y] = toPx([e, n]); const xi = Math.round(x), yi = Math.round(y); return xi >= 0 && yi >= 0 && xi < W && yi < H && plain[yi * W + xi] < 128 }
// `cross` lets an end go over the first line it meets (the circle's edge) and stop at the next (the road around it).
function runOn(line, cross = false, reach = 25) {
  const ext = (a, b, through) => { const len = Math.hypot(b[0] - a[0], b[1] - a[1]); const d = [(b[0] - a[0]) / len, (b[1] - a[1]) / len]
    let crossed = !through, inside = false
    for (let t = 0; t <= reach; t += 0.2) { const p = [b[0] + d[0] * t, b[1] + d[1] * t]; const hit = isBarrier(p)
      if (!crossed) { if (hit) inside = true; else if (inside) crossed = true; continue }
      if (hit) return [b[0] + d[0] * (t + 0.6), b[1] + d[1] * (t + 0.6)] }
    throw new Error(`split line end ${b} meets no path within ${reach} m`) }
  return [ext(line[1], line[0], false), ...line, ext(line[line.length - 2], line[line.length - 1], cross)]
}
const splitLines = Object.fromEntries(Object.entries(SPLITS).map(([k, l]) => [k, runOn(l, k === 'monster')]))
// Walkways run on to the paths at both ends; each later one stops at the ones before it.
const walkways = {}
for (const wk of WALKWAYS) {
  walkways[wk.name] = { line: runOn(wk.official.map(officialToM), false, wk.reach) }
  const lineSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><path d="${pathD(walkways[wk.name].line.map(toPx))}" fill="none" stroke="#000" stroke-width="4"/></svg>`
  const mask = await sharp(Buffer.from(lineSvg)).ensureAlpha().extractChannel(3).raw().toBuffer()
  for (let i = 0; i < W * H; i++) if (mask[i] > 127) plain[i] = 0 // later walkways stop at this one
}
const splitSvg = [...Object.values(splitLines), ...Object.values(walkways).map((w) => w.line)].map((l) => `<path d="${pathD(l.map(toPx))}" fill="none" stroke="#000" stroke-width="4"/>`).join('')
const { lab, count } = await labelFaces(stageLine + splitSvg)
const at = (p) => { const [x, y] = toPx(p); return lab[Math.round(y) * W + Math.round(x)] }
if (process.env.DEBUG_FACES) {
  const rgb = Buffer.alloc(W * H * 3); const hue = (f) => [(f * 97) % 200 + 40, (f * 57) % 200 + 40, (f * 151) % 200 + 40]
  for (let i = 0; i < W * H; i++) rgb.set(lab[i] <= 0 ? [0, 0, 0] : hue(lab[i]), i * 3)
  const dots = SEEDS.map(([p, z]) => { const [x, y] = toPx(p); return `<circle cx="${x}" cy="${y}" r="6" fill="#fff" stroke="#000" stroke-width="2"/><text x="${x + 8}" y="${y + 6}" font-size="20" font-family="Arial" font-weight="700" fill="#fff" stroke="#000" stroke-width="3" paint-order="stroke">${z}</text>` }).join('')
  const lines = [...Object.values(splitLines), ...Object.values(walkways).map((w) => w.line)].map((l) => `<path d="${pathD(l.map(toPx))}" fill="none" stroke="#f00" stroke-width="3"/>`).join('')
  const buf = await sharp(rgb, { raw: { width: W, height: H, channels: 3 } }).composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${lines}${dots}</svg>`) }]).png().toBuffer()
  const crop = process.env.DEBUG_CROP ? Object.fromEntries(['left', 'top', 'width', 'height'].map((k, i) => [k, +process.env.DEBUG_CROP.split(',')[i]])) : { left: 300, top: 300, width: 1000, height: 1050 }
  await sharp(buf).extract(crop).toFile(path.join(CACHE, 'debug-faces.png'))
  process.exit(0)
}
const zoneOf = new Map()
for (const [p, z] of SEEDS) { const f = at(p); if (f <= 0) throw new Error(`seed ${p} sits on a line`); if (zoneOf.has(f) && zoneOf.get(f) !== z) throw new Error(`seed ${p} (${z}) shares a face with ${zoneOf.get(f)}`); zoneOf.set(f, z) }

// Venue: seeded faces + the refresh zone beyond the east ring (official silhouette), grown over the boundary paths.
const sil = fs.readFileSync(path.join(CACHE, 'silhouette.bin'))
const eastFace = at([330, 60])
const bulge = new Uint8Array(W * H)
const inner = Buffer.alloc(W * H)
for (let i = 0; i < W * H; i++) {
  if (zoneOf.has(lab[i])) inner[i] = 255
  else if (lab[i] === eastFace && sil[i] > 127) { const [e, n] = pxToM([i % W, Math.floor(i / W)]); if (e > 240 && n > 60 && n < 240) { inner[i] = 255; bulge[i] = 1 } }
}
const blurU8 = async (buf, sigma) => sharp(buf, { raw: { width: W, height: H, channels: 1 } }).blur(sigma).extractChannel(0).raw().toBuffer()
const venue = Buffer.from((await blurU8(Buffer.from((await blurU8(inner, 3 * PPM)).map((v) => (v > 12 ? 255 : 0))), 5 * PPM)).map((v) => (v > 127 ? 255 : 0)))

// Zones per pixel: whole faces; small faces between paths are paved; lines take the zone next to them.
const faceArea = new Map(); for (let i = 0; i < W * H; i++) if (venue[i] && lab[i] > 0) faceArea.set(lab[i], (faceArea.get(lab[i]) || 0) + 1)
const cls = new Int8Array(W * H).fill(-1)
for (let i = 0; i < W * H; i++) {
  if (!venue[i]) continue
  const f = lab[i]
  if (f > 0 && f !== eastFace && faceArea.get(f) < SLIVER_M2 * PPM * PPM) cls[i] = C.path
  else if (zoneOf.has(f)) cls[i] = C[zoneOf.get(f)]
  else if (f === eastFace) cls[i] = bulge[i] ? C.refresh : C.path // beyond the east ring: refresh zone, else verge under the edge band
  else cls[i] = -2
}
if (process.env.DEBUG_AREAS) {
  const area = new Map(), sx = new Map(), sy = new Map()
  for (let i = 0; i < W * H; i++) { if (!venue[i] || lab[i] <= 0) continue; const f = lab[i]; area.set(f, (area.get(f) || 0) + 1); sx.set(f, (sx.get(f) || 0) + (i % W)); sy.set(f, (sy.get(f) || 0) + Math.floor(i / W)) }
  for (const [f, a] of [...area].sort((x, y) => x[1] - y[1])) { const c = pxToM([sx.get(f) / a, sy.get(f) / a]).map((v) => Math.round(v)); console.log(String(f).padStart(3), String(Math.round(a / 9)).padStart(6), 'm²', 'c', c.join(','), zoneOf.get(f) || (f === eastFace ? 'east' : 'UNSEEDED')) }
  process.exit(0)
}
const q = []; for (let i = 0; i < W * H; i++) if (cls[i] >= 0) q.push(i)
for (let h = 0; h < q.length; h++) { const p = q[h], x = p % W, y = (p - x) / W
  for (const n of [x > 0 ? p - 1 : -1, x < W - 1 ? p + 1 : -1, y > 0 ? p - W : -1, y < H - 1 ? p + W : -1]) if (n >= 0 && cls[n] === -2) { cls[n] = cls[p]; q.push(n) } }

// Paths: join loose ends to the path they nearly touch, then draw all of them at real widths.
const ways = OSM.ways.filter((w) => isPath(w.tags || {})).map((w) => ({ hw: w.tags.highway, pts: w.pts.map(toM) }))
function nearestOnOthers(p, self) {
  let best = null
  for (const w of ways) { if (w === self) continue
    for (let i = 1; i < w.pts.length; i++) { const a = w.pts[i - 1], b = w.pts[i]; const dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy || 1e-9
      const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2)); const c = [a[0] + t * dx, a[1] + t * dy]; const d = Math.hypot(c[0] - p[0], c[1] - p[1])
      if (!best || d < best.d) best = { c, d } } }
  return best
}
let joined = 0
for (const w of ways) for (const end of ['start', 'end']) {
  const p = end === 'start' ? w.pts[0] : w.pts[w.pts.length - 1]; const near = nearestOnOthers(p, w)
  if (near && near.d > 0.05 && near.d < SNAP_M) { if (end === 'start') w.pts.unshift(near.c); else w.pts.push(near.c); joined++ }
}
const strokes = ways.map((w) => `<path d="${curve(w.pts.map(toPx), false)}" stroke-width="${(PATH_WIDTH[w.hw] || 5) * PPM}"/>`).join('')
  + Object.values(walkways).map((w) => `<path d="${curve(w.line.map(toPx), false)}" stroke-width="${WALKWAY_WIDTH_M * PPM}"/>`).join('')
const strokeMask = await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><g fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round">${strokes}</g></svg>`)).ensureAlpha().extractChannel(3).raw().toBuffer()
const erode = await blurU8(venue, (EDGE_BAND_M / 2) * PPM)
// Grey = paths + edge band + paved zones, closed by ~1.5 m so junctions meet without notches.
let grey = Buffer.alloc(W * H)
for (let i = 0; i < W * H; i++) if (venue[i] && (strokeMask[i] > 127 || erode[i] < 235 || cls[i] === C.path)) grey[i] = 255
grey = Buffer.from((await blurU8(grey, 1.5 * PPM)).map((v) => (v > 70 ? 255 : 0))) // close: fill notches at junctions
grey = Buffer.from((await blurU8(grey, 1.5 * PPM)).map((v) => (v > 185 ? 255 : 0)))
grey = Buffer.from((await blurU8(grey, 0.8 * PPM)).map((v) => (v > 185 ? 255 : 0))) // open: drop hooks thinner than ~1 m
grey = Buffer.from((await blurU8(grey, 0.8 * PPM)).map((v, i) => (v > 70 && venue[i] ? 255 : 0)))

// Vectors.
const toF = (buf, test) => { const m = new Float32Array(W * H); for (let i = 0; i < W * H; i++) m[i] = test(buf[i], i) ? 1 : 0; return m }
const venueD = trace(toF(venue, (v) => v > 0), { sigma: 3 })
const ORDER = ['lawn', 'forest', 'fnb', 'asphalt', 'kbPit', 'standing', 'picnic', 'refresh']
const LABEL = { lawn: '잔디', forest: '숲', fnb: 'F&amp;B', asphalt: '아스팔트(물품검색·보관)', kbPit: 'KB 스탠딩', standing: '스탠딩', picnic: '피크닉존', refresh: '리프레시존' }
const zones = ORDER.map((name) => { const d = trace(toF(cls, (v) => v === C[name])); return d ? `<g id="zone-${name}" data-name="${LABEL[name]}" fill="${colour[name]}" stroke="${colour[name]}" stroke-width="0.4" stroke-linejoin="round"><path fill-rule="evenodd" d="${d}"/></g>` : '' }).join('\n')
const greyD = trace(toF(grey, (v) => v > 0), { sigma: 2, tolerance: 0.2 })
const content = `<defs><clipPath id="venue-clip"><path d="${venueD}"/></clipPath></defs>
<g id="layer1" data-name="레이어 1 · 바닥">
<path id="venue" data-name="행사장 바탕" d="${venueD}" fill="${colour.path}"/>
<g id="zones" data-name="구역" clip-path="url(#venue-clip)">${zones}</g>
<path id="paved" data-name="길·바깥 띠·무대 뒤" d="${greyD}" fill="${colour.path}" fill-rule="evenodd" clip-path="url(#venue-clip)"/>
</g>`
const VW = BOX.east - BOX.west, VH = BOX.north - BOX.south
const northUp = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${VW} ${VH}">\n${content}\n</svg>\n`
// Official map frame (similarity fit of the control points).
const toOfficial = ([X, Y]) => mToOfficial([X + BOX.west, BOX.north - Y])
const o = toOfficial([0, 0]), ox = toOfficial([1, 0]), oy = toOfficial([0, 1])
const matrix = [ox[0] - o[0], ox[1] - o[1], oy[0] - o[0], oy[1] - o[1], o[0], o[1]].map((v) => +v.toFixed(5))
const official = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350">\n<g transform="matrix(${matrix.join(' ')})">\n${content}\n</g>\n</svg>\n`
fs.mkdirSync(OUT, { recursive: true })
fs.writeFileSync(path.join(OUT, 'layer1-ground-north-up.svg'), northUp)
fs.writeFileSync(path.join(OUT, 'layer1-ground-official-view.svg'), official)
fs.writeFileSync(path.join(CACHE, 'layer1-classes.bin'), Buffer.from(cls.buffer))
// where the north-up SVGs sit on the earth (1 unit = 1 m from the north-west corner, y grows southward)
const [south, west] = toLL([BOX.west, BOX.south]), [north, east] = toLL([BOX.east, BOX.north])
fs.writeFileSync(path.join(OUT, 'north-up-bounds.json'), `${JSON.stringify({ size: [W, H], pxPerMeter: PPM, svgUnits: '1 unit = 1 m, origin at the north-west corner of bounds, y grows southward', bounds: [[+south.toFixed(6), +west.toFixed(6)], [+north.toFixed(6), +east.toFixed(6)]], colours: Object.fromEntries(CLASSES.map(([n, c]) => [n, c])) }, null, 2)}\n`)
const areas = Object.fromEntries(CLASSES.map(([n], k) => [n, 0])); for (let i = 0; i < W * H; i++) if (cls[i] >= 0) areas[CLASSES[cls[i]][0]] += 1 / (PPM * PPM)
console.log('faces', count, 'path ends joined', joined, 'split ends', Object.fromEntries(Object.entries(splitLines).map(([k, l]) => [k, [l[0], l[l.length - 1]].map((p) => p.map((v) => +v.toFixed(1)))])))
console.log('areas m²', Object.fromEntries(Object.entries(areas).map(([k, v]) => [k, Math.round(v)])))
