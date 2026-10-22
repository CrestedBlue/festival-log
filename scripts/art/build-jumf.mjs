// JUMF's title picture: the festival logo (white sound bars and "JUMF 2026") on a blue guitar pick, as on its
// Instagram profile (@jumfesta). The logo is the official one from jumf.co.kr (art-src/jumf/official-logo.png,
// white on transparent); the small "Jeonju Ultimate Music Festival" line under it is cut off, it would be unreadable.
// Run: node scripts/art/build-jumf.mjs
import sharp from 'sharp'

const SRC = 'art-src/jumf/official-logo.png'
const OUT = 'src/assets/art/jumf.webp'
// Bars and "JUMF 2026" only (the 397×201 logo, without its bottom line).
const CROP = { left: 0, top: 0, width: 397, height: 152 }
// The festival's blue (its timetable background).
const PICK_COLOR = '#007def'
// Same 290×200 frame as the other title pictures, twice the size for sharp phone screens. The pick stays left of the
// lower right corner, where the "my plan" star sits.
const SCALE = 2
const W = 290 * SCALE
const H = 200 * SCALE
const PICK = 'M110 192C72 154 34 104 34 58 34 26 64 8 110 8s76 18 76 50c0 46-38 96-76 134Z'
const LOGO_WIDTH = 148 * SCALE
const LOGO_CENTER = { x: 110 * SCALE, y: 74 * SCALE }

const logo = await sharp(SRC).extract(CROP).resize({ width: LOGO_WIDTH, kernel: 'lanczos3' }).png().toBuffer()
const logoHeight = (await sharp(logo).metadata()).height ?? 0
const pick = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 290 200"><path d="${PICK}" fill="${PICK_COLOR}"/></svg>`,
)
await sharp(pick)
  .composite([{ input: logo, left: Math.round(LOGO_CENTER.x - LOGO_WIDTH / 2), top: Math.round(LOGO_CENTER.y - logoHeight / 2) }])
  .webp({ quality: 90, alphaQuality: 100 })
  .toFile(OUT)
console.log(`wrote ${OUT}`)
