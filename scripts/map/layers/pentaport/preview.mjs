// Check images only (cache): the three layers stacked, official view next to the official map, and north-up.
// The layers themselves stay separate files — these stacks are never results.
//   node scripts/map/layers/pentaport/preview.mjs
import path from 'node:path'
import { sharp } from './frame.mjs'
import { OUT, CACHE, OFFICIAL_MAP } from './paths.mjs'

const stack = async (files, density) => {
  const [base, ...rest] = await Promise.all(files.map((f) => sharp(path.join(OUT, f), { density }).png().toBuffer()))
  return sharp(await sharp(base).flatten({ background: '#ffffff' }).png().toBuffer()).composite(rest.map((input) => ({ input }))).png().toBuffer()
}
const official = await stack(['layer1-ground-official-view.svg', 'layer2-operations-official-view.svg', 'layer3-pins-official-view.svg'], 144)
await sharp(official).toFile(path.join(CACHE, 'preview-official-view@2x.png'))
const body = { left: 0, top: 190, width: 1080, height: 940 }
const small = await sharp(official).resize(1080).extract(body).png().toBuffer()
await sharp({ create: { width: 2180, height: 940, channels: 3, background: '#fff' } })
  .composite([{ input: await sharp(OFFICIAL_MAP).extract(body).png().toBuffer(), left: 0, top: 0 }, { input: small, left: 1100, top: 0 }])
  .jpeg({ quality: 88 }).toFile(path.join(CACHE, 'preview-vs-official.jpg'))
const northUp = await stack(['layer1-ground-north-up.svg', 'layer2-operations-north-up.svg', 'layer3-pins-north-up.svg'], 72)
await sharp(northUp).resize(1240).jpeg({ quality: 86 }).toFile(path.join(CACHE, 'preview-north-up.jpg'))
console.log('previews →', path.relative(process.cwd(), CACHE))
