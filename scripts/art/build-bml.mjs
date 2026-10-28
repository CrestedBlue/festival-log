// Beautiful Mint Life's title picture: the festival name as the 2026 notice pages set it ("Beautiful" over
// "Mint Life", green serif) with the green butterfly from the same page, on a pale mint circle. The source is the
// official notice page at full size (art-src/bml/notice-2026-01.jpg, mintpaper.co.kr BML2026 timetable post): its
// cream paper turns transparent by how much greener than red and blue each pixel is. The year after "Mint Life" is
// left out, so the picture stays the same every year (as with the other festivals).
// Run: node scripts/art/build-bml.mjs
import sharp from 'sharp'

const SRC = 'art-src/bml/notice-2026-01.jpg'
const OUT = 'src/assets/art/bml.webp'
// On the 2250×2812 page: the two lines of the name ("2026" cut off the second) and the butterfly at the left edge
// (cut before the rule it sits on).
const BEAUTIFUL = { left: 915, top: 135, width: 430, height: 105 }
const MINT_LIFE = { left: 778, top: 243, width: 435, height: 105 }
const BUTTERFLY = { left: 115, top: 400, width: 190, height: 215 }
const LINE_GAP = 4
// Greenness ramp (green minus the larger of red and blue): the paper and its dark specks are clear, the ink solid.
const PAPER = 12
const INK = 45
const CIRCLE_FILL = '#dcefe2'
// Same 290×200 frame as the other title pictures, twice the size for sharp phone screens. The circle stays left of
// the lower right corner, where the "my plan" star sits.
const SCALE = 2
const W = 290 * SCALE
const H = 200 * SCALE
const CIRCLE = { cx: 110 * SCALE, cy: 92 * SCALE, r: 90 * SCALE }
const NAME_WIDTH = 132 * SCALE
const BUTTERFLY_WIDTH = 34 * SCALE

const ramp = (value, from, to) => Math.min(1, Math.max(0, (value - from) / (to - from)))

async function keyed(box) {
  const { data, info } = await sharp(SRC).extract(box).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const out = Buffer.from(data)
  for (let i = 0; i < out.length; i += 4) out[i + 3] = Math.round(255 * ramp(out[i + 1] - Math.max(out[i], out[i + 2]), PAPER, INK))
  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer()
}

const [beautiful, mintLife, butterfly] = await Promise.all([keyed(BEAUTIFUL), keyed(MINT_LIFE), keyed(BUTTERFLY)])
const nameWidth = Math.max(BEAUTIFUL.width, MINT_LIFE.width)
const name = await sharp({ create: { width: nameWidth, height: BEAUTIFUL.height + LINE_GAP + MINT_LIFE.height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .composite([
    { input: beautiful, left: Math.round((nameWidth - BEAUTIFUL.width) / 2), top: 0 },
    { input: mintLife, left: Math.round((nameWidth - MINT_LIFE.width) / 2), top: BEAUTIFUL.height + LINE_GAP },
  ])
  .png()
  .toBuffer()
const nameImage = await sharp(name).trim().resize({ width: NAME_WIDTH, kernel: 'lanczos3' }).png().toBuffer()
const nameHeight = (await sharp(nameImage).metadata()).height ?? 0
const butterflyImage = await sharp(butterfly).trim().resize({ width: BUTTERFLY_WIDTH, kernel: 'lanczos3' }).png().toBuffer()
const butterflyHeight = (await sharp(butterflyImage).metadata()).height ?? 0

const nameTop = Math.round(CIRCLE.cy - nameHeight / 2 + 12 * SCALE)
const circle = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><circle cx="${CIRCLE.cx}" cy="${CIRCLE.cy}" r="${CIRCLE.r}" fill="${CIRCLE_FILL}"/></svg>`,
)
await sharp(circle)
  .composite([
    { input: butterflyImage, left: Math.round(CIRCLE.cx - BUTTERFLY_WIDTH / 2), top: nameTop - butterflyHeight - 6 * SCALE },
    { input: nameImage, left: Math.round(CIRCLE.cx - NAME_WIDTH / 2), top: nameTop },
  ])
  .webp({ quality: 90, alphaQuality: 100 })
  .toFile(OUT)
console.log(`wrote ${OUT}`)
