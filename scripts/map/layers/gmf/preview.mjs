// Check images only (cache): the three layers stacked north-up, next to the official map, and the big area map with
// the small map on top.
// The layers themselves stay separate files — these stacks are never results.
//   node scripts/map/layers/gmf/preview.mjs
import path from 'node:path'
import { sharp, BOX, bigFrame } from './frame.mjs'
import { OUT, CACHE, OFFICIAL_MAP } from './paths.mjs'
import { stack, bigPreview } from '../lib/preview.mjs'

const northUp = await stack(OUT, ['layer1-ground-north-up.svg', 'layer2-operations-north-up.svg', 'layer3-pins-north-up.svg'], 72)
await sharp(northUp).toFile(path.join(CACHE, 'preview-north-up@3x.png'))
const H = 900
const small = await sharp(northUp).resize({ height: H }).png().toBuffer()
const { width: W } = await sharp(small).metadata()
await sharp({ create: { width: H + 20 + W, height: H, channels: 3, background: '#fff' } })
  .composite([{ input: await sharp(OFFICIAL_MAP).resize(H).png().toBuffer(), left: 0, top: 0 }, { input: small, left: H + 20, top: 0 }])
  .jpeg({ quality: 88 }).toFile(path.join(CACHE, 'preview-vs-official.jpg'))
console.log('previews →', path.relative(process.cwd(), CACHE))
await bigPreview({ OUT, CACHE, bigFrame, smallBox: BOX })
