// Each festival's mark for the festival lists (the user's call, 2026-10-27: its logo instead of a calendar square):
// its title picture (src/assets/art) cut down to a square around the logo. The SVGs keep their drawing with a square
// viewBox; the images are trimmed to the logo and padded square. GMF's title picture is the app's own design, not its
// logo, so its mark (src/assets/mark/gmf.svg, the badge from its Instagram profile) is drawn by hand instead.
// Run after changing a title picture: node scripts/art/build-marks.mjs
import fs from 'node:fs'
import sharp from 'sharp'

const ART = 'src/assets/art'
const OUT = 'src/assets/mark'
// The square each SVG mark shows, in its picture's 290×200 frame: the circle logo (r 64 at 160, 76).
const SVG_MARKS = {
  pentaport: { viewBox: '96 12 128 128' },
  wonderlivet: { viewBox: '96 12 128 128' },
}
const IMAGE_MARKS = ['herorock', 'jumf', 'cdf', 'bml', 'sjf', 'letsrock']
// 44px in the list, three times over for sharp phone screens
const SIZE = 132

fs.mkdirSync(OUT, { recursive: true })
for (const [code, { viewBox }] of Object.entries(SVG_MARKS)) {
  const svg = fs.readFileSync(`${ART}/${code}.svg`, 'utf8')
  const mark = svg.replace(/viewBox="[^"]*"/, `viewBox="${viewBox}"`)
  if (!mark.includes(`viewBox="${viewBox}"`)) throw new Error(`${code}.svg has no viewBox`)
  fs.writeFileSync(`${OUT}/${code}.svg`, mark)
  console.log(`wrote ${OUT}/${code}.svg`)
}
for (const code of IMAGE_MARKS) {
  const { data, info } = await sharp(`${ART}/${code}.webp`).trim().toBuffer({ resolveWithObject: true })
  const side = Math.max(info.width, info.height)
  const padX = side - info.width
  const padY = side - info.height
  // (sharp resizes before it extends within one pipeline, so the padding goes in first on its own)
  const square = await sharp(data)
    .extend({ left: Math.floor(padX / 2), right: Math.ceil(padX / 2), top: Math.floor(padY / 2), bottom: Math.ceil(padY / 2), background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer()
  await sharp(square)
    .resize(SIZE, SIZE, { kernel: 'lanczos3' })
    .webp({ quality: 90, alphaQuality: 100 })
    .toFile(`${OUT}/${code}.webp`)
  console.log(`wrote ${OUT}/${code}.webp`)
}
