// Check images: layer SVGs stacked onto white. Only ever written to the cache — the layers themselves stay separate.
import path from 'node:path'
import sharp from 'sharp'

/** PNG buffer of the files (in OUT, bottom first) rendered at `density` and stacked. */
export async function stack(OUT, files, density) {
  const [base, ...rest] = await Promise.all(files.map((f) => sharp(path.join(OUT, f), { density }).png().toBuffer()))
  return sharp(await sharp(base).flatten({ background: '#ffffff' }).png().toBuffer()).composite(rest.map((input) => ({ input }))).png().toBuffer()
}
