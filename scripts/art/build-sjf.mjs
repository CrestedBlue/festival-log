// Seoul Jazz Festival's title picture: the festival's pink wordmark from its official site (art-src/sjf/wordmark-2026.png,
// "SEOUL JAZZ FESTIVAL 2026" on one line, transparent) stacked into three lines — SEOUL, JAZZ, FESTIVAL — on a circle of
// the 2026 timetable's warm grey. The year is left out, so the picture stays the same every year (as with the others).
// Run: node scripts/art/build-sjf.mjs
import sharp from 'sharp'

const SRC = 'art-src/sjf/wordmark-2026.png'
const OUT = 'src/assets/art/sjf.webp'
// The words on the 2000×384 wordmark (the letters run from y 103 to 282).
const WORDS = [
  { left: 52, top: 100, width: 445, height: 186 },
  { left: 532, top: 100, width: 322, height: 186 },
  { left: 892, top: 100, width: 640, height: 186 },
]
const LINE_GAP = 26
const GREY = '#a6a69a'
// Same 290×200 frame as the other title pictures, twice the size for sharp phone screens. The circle stays left of
// the lower right corner, where the "my plan" star sits.
const SCALE = 2
const W = 290 * SCALE
const H = 200 * SCALE
const CIRCLE = { cx: 110 * SCALE, cy: 92 * SCALE, r: 90 * SCALE }
const LOGO_WIDTH = 120 * SCALE

// (sharp trims before it extracts within one pipeline, so each word is cut out first and trimmed on its own)
const words = await Promise.all(
  WORDS.map(async (box) => sharp(await sharp(SRC).extract(box).png().toBuffer()).trim().png().toBuffer({ resolveWithObject: true })),
)
const width = Math.max(...words.map((w) => w.info.width))
const height = words.reduce((sum, w) => sum + w.info.height, 0) + LINE_GAP * (words.length - 1)
let top = 0
const stacked = await sharp({ create: { width, height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .composite(
    words.map((w) => {
      const layer = { input: w.data, left: Math.round((width - w.info.width) / 2), top }
      top += w.info.height + LINE_GAP
      return layer
    }),
  )
  .png()
  .toBuffer()
const logo = await sharp(stacked).resize({ width: LOGO_WIDTH, kernel: 'lanczos3' }).png().toBuffer()
const logoHeight = (await sharp(logo).metadata()).height ?? 0

const circle = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><circle cx="${CIRCLE.cx}" cy="${CIRCLE.cy}" r="${CIRCLE.r}" fill="${GREY}"/></svg>`,
)
await sharp(circle)
  .composite([{ input: logo, left: Math.round(CIRCLE.cx - LOGO_WIDTH / 2), top: Math.round(CIRCLE.cy - logoHeight / 2) }])
  .webp({ quality: 90, alphaQuality: 100 })
  .toFile(OUT)
console.log(`wrote ${OUT}`)
