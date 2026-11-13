// Check images only (cache): the KINTEX big area map (preview-big-kintex.jpg), WONDERLIVET's map with its venue map
// on the big one (preview-big.jpg), and the venue map up close with the places the catalog pins (preview-venue.jpg).
//   node scripts/map/layers/wonderlivet/preview.mjs   (after build steps)
import fs from 'node:fs'
import path from 'node:path'
import { frame, bigFrame } from './frame.mjs'
import { OUT, OUT_KINTEX, CACHE } from './paths.mjs'
import { bigPreview } from '../lib/preview.mjs'

await bigPreview({ OUT: OUT_KINTEX, CACHE, bigFrame, small: [] })
fs.renameSync(path.join(CACHE, 'preview-big.jpg'), path.join(CACHE, 'preview-big-kintex.jpg'))
await bigPreview({ OUT, CACHE, bigFrame, smallBox: frame.BOX, small: ['layer1-ground-north-up.svg'] })

const { sharp, BOX } = frame
const DENSITY = 3
const ground = await sharp(path.join(OUT, 'layer1-ground-north-up.svg'), { density: 72 * DENSITY }).png().toBuffer()
const places = JSON.parse(fs.readFileSync(path.join(CACHE, 'places.json'), 'utf8'))
const { width, height } = await sharp(ground).metadata()
const PX = width / (BOX.east - BOX.west)
const dots = Object.entries(places).map(([key, ll]) => {
  const [e, n] = frame.toM(ll), x = (e - BOX.west) * PX, y = (BOX.north - n) * PX
  return `<circle cx="${x}" cy="${y}" r="12" fill="#fff" stroke="#000" stroke-width="2"/><text x="${x + 15}" y="${y + 10}" font-size="30" font-family="Arial" font-weight="700" fill="#fff" stroke="#000" stroke-width="3" paint-order="stroke">${key}</text>`
}).join('')
await sharp(ground).flatten({ background: '#f3e9ce' }).composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${dots}</svg>`) }])
  .jpeg({ quality: 86 }).toFile(path.join(CACHE, 'preview-venue.jpg'))
console.log('preview', width, height)
