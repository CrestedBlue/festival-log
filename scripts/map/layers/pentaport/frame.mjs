// Shared frame for drawing the Pentaport venue in real coordinates (local metres, north-up).
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { CACHE, OSM_JSON } from './paths.mjs'

export { sharp }
export const OSM = JSON.parse(fs.readFileSync(OSM_JSON))

export const LAT0 = 37.406
export const LNG0 = 126.632
const M_LAT = 111_320
const M_LNG = M_LAT * Math.cos((LAT0 * Math.PI) / 180)
export const toM = ([lat, lng]) => [(lng - LNG0) * M_LNG, (lat - LAT0) * M_LAT]
export const toLL = ([e, n]) => [LAT0 + n / M_LAT, LNG0 + e / M_LNG]

// Canvas: east/north extent in metres and pixels per metre.
export const BOX = { west: -220, east: 400, south: -170, north: 340 }
export const PPM = 3
export const W = Math.round((BOX.east - BOX.west) * PPM)
export const H = Math.round((BOX.north - BOX.south) * PPM)
export const toPx = ([e, n]) => [(e - BOX.west) * PPM, (BOX.north - n) * PPM]
export const pxToM = ([x, y]) => [x / PPM + BOX.west, BOX.north - y / PPM]
export const llToPx = (ll) => toPx(toM(ll))

export const pathD = (pts, close = false) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join('') + (close ? 'Z' : '')

// Satellite tiles (Esri World Imagery, 2026-01-01 here) only for checking; cached locally, never committed.
const TILE_Z = 18
const TILE_BOX = { south: 37.4022, west: 126.628, north: 37.4098, east: 126.639 }
async function tiles() {
  const dir = path.join(CACHE, 'tiles')
  fs.mkdirSync(dir, { recursive: true })
  const N = 2 ** TILE_Z
  const tx = (lng) => ((lng + 180) / 360) * N
  const ty = (lat) => { const r = (lat * Math.PI) / 180; return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * N }
  const grid = { Z: TILE_Z, x0: Math.floor(tx(TILE_BOX.west)), x1: Math.floor(tx(TILE_BOX.east)), y0: Math.floor(ty(TILE_BOX.north)), y1: Math.floor(ty(TILE_BOX.south)) }
  const jobs = []
  for (let y = grid.y0; y <= grid.y1; y++) for (let x = grid.x0; x <= grid.x1; x++) {
    const f = path.join(dir, `${TILE_Z}_${x}_${y}.jpg`)
    if (!fs.existsSync(f)) jobs.push(fetch(`https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${TILE_Z}/${y}/${x}`).then(async (r) => { if (!r.ok) throw new Error(`tile ${x},${y}: ${r.status}`); fs.writeFileSync(f, Buffer.from(await r.arrayBuffer())) }))
  }
  await Promise.all(jobs)
  return { dir, grid }
}
/** Satellite resampled into this frame (cached PNG path). */
export async function satellite() {
  const out = path.join(CACHE, 'sat-local.png')
  if (fs.existsSync(out)) return out
  const { dir, grid } = await tiles()
  const N = 2 ** grid.Z
  const cols = grid.x1 - grid.x0 + 1, rows = grid.y1 - grid.y0 + 1
  const comps = []
  for (let y = grid.y0; y <= grid.y1; y++) for (let x = grid.x0; x <= grid.x1; x++) comps.push({ input: path.join(dir, `${grid.Z}_${x}_${y}.jpg`), left: (x - grid.x0) * 256, top: (y - grid.y0) * 256 })
  const { data, info } = await sharp({ create: { width: cols * 256, height: rows * 256, channels: 3, background: '#000' } }).composite(comps).raw().toBuffer({ resolveWithObject: true })
  const buf = Buffer.alloc(W * H * 3)
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const [lat, lng] = toLL(pxToM([x + 0.5, y + 0.5]))
    const r = (lat * Math.PI) / 180
    const gx = ((lng + 180) / 360) * N * 256 - grid.x0 * 256
    const gy = ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * N * 256 - grid.y0 * 256
    const ix = Math.min(info.width - 1, Math.max(0, Math.round(gx))), iy = Math.min(info.height - 1, Math.max(0, Math.round(gy)))
    data.copy(buf, (y * W + x) * 3, (iy * info.width + ix) * info.channels, (iy * info.width + ix) * info.channels + 3)
  }
  await sharp(buf, { raw: { width: W, height: H, channels: 3 } }).png().toFile(out)
  return out
}
