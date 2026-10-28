// Countdown Fantasy's title picture: the festival logo (white stencil "COUNTDOWN FANTASY", each line struck through
// with a neon green line) on a night-blue circle. The 100px profile picture (@countdownfantasy) is too small and draws
// an older logo, so the logo is lifted from the 2026-2027 line-up poster: art-src/cdf/poster-logo.webp is the poster's
// logo area at full size (2500px poster, x 700 and y 250 on). The night sky turns transparent; the white letters (by
// brightness) and the green lines (by how much greener they are than red and blue) stay. The "2026 ⊕ 2027" line under
// it is left out, so the picture stays the same every year (as with the other festivals).
// Run: node scripts/art/build-cdf.mjs
import sharp from 'sharp'

const SRC = 'art-src/cdf/poster-logo.webp'
const OUT = 'src/assets/art/cdf.webp'
// The two struck-through lines, the year line below them left out.
const CROP = { left: 24, top: 10, width: 1066, height: 280 }
// Brightness ramp for the white letters: the sky (up to about 90) is clear, the letters are solid.
const DARK = 95
const LIGHT = 175
// Greenness ramp (green minus the larger of red and blue) for the strike lines.
const DULL = 40
const NEON = 120
// The poster's night sky, a touch darker so the letters stand out.
const SKY = '#121a27'
// Same 290×200 frame as the other title pictures, twice the size for sharp phone screens. The circle stays left of
// the lower right corner, where the "my plan" star sits once there is a timetable.
const SCALE = 2
const W = 290 * SCALE
const H = 200 * SCALE
const CIRCLE = { cx: 110 * SCALE, cy: 92 * SCALE, r: 90 * SCALE }
const LOGO_WIDTH = 166 * SCALE

const ramp = (value, from, to) => Math.min(1, Math.max(0, (value - from) / (to - from)))

const { data, info } = await sharp(SRC).extract(CROP).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const keyed = Buffer.from(data)
for (let i = 0; i < keyed.length; i += 4) {
  const [r, g, b] = [keyed[i], keyed[i + 1], keyed[i + 2]]
  const white = ramp(0.299 * r + 0.587 * g + 0.114 * b, DARK, LIGHT) * ramp(Math.min(r, g, b), DARK - 20, LIGHT - 20)
  const green = ramp(g - Math.max(r, b), DULL, NEON)
  keyed[i + 3] = Math.round(255 * Math.max(white, green))
}
const logo = await sharp(keyed, { raw: { width: info.width, height: info.height, channels: 4 } })
  .resize({ width: LOGO_WIDTH, kernel: 'lanczos3' })
  .png()
  .toBuffer()
const logoHeight = (await sharp(logo).metadata()).height ?? 0

const circle = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><circle cx="${CIRCLE.cx}" cy="${CIRCLE.cy}" r="${CIRCLE.r}" fill="${SKY}"/></svg>`,
)
await sharp(circle)
  .composite([{ input: logo, left: Math.round(CIRCLE.cx - LOGO_WIDTH / 2), top: Math.round(CIRCLE.cy - logoHeight / 2) }])
  .webp({ quality: 90, alphaQuality: 100 })
  .toFile(OUT)
console.log(`wrote ${OUT}`)
