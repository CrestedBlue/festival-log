// THE GLOW's title picture: its logo ("THEGLOW" in tall stencil letters, a four-point sparkle in the O) in white on a
// black circle, with the cyan and red fringes its 2026 posters draw round the letters (the official site's colours,
// #20fffc and #fe1c1e). The source is the official site's header logo (art-src/theglow/logo-2026.png, black on
// transparent, theglowseoul.com); the "2026" after the letters is cut off at the empty columns before it, so the
// picture stays the same every year (as with the other festivals).
// Run: node scripts/art/build-theglow.mjs
import sharp from 'sharp'

const SRC = 'art-src/theglow/logo-2026.png'
const OUT = 'src/assets/art/theglow.webp'
// "THEGLOW" alone: the year starts after the empty columns at x 623–632 of the 1000×200 logo.
const LETTERS = { left: 0, top: 0, width: 623, height: 200 }
const NIGHT = '#0d0d10'
const FRINGES = [
  { colour: [32, 255, 252], dx: 1.5 }, // cyan, to the right
  { colour: [254, 28, 30], dx: -1.5 }, // red, to the left
]
// Same 290×200 frame as the other title pictures, twice the size for sharp phone screens. The circle stays left of
// the lower right corner, where the "my plan" star sits.
const SCALE = 2
const W = 290 * SCALE
const H = 200 * SCALE
const CIRCLE = { cx: 110 * SCALE, cy: 92 * SCALE, r: 90 * SCALE }
const LOGO_WIDTH = 160 * SCALE

const { data, info } = await sharp(SRC).extract(LETTERS).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
// the letters' shape (their alpha) in one colour
const tinted = ([r, g, b]) => {
  const out = Buffer.from(data)
  for (let i = 0; i < out.length; i += 4) [out[i], out[i + 1], out[i + 2]] = [r, g, b]
  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } }).resize({ width: LOGO_WIDTH, kernel: 'lanczos3' }).png().toBuffer()
}
const white = await tinted([255, 255, 255])
const logoHeight = (await sharp(white).metadata()).height ?? 0
const left = Math.round(CIRCLE.cx - LOGO_WIDTH / 2)
const top = Math.round(CIRCLE.cy - logoHeight / 2)
const fringes = await Promise.all(FRINGES.map(async ({ colour, dx }) => ({ input: await tinted(colour), left: left + dx * SCALE, top, blend: 'screen' })))

const circle = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><circle cx="${CIRCLE.cx}" cy="${CIRCLE.cy}" r="${CIRCLE.r}" fill="${NIGHT}"/></svg>`,
)
await sharp(circle)
  .composite([...fringes, { input: white, left, top }])
  .webp({ quality: 90, alphaQuality: 100 })
  .toFile(OUT)
console.log(`wrote ${OUT}`)
