// Check images only (cache): the three layers stacked, official view next to the official map, north-up, and the big
// area map with the small map on top.
// The layers themselves stay separate files — these stacks are never results.
//   node scripts/map/layers/pentaport/preview.mjs
import path from 'node:path'
import { sharp, BOX, bigFrame } from './frame.mjs'
import { OUT, CACHE, OFFICIAL_MAP } from './paths.mjs'
import { stack } from '../lib/preview.mjs'

const official = await stack(OUT, ['layer1-ground-official-view.svg', 'layer2-operations-official-view.svg', 'layer3-pins-official-view.svg'], 144)
await sharp(official).toFile(path.join(CACHE, 'preview-official-view@2x.png'))
const body = { left: 0, top: 190, width: 1080, height: 940 }
const small = await sharp(official).resize(1080).extract(body).png().toBuffer()
await sharp({ create: { width: 2180, height: 940, channels: 3, background: '#fff' } })
  .composite([{ input: await sharp(OFFICIAL_MAP).extract(body).png().toBuffer(), left: 0, top: 0 }, { input: small, left: 1100, top: 0 }])
  .jpeg({ quality: 88 }).toFile(path.join(CACHE, 'preview-vs-official.jpg'))
const northUp = await stack(OUT, ['layer1-ground-north-up.svg', 'layer2-operations-north-up.svg', 'layer3-pins-north-up.svg'], 72)
await sharp(northUp).resize(1240).jpeg({ quality: 86 }).toFile(path.join(CACHE, 'preview-north-up.jpg'))
console.log('previews →', path.relative(process.cwd(), CACHE))
// The big area map with the small map's layers on top, as the app shows them (3 px per metre).
const PX = 3, big = bigFrame.BOX
const ground = await sharp(path.join(OUT, 'big-layer1-ground-north-up.svg'), { density: 72 * PX / bigFrame.PPM }).png().toBuffer()
const smallLayers = await Promise.all(['layer2-operations-north-up.svg', 'layer3-pins-north-up.svg'].map((f) => sharp(path.join(OUT, f), { density: 72 }).png().toBuffer()))
const smallGround = await sharp(path.join(OUT, 'layer1-ground-north-up.svg'), { density: 72 }).png().toBuffer()
const at = { left: Math.round((BOX.west - big.west) * PX), top: Math.round((big.north - BOX.north) * PX) }
const area = await sharp(ground).composite([smallGround, ...smallLayers].map((input) => ({ input, ...at }))).png().toBuffer()
await sharp(area).toFile(path.join(CACHE, 'preview-big@3x.png'))
await sharp(area).resize(1400).jpeg({ quality: 86 }).toFile(path.join(CACHE, 'preview-big.jpg'))
