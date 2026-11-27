// mistletoe's title picture: the red "mis / tle / toe" lettering of the 2026 poster (201P's product page,
// 201p.me/39/?idx=399; art-src/mistletoe/poster-2026.webp) on a cream circle. Only the red stays (the pine branches,
// the white paper and the black 201P logo turn clear), and the small red lines that change every year (date and set
// times, "SINCHON 201P", "BY ROOKIES") are cleared first, so the picture stays the same every year.
// Run: node scripts/art/build-mistletoe.mjs
import sharp from 'sharp'

const SRC = 'art-src/mistletoe/poster-2026.webp'
const OUT = 'src/assets/art/mistletoe.webp'
// The three lines of lettering in the 856×1202 poster.
const CROP = { left: 40, top: 25, width: 790, height: 1125 }
// The small lines inside it (poster pixels), cleared before keying.
const CLEAR = [
  { x0: 140, y0: 550, x1: 345, y1: 665 }, // date and set times
  { x0: 615, y0: 345, x1: 815, y1: 395 }, // SINCHON 201P
  { x0: 505, y0: 750, x1: 635, y1: 830 }, // BY ROOKIES
]
// Redness ramp (red minus the larger of green and blue): paper and branches clear, the letters solid.
const DULL = 60
const RED = 140
const PAPER = '#f6efe3'
const SCALE = 2
const W = 290 * SCALE
const H = 200 * SCALE
const CIRCLE = { cx: 110 * SCALE, cy: 92 * SCALE, r: 90 * SCALE }
const LOGO_HEIGHT = 150 * SCALE

const ramp = (value, from, to) => Math.min(1, Math.max(0, (value - from) / (to - from)))

const { data, info } = await sharp(SRC).extract(CROP).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const keyed = Buffer.from(data)
for (let i = 0; i < keyed.length; i += 4) {
  const p = i / 4
  const [x, y] = [CROP.left + (p % info.width), CROP.top + Math.floor(p / info.width)]
  const cleared = CLEAR.some((b) => x >= b.x0 && x < b.x1 && y >= b.y0 && y < b.y1)
  const [r, g, b] = [keyed[i], keyed[i + 1], keyed[i + 2]]
  keyed[i + 3] = cleared ? 0 : Math.round(255 * ramp(r - Math.max(g, b), DULL, RED))
}
const logo = await sharp(keyed, { raw: { width: info.width, height: info.height, channels: 4 } })
  .resize({ height: LOGO_HEIGHT, kernel: 'lanczos3' })
  .png()
  .toBuffer()
const logoWidth = (await sharp(logo).metadata()).width ?? 0

const circle = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><circle cx="${CIRCLE.cx}" cy="${CIRCLE.cy}" r="${CIRCLE.r}" fill="${PAPER}"/></svg>`,
)
await sharp(circle)
  .composite([{ input: logo, left: Math.round(CIRCLE.cx - logoWidth / 2), top: Math.round(CIRCLE.cy - LOGO_HEIGHT / 2) }])
  .webp({ quality: 90, alphaQuality: 100 })
  .toFile(OUT)
console.log(`wrote ${OUT}`)
