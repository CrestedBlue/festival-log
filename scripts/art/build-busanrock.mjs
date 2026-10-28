// Busan International Rock Festival's title picture: its black wordmark from the official site (art-src/busanrock/
// logo-2026.png: "2026" over "BUSAN ROCK" over "INTERNATIONAL FESTIVAL", transparent) on a circle of the 2026
// timetable's mint sky. The year line on top is cut off, so the picture stays the same every year (as with the others).
// Run: node scripts/art/build-busanrock.mjs
import sharp from 'sharp'

const SRC = 'art-src/busanrock/logo-2026.png'
const OUT = 'src/assets/art/busanrock.webp'
// The 768×156 wordmark below its year line (which ends at y 39).
const NAME = { left: 0, top: 44, width: 768, height: 112 }
const MINT = '#a6e0d4'
// Same 290×200 frame as the other title pictures, twice the size for sharp phone screens. The circle stays left of
// the lower right corner, where the "my plan" star sits.
const SCALE = 2
const W = 290 * SCALE
const H = 200 * SCALE
const CIRCLE = { cx: 110 * SCALE, cy: 92 * SCALE, r: 90 * SCALE }
const LOGO_WIDTH = 150 * SCALE

// (sharp trims before it extracts within one pipeline, so the name is cut out first and trimmed on its own)
const name = await sharp(await sharp(SRC).extract(NAME).png().toBuffer()).trim().png().toBuffer()
const logo = await sharp(name).resize({ width: LOGO_WIDTH, kernel: 'lanczos3' }).png().toBuffer()
const logoHeight = (await sharp(logo).metadata()).height ?? 0

const circle = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><circle cx="${CIRCLE.cx}" cy="${CIRCLE.cy}" r="${CIRCLE.r}" fill="${MINT}"/></svg>`,
)
await sharp(circle)
  .composite([{ input: logo, left: Math.round(CIRCLE.cx - LOGO_WIDTH / 2), top: Math.round(CIRCLE.cy - logoHeight / 2) }])
  .webp({ quality: 90, alphaQuality: 100 })
  .toFile(OUT)
console.log(`wrote ${OUT}`)
