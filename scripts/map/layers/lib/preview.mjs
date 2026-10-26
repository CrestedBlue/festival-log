// Check images: layer SVGs stacked onto white. Only ever written to the cache — the layers themselves stay separate.
import path from 'node:path'
import sharp from 'sharp'

/** PNG buffer of the files (in OUT, bottom first) rendered at `density` and stacked. */
export async function stack(OUT, files, density) {
  const [base, ...rest] = await Promise.all(files.map((f) => sharp(path.join(OUT, f), { density }).png().toBuffer()))
  return sharp(await sharp(base).flatten({ background: '#ffffff' }).png().toBuffer()).composite(rest.map((input) => ({ input }))).png().toBuffer()
}

/** The big area map with the small map's layers on top, as the app shows them (3 px per metre) → cache preview-big. */
export async function bigPreview({ OUT, CACHE, bigFrame, smallBox, small = ['layer1-ground-north-up.svg', 'layer2-operations-north-up.svg', 'layer3-pins-north-up.svg'] }) {
  const PX = 3, big = bigFrame.BOX
  const ground = await sharp(path.join(OUT, 'big-layer1-ground-north-up.svg'), { density: (72 * PX) / bigFrame.PPM }).png().toBuffer()
  const layers = await Promise.all(small.map((f) => sharp(path.join(OUT, f), { density: 72 }).png().toBuffer()))
  const at = { left: Math.round((smallBox.west - big.west) * PX), top: Math.round((big.north - smallBox.north) * PX) }
  const area = await sharp(ground).composite(layers.map((input) => ({ input, ...at }))).png().toBuffer()
  await sharp(area).toFile(path.join(CACHE, 'preview-big@3x.png'))
  await sharp(area).resize(1400).jpeg({ quality: 86 }).toFile(path.join(CACHE, 'preview-big.jpg'))
}
