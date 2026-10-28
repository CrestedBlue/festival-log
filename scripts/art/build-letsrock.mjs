// Let's Rock Festival's title picture: the 2026 logo ("Lets Rock" in pale blue over "Festival" in yellow) on a circle of
// its green, as the logo stands on the 2026 poster. The source is the top of the official NOL ticket page's detail
// image (art-src/letsrock/nol-detail-top-2026.png), where the logo is whole on the green: the green turns transparent
// by how much greener than red and blue each pixel is, and the small "2026" between the lines is cleared, so the
// picture stays the same every year (as with the other festivals).
// Run: node scripts/art/build-letsrock.mjs
import sharp from 'sharp'

const SRC = 'art-src/letsrock/nol-detail-top-2026.png'
const OUT = 'src/assets/art/letsrock.webp'
// The logo on the 840×330 crop, and the year inside it.
const LOGO = { left: 118, top: 30, width: 610, height: 212 }
const YEAR = { left: 205 - LOGO.left, top: 110 - LOGO.top, right: 322 - LOGO.left, bottom: 142 - LOGO.top }
// Greenness ramp (green minus the larger of red and blue): the letters (pale blue, yellow) are below 0, the green
// ground about 100.
const INK = 15
const GROUND = 60
const GREEN = '#38aa4a'
// Same 290×200 frame as the other title pictures, twice the size for sharp phone screens. The circle stays left of
// the lower right corner, where the "my plan" star sits.
const SCALE = 2
const W = 290 * SCALE
const H = 200 * SCALE
const CIRCLE = { cx: 110 * SCALE, cy: 92 * SCALE, r: 90 * SCALE }
const LOGO_WIDTH = 140 * SCALE

const ramp = (value, from, to) => Math.min(1, Math.max(0, (value - from) / (to - from)))

const { data, info } = await sharp(SRC).extract(LOGO).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const keyed = Buffer.from(data)
for (let y = 0; y < info.height; y++) {
  for (let x = 0; x < info.width; x++) {
    const i = (y * info.width + x) * 4
    const inYear = x >= YEAR.left && x < YEAR.right && y >= YEAR.top && y < YEAR.bottom
    keyed[i + 3] = inYear ? 0 : Math.round(255 * (1 - ramp(keyed[i + 1] - Math.max(keyed[i], keyed[i + 2]), INK, GROUND)))
  }
}
const logo = await sharp(keyed, { raw: { width: info.width, height: info.height, channels: 4 } })
  .resize({ width: LOGO_WIDTH, kernel: 'lanczos3' })
  .png()
  .toBuffer()
const logoHeight = (await sharp(logo).metadata()).height ?? 0

const circle = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><circle cx="${CIRCLE.cx}" cy="${CIRCLE.cy}" r="${CIRCLE.r}" fill="${GREEN}"/></svg>`,
)
await sharp(circle)
  .composite([{ input: logo, left: Math.round(CIRCLE.cx - LOGO_WIDTH / 2), top: Math.round(CIRCLE.cy - logoHeight / 2) }])
  .webp({ quality: 90, alphaQuality: 100 })
  .toFile(OUT)
console.log(`wrote ${OUT}`)
