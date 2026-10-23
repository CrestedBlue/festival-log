// The official site map laid onto the real frame with the shared similarity fit, and its venue silhouette.
// Layer 1 uses the silhouette for the refresh zone that reaches past the east ring path.
//   node scripts/map/layers/pentaport/official-frame.mjs [--check]   (--check also writes an overlay on the satellite)
import fs from 'node:fs'
import path from 'node:path'
import { sharp, OSM, W, H, toPx, pxToM, llToPx, pathD, satellite } from './frame.mjs'
import { mToOfficial, CONTROL_POINTS } from './official-to-m.mjs'
import { CACHE, OFFICIAL_MAP } from './paths.mjs'

fs.mkdirSync(CACHE, { recursive: true })
const MAP_BODY = { top: 185, bottom: 1135 } // the drawing between the title and the legend
const { data, info } = await sharp(OFFICIAL_MAP).removeAlpha().raw().toBuffer({ resolveWithObject: true })
const out = Buffer.alloc(W * H * 4)
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const [u, v] = mToOfficial(pxToM([x + 0.5, y + 0.5]))
  const o = (y * W + x) * 4
  if (u < 0 || v < MAP_BODY.top || u >= info.width - 1 || v >= MAP_BODY.bottom) continue
  const i = (Math.round(v) * info.width + Math.round(u)) * 3
  out[o] = data[i]; out[o + 1] = data[i + 1]; out[o + 2] = data[i + 2]; out[o + 3] = 255
}
await sharp(out, { raw: { width: W, height: H, channels: 4 } }).png().toFile(path.join(CACHE, 'official-in-frame.png'))

// Silhouette: everything not reachable from the border through white, then opened so badges and labels drop off.
const white = new Uint8Array(W * H)
for (let i = 0; i < W * H; i++) { const o = i * 4; white[i] = out[o + 3] === 0 || (out[o] > 240 && out[o + 1] > 240 && out[o + 2] > 240) ? 1 : 0 }
const outside = new Uint8Array(W * H); const st = []
for (let x = 0; x < W; x++) st.push(x, (H - 1) * W + x)
for (let y = 0; y < H; y++) st.push(y * W, y * W + W - 1)
while (st.length) { const p = st.pop(); if (outside[p] || !white[p]) continue; outside[p] = 1; const x = p % W, y = (p - x) / W; if (x > 0) st.push(p - 1); if (x < W - 1) st.push(p + 1); if (y > 0) st.push(p - W); if (y < H - 1) st.push(p + W) }
const mask = Buffer.alloc(W * H); for (let i = 0; i < W * H; i++) mask[i] = outside[i] ? 0 : 255
const blurA = await sharp(mask, { raw: { width: W, height: H, channels: 1 } }).blur(12).extractChannel(0).raw().toBuffer()
const blurB = await sharp(Buffer.from(blurA.map((v) => (v > 200 ? 255 : 0))), { raw: { width: W, height: H, channels: 1 } }).blur(6).extractChannel(0).raw().toBuffer()
fs.writeFileSync(path.join(CACHE, 'silhouette.bin'), Buffer.from(blurB.map((v) => (v > 60 ? 255 : 0))))

if (process.argv.includes('--check')) { // official map at 55 % over the satellite, with OSM paths and the control points
  let svg = ''
  for (const w of OSM.ways) { const t = w.tags || {}; if (!(t.highway && !/motorway|secondary/.test(t.highway)) && t.leisure !== 'garden' && t.amenity !== 'parking') continue; svg += `<path d="${pathD(w.pts.map(llToPx))}" fill="none" stroke="#ff1744" stroke-width="3"/>` }
  for (const c of CONTROL_POINTS) { const [x, y] = toPx(c.m); svg += `<circle cx="${x}" cy="${y}" r="7" fill="#ffea00" stroke="#000" stroke-width="2"/>` }
  const blend = await sharp(await satellite()).composite([{ input: await sharp(out, { raw: { width: W, height: H, channels: 4 } }).linear([1, 1, 1, 0.55], [0, 0, 0, 0]).png().toBuffer() }, { input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${svg}</svg>`) }]).png().toBuffer()
  await sharp(blend).resize(1240).jpeg({ quality: 82 }).toFile(path.join(CACHE, 'check-official-on-satellite.jpg'))
}
console.log('official map in frame + silhouette →', path.relative(process.cwd(), CACHE))
