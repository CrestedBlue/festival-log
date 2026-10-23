// Layer 2 (operational objects): flat sprites (style B) at the official positions, as SVG in the official frame and
// north-up (label positions from layout-north-up.mjs). Positions: objects.mjs; drawings: sprites.mjs.
//   node scripts/map/layers/pentaport/layer2.mjs
import fs from 'node:fs'
import path from 'node:path'
import { sharp, BOX } from './frame.mjs'
import * as SP from './sprites.mjs'
import { GROUPS } from './objects.mjs'
import { centreOffset, toNorthUp, PX_TO_M } from './geometry.mjs'
import { OUT, CACHE } from './paths.mjs'

const add = (p, q, k = 1) => [p[0] + q[0] * k, p[1] + q[1] * k]
// Label positions re-laid-out for the north-up map, keyed group:index; centre in frame units.
const LAYOUT_FILE = path.join(CACHE, 'labels-northup.json')
const NORTH_UP_LAYOUT = fs.existsSync(LAYOUT_FILE) ? JSON.parse(fs.readFileSync(LAYOUT_FILE)) : {}
GROUPS.forEach((g) => g.items.forEach((it, i) => { it.layoutKey = `${g.id}:${i}` }))
const byId = new Map(GROUPS.flatMap((g) => g.items).filter((it) => it.id).map((it) => [it.id, it]))
const frames = {
  official: { place: (it) => it.s, scale: 1, pos: (s) => s },
  northUp: {
    scale: PX_TO_M, pos: toNorthUp,
    place(it) {
      if (it.layoutKey && NORTH_UP_LAYOUT[it.layoutKey]) return add(NORTH_UP_LAYOUT[it.layoutKey], centreOffset(it), -PX_TO_M) // re-laid-out for north-up
      const c = add(it.s, centreOffset(it))
      if (it.of) { // keep the on-screen offset from the thing it names
        const parent = byId.get(it.of), pc = add(parent.s, centreOffset(parent))
        return add(add(toNorthUp(pc), [c[0] - pc[0], c[1] - pc[1]], PX_TO_M), centreOffset(it), -PX_TO_M)
      }
      return add(toNorthUp(c), centreOffset(it), -PX_TO_M) // by the visual centre: anchors point the other way once north is up
    },
  },
}
const esc = (t) => t.replace(/&(?!amp;)/g, '&amp;')
// Measure every label/flag text as rendered, so boxes fit the words (librsvg ignores textLength).
async function measure(text, size, font) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.ceil(size * text.length * 1.6 + 40)}" height="${Math.ceil(size * 2)}"><text x="10" y="${size * 1.3}" font-family="${SP.FONTS[font]}" font-weight="900" font-size="${size}" fill="#000">${text}</text></svg>`
  const { info } = await sharp(Buffer.from(svg), { density: 288 }).trim().toBuffer({ resolveWithObject: true })
  return info.width / 4 // density 288 = 4× the 72 dpi user units
}
const wanted = [[SP.BANNER, 8.5, 'en']]
for (const grp of GROUPS) for (const it of grp.items) {
  if (it.kind === 'label') { const size = it.args[1]?.size ?? 13; for (const [t, , f] of it.args[0]) wanted.push([t, size, f]) }
  if (it.kind === 'flag') wanted.push([it.args[0], it.args[2]?.size ?? 13, 'kr'])
}
for (const [t, size, f] of wanted) SP.MEASURED.set(SP.textKey(t, size, f), await measure(t, size, f))
const sprite = (it) => { const fn = SP[it.kind]; if (!fn) throw new Error(`no sprite ${it.kind}`); return fn(...(it.args || [])) }
function route(it, f) {
  const pts = it.pts.map(f.pos), w = 3.6 * f.scale
  const [p, q] = [pts[pts.length - 2], pts[pts.length - 1]]; const ang = Math.atan2(q[1] - p[1], q[0] - p[0]), L = 11 * f.scale
  const tip = [q[0] + Math.cos(ang) * L * 0.6, q[1] + Math.sin(ang) * L * 0.6], l = [q[0] + Math.cos(ang + 2.5) * L, q[1] + Math.sin(ang + 2.5) * L], r = [q[0] + Math.cos(ang - 2.5) * L, q[1] + Math.sin(ang - 2.5) * L]
  return `<path d="M${pts.map((p) => p.map((v) => v.toFixed(2)).join(',')).join('L')}" fill="none" stroke="${it.colour}" stroke-width="${w}" stroke-dasharray="${6 * f.scale} ${5 * f.scale}" stroke-linecap="round" stroke-linejoin="round"/>`
    + `<path d="M${tip.join(',')}L${l.join(',')}L${r.join(',')}Z" fill="${it.colour}"/>`
}
function build(f) {
  return GROUPS.map((grp) => {
    const items = grp.items.map((it) => ({ it, at: it.kind === 'route' ? null : f.place(it) }))
      .sort((p, q) => (p.at && q.at ? p.at[1] - q.at[1] : 0))
    const body = items.map(({ it, at }) => it.kind === 'route' ? route(it, f)
      : `<g${it.tag ? ` data-name="${esc(it.tag)}"` : ''} transform="translate(${at[0].toFixed(2)},${at[1].toFixed(2)})${f.scale !== 1 ? ` scale(${f.scale})` : ''}">${sprite(it)}</g>`).join('')
    return `<g id="l2-${grp.id}" data-name="${grp.name}">${body}</g>`
  }).join('\n')
}
const VW = BOX.east - BOX.west, VH = BOX.north - BOX.south
const official = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350">\n<g id="layer2" data-name="레이어 2 · 운영 표시">\n${build(frames.official)}\n</g>\n</svg>\n`
const northUp = `<svg xmlns="http://www.w3.org/2000/svg" width="${VW * 3}" height="${VH * 3}" viewBox="0 0 ${VW} ${VH}">\n<g id="layer2" data-name="레이어 2 · 운영 표시">\n${build(frames.northUp)}\n</g>\n</svg>\n`
fs.mkdirSync(OUT, { recursive: true })
fs.writeFileSync(path.join(OUT, 'layer2-operations-official-view.svg'), official)
fs.writeFileSync(path.join(OUT, 'layer2-operations-north-up.svg'), northUp)
console.log('objects', GROUPS.reduce((s, g) => s + g.items.length, 0), 'svg KB', (official.length / 1024).toFixed(0))
