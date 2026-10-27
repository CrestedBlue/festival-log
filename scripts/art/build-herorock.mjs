// Hero Rock's title picture: the festival logo (ivory "HERO" with horns, gold "INCHEON") on a black circle, as on
// its Instagram profile (@herorockfestival). The 150px profile picture is too small, so the same logo is lifted
// from the 2026 line-up poster: the dark sky turns transparent by brightness and the logo goes onto a black circle.
// Left out (the user's call, 2026-10-27: the picture stays the same every year, and the festival is not always in
// Incheon): the year above "HERO", and the "INCHEON" on the gold label, which stays as a plain gold label.
// Run: node scripts/art/build-herorock.mjs
import sharp from 'sharp'

const SRC = 'src/assets/lineups/herorock2026-1.webp'
const OUT = 'src/assets/art/herorock.webp'
// The logo on the 700×880 poster (horns to horns, "2026" down to the "INCHEON" badge).
const CROP = { left: 225, top: 22, width: 255, height: 150 }
// Brightness ramp: the sky (about 30) is clear, the logo (ivory, gold from about 150) is solid.
const DARK = 60
const LIGHT = 130
// In the crop: "2026" between the horns (cleared), the letters inside the gold label (painted the label's gold, which
// is read off the label's rows above and below them).
const YEAR = { left: 98, top: 15, right: 152, bottom: 34 }
const LABEL_TEXT = { left: 94, top: 125, right: 157, bottom: 139 }
const LABEL_EDGES = [124, 139]
// Same 290×200 frame as the other title pictures, twice the size for sharp phone screens. The circle stays left of
// the lower right corner, where the "my plan" star sits once there is a timetable.
const SCALE = 2
const W = 290 * SCALE
const H = 200 * SCALE
const CIRCLE = { cx: 110 * SCALE, cy: 92 * SCALE, r: 90 * SCALE }
const LOGO_WIDTH = 150 * SCALE

const { data, info } = await sharp(SRC).extract(CROP).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const keyed = Buffer.from(data)
for (let i = 0; i < keyed.length; i += 4) {
  const luminance = 0.299 * keyed[i] + 0.587 * keyed[i + 1] + 0.114 * keyed[i + 2]
  keyed[i + 3] = Math.round(255 * Math.min(1, Math.max(0, (luminance - DARK) / (LIGHT - DARK))))
}
const at = (x, y) => (y * info.width + x) * 4
const gold = [0, 1, 2].map((k) => {
  const samples = LABEL_EDGES.flatMap((y) => Array.from({ length: LABEL_TEXT.right - LABEL_TEXT.left }, (_, i) => keyed[at(LABEL_TEXT.left + i, y) + k]))
  return Math.round(samples.reduce((sum, v) => sum + v, 0) / samples.length)
})
const paint = (box, rgba) => {
  for (let y = box.top; y < box.bottom; y++) {
    for (let x = box.left; x < box.right; x++) rgba.forEach((v, k) => (keyed[at(x, y) + k] = v))
  }
}
paint(YEAR, [0, 0, 0, 0])
paint(LABEL_TEXT, [...gold, 255])
const logo = await sharp(keyed, { raw: { width: info.width, height: info.height, channels: 4 } })
  .resize({ width: LOGO_WIDTH, kernel: 'lanczos3' })
  .png()
  .toBuffer()
const logoHeight = (await sharp(logo).metadata()).height ?? 0

const circle = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><circle cx="${CIRCLE.cx}" cy="${CIRCLE.cy}" r="${CIRCLE.r}" fill="#0e0c10"/></svg>`,
)
await sharp(circle)
  .composite([{ input: logo, left: Math.round(CIRCLE.cx - LOGO_WIDTH / 2), top: Math.round(CIRCLE.cy - logoHeight / 2) }])
  .webp({ quality: 90, alphaQuality: 100 })
  .toFile(OUT)
console.log(`wrote ${OUT}`)
