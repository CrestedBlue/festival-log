// A festival's official site map cut into 2× tiles with a 20 px grid (cache), for reading object, pin and walkway
// positions by eye.
//   node scripts/map/layers/lib/read-official-grid.mjs <festival>   (pentaport, gmf, …) → cache official-grid-*.jpg
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const festival = process.argv[2]
if (!festival) throw new Error('usage: read-official-grid.mjs <festival folder, e.g. pentaport>')
const { CACHE, OFFICIAL_MAP: SRC } = await import(`../${festival}/paths.mjs`)
fs.mkdirSync(CACHE, { recursive: true })
// tiles of at most 540×320 covering the whole image
const { width: IW, height: IH } = await sharp(SRC).metadata()
const TW = Math.ceil(IW / Math.ceil(IW / 540)), TH = Math.ceil(IH / Math.ceil(IH / 320))
const tiles = []
for (let y0 = 0; y0 < IH; y0 += TH) for (let x0 = 0; x0 < IW; x0 += TW) tiles.push([x0, y0])
for (const [x0, y0] of tiles) {
  const w = Math.min(TW, IW - x0), h = Math.min(TH, IH - y0), Z = 2
  let svg = ''
  for (let x = Math.ceil(x0 / 20) * 20; x <= x0 + w; x += 20) svg += `<line x1="${(x - x0) * Z}" y1="0" x2="${(x - x0) * Z}" y2="${h * Z}" stroke="${x % 100 ? '#00b8d4' : '#ff1744'}" stroke-opacity="${x % 100 ? 0.45 : 0.8}" stroke-width="1"/>`
  for (let y = Math.ceil(y0 / 20) * 20; y <= y0 + h; y += 20) svg += `<line x1="0" y1="${(y - y0) * Z}" x2="${w * Z}" y2="${(y - y0) * Z}" stroke="${y % 100 ? '#00b8d4' : '#ff1744'}" stroke-opacity="${y % 100 ? 0.45 : 0.8}" stroke-width="1"/>`
  for (let x = Math.ceil(x0 / 100) * 100; x <= x0 + w; x += 100) for (let y = Math.ceil(y0 / 100) * 100; y <= y0 + h; y += 100) svg += `<text x="${(x - x0) * Z + 2}" y="${(y - y0) * Z + 13}" font-size="13" font-weight="700" font-family="Arial" fill="#fff" stroke="#000" stroke-width="3" paint-order="stroke">${x},${y}</text>`
  const b = await sharp(SRC).extract({ left: x0, top: y0, width: w, height: h }).resize(w * Z, h * Z).png().toBuffer()
  await sharp(b).composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w * Z}" height="${h * Z}">${svg}</svg>`) }]).jpeg({ quality: 86 }).toFile(path.join(CACHE, `official-grid-${x0}-${y0}.jpg`))
}
console.log('ok')
