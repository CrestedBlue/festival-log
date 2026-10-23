// The drawing frame of one festival map: real coordinates in local metres (east, north) around an origin, a pixel
// canvas over a box of them (north-up), the festival's OSM extract, and the satellite resampled into the frame.
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { makeTracer, curve } from './vector.mjs'

export { sharp }
const M_LAT = 111_320
export const pathD = (pts, close = false) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join('') + (close ? 'Z' : '')

/**
 * lat0/lng0: origin; box: { west, east, south, north } in metres; ppm: pixels per metre; tileBox: { south, west, north,
 * east } of the satellite tiles; cache: where tiles and the resampled satellite go; osmJson: the OSM extract.
 */
export function makeFrame({ lat0, lng0, box, ppm = 3, tileBox, cache, osmJson }) {
  const OSM = JSON.parse(fs.readFileSync(osmJson))
  const M_LNG = M_LAT * Math.cos((lat0 * Math.PI) / 180)
  const toM = ([lat, lng]) => [(lng - lng0) * M_LNG, (lat - lat0) * M_LAT]
  const toLL = ([e, n]) => [lat0 + n / M_LAT, lng0 + e / M_LNG]
  const BOX = box, PPM = ppm
  const W = Math.round((BOX.east - BOX.west) * PPM)
  const H = Math.round((BOX.north - BOX.south) * PPM)
  const toPx = ([e, n]) => [(e - BOX.west) * PPM, (BOX.north - n) * PPM]
  const pxToM = ([x, y]) => [x / PPM + BOX.west, BOX.north - y / PPM]
  const llToPx = (ll) => toPx(toM(ll))

  // Satellite tiles (Esri World Imagery) only for checking; cached locally, never committed.
  const TILE_Z = 18
  async function tiles() {
    const dir = path.join(cache, 'tiles')
    fs.mkdirSync(dir, { recursive: true })
    const N = 2 ** TILE_Z
    const tx = (lng) => ((lng + 180) / 360) * N
    const ty = (lat) => { const r = (lat * Math.PI) / 180; return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * N }
    const grid = { Z: TILE_Z, x0: Math.floor(tx(tileBox.west)), x1: Math.floor(tx(tileBox.east)), y0: Math.floor(ty(tileBox.north)), y1: Math.floor(ty(tileBox.south)) }
    const jobs = []
    for (let y = grid.y0; y <= grid.y1; y++) for (let x = grid.x0; x <= grid.x1; x++) {
      const f = path.join(dir, `${TILE_Z}_${x}_${y}.jpg`)
      if (!fs.existsSync(f)) jobs.push(fetch(`https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${TILE_Z}/${y}/${x}`).then(async (r) => { if (!r.ok) throw new Error(`tile ${x},${y}: ${r.status}`); fs.writeFileSync(f, Buffer.from(await r.arrayBuffer())) }))
    }
    await Promise.all(jobs)
    return { dir, grid }
  }
  /** Satellite resampled into this frame (cached PNG path). */
  async function satellite() {
    const out = path.join(cache, 'sat-local.png')
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
  return { sharp, OSM, LAT0: lat0, LNG0: lng0, toM, toLL, BOX, PPM, W, H, toPx, pxToM, llToPx, pathD, satellite, trace: makeTracer({ W, H, PPM }), curve }
}
