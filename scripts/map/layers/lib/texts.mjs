// Text widths as rendered (librsvg ignores textLength), so label, flag and sign boxes fit their words.
import sharp from 'sharp'

async function measure(SP, text, size, font) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.ceil(size * text.length * 1.6 + 40)}" height="${Math.ceil(size * 2)}"><text x="10" y="${size * 1.3}" font-family="${SP.FONTS[font]}" font-weight="900" font-size="${size}" fill="#000">${text}</text></svg>`
  const { info } = await sharp(Buffer.from(svg), { density: 288 }).trim().toBuffer({ resolveWithObject: true })
  return info.width / 4 // density 288 = 4× the 72 dpi user units
}
/** Measure every label, flag and sign text of the objects (and `extra` [text, size, font]) into SP.MEASURED. */
export async function measureTexts(SP, GROUPS, extra = []) {
  const wanted = [...extra]
  for (const grp of GROUPS) for (const it of grp.items) {
    if (it.kind === 'label') { const size = it.args[1]?.size ?? 13; for (const [t, , f] of it.args[0]) wanted.push([t, size, f]) }
    if (it.kind === 'flag') wanted.push([it.args[0], it.args[2]?.size ?? 13, 'kr'])
    if (it.kind === 'sign') wanted.push([it.args[0], it.args[2]?.size ?? 11, 'en'])
  }
  for (const [t, size, f] of wanted) SP.MEASURED.set(SP.textKey(t, size, f), await measure(SP, t, size, f))
}
