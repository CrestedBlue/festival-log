// Find the round white pin badges on the official site map (white disc inside a dark ring, ~46 px).
//   node scripts/map/layers/pentaport/pins-detect.mjs   → cache candidates.json + candidates.jpg (numbered, to check by eye)
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { CACHE, OFFICIAL_MAP as SRC } from './paths.mjs'
fs.mkdirSync(CACHE, { recursive: true })
const { data, info } = await sharp(SRC).removeAlpha().raw().toBuffer({ resolveWithObject: true })
const { width: W, height: H } = info
const white = new Uint8Array(W * H)
for (let i = 0; i < W * H; i++) white[i] = data[i * 3] > 232 && data[i * 3 + 1] > 232 && data[i * 3 + 2] > 232 ? 1 : 0
const seen = new Uint8Array(W * H), comps = []
for (let s = 0; s < W * H; s++) {
  if (!white[s] || seen[s]) continue
  const st = [s]; seen[s] = 1; let n = 0, x0 = W, x1 = 0, y0 = H, y1 = 0, sx = 0, sy = 0
  while (st.length) { const p = st.pop(); const x = p % W, y = (p - x) / W; n++; sx += x; sy += y; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y
    for (const q of [x > 0 ? p - 1 : -1, x < W - 1 ? p + 1 : -1, y > 0 ? p - W : -1, y < H - 1 ? p + W : -1]) if (q >= 0 && white[q] && !seen[q]) { seen[q] = 1; st.push(q) } }
  const bw = x1 - x0 + 1, bh = y1 - y0 + 1
  if (bw < 30 || bw > 60 || bh < 30 || bh > 60 || Math.abs(bw - bh) > 8) continue
  // the disc's outline (thin grey ring, thick shadow below) is non-white nearly all round, just outside the white area
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, r0 = Math.max(bw, bh) / 2
  let edge = 0, total = 0
  for (let a = 0; a < 360; a += 6) { total++; for (const dr of [0.5, 1.5, 2.5, 3.5]) { const x = Math.round(cx + (r0 + dr) * Math.cos((a * Math.PI) / 180)), y = Math.round(cy + (r0 + dr) * Math.sin((a * Math.PI) / 180)); if (x < 0 || y < 0 || x >= W || y >= H) continue; const o = (y * W + x) * 3; if (data[o] + data[o + 1] + data[o + 2] < 3 * 205) { edge++; break } } }
  const dark = edge
  comps.push({ cx: +cx.toFixed(1), cy: +cy.toFixed(1), d: Math.max(bw, bh), fill: +(n / (bw * bh)).toFixed(2), ring: +(dark / total).toFixed(2) })
}
const pins = comps.filter((c) => c.ring >= 0.85 && c.fill > 0.3)
fs.writeFileSync(path.join(CACHE, 'candidates.json'), JSON.stringify(pins, null, 1))
let svg = ''
pins.forEach((p, i) => { svg += `<circle cx="${p.cx}" cy="${p.cy}" r="${p.d / 2 + 4}" fill="none" stroke="#ff00ff" stroke-width="3"/><text x="${p.cx + p.d / 2 + 2}" y="${p.cy - p.d / 2 + 4}" font-size="15" font-weight="700" font-family="Arial" fill="#ff00ff" stroke="#fff" stroke-width="3" paint-order="stroke">${i}</text>` })
await sharp(SRC).composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${svg}</svg>`) }]).jpeg({ quality: 88 }).toFile(path.join(CACHE, 'candidates.jpg'))
console.log('components checked', comps.length, 'pins', pins.length, 'in map body', pins.filter((p) => p.cy < 1135).length, 'diameters', [...new Set(pins.map((p) => p.d))].sort((a, b) => a - b).join(','))
