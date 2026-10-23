// Layer 2 (operational objects): the festival's objects as flat sprites, written as SVG north-up (1 unit = 1 m; label
// positions from the north-up layout) and, when the festival has one, in the official map's own frame.
import fs from 'node:fs'
import path from 'node:path'
import { measureTexts } from './texts.mjs'

const add = (p, q, k = 1) => [p[0] + q[0] * k, p[1] + q[1] * k]
const esc = (t) => t.replace(/&(?!amp;)/g, '&amp;')

/**
 * GROUPS: objects.mjs; SP: the festival's sprites; geometry: lib/geometry.mjs; BOX: frame box; CACHE/OUT: folders;
 * officialView: { width, height } of the official map to also write that frame, else null; extraTexts: more texts to
 * measure ([text, size, font]) for the festival's own sprites.
 */
export async function drawLayer2({ GROUPS, SP, geometry, BOX, CACHE, OUT, officialView = null, extraTexts = [] }) {
  const { centreOffset, toNorthUp, PX_TO_M } = geometry
  // Label positions re-laid-out for the north-up map, keyed group:index; centre in frame units.
  const layoutFile = path.join(CACHE, 'labels-northup.json')
  const layout = fs.existsSync(layoutFile) ? JSON.parse(fs.readFileSync(layoutFile)) : {}
  GROUPS.forEach((g) => g.items.forEach((it, i) => { it.layoutKey = `${g.id}:${i}` }))
  const byId = new Map(GROUPS.flatMap((g) => g.items).filter((it) => it.id).map((it) => [it.id, it]))
  const frames = {
    official: { place: (it) => it.s, scale: 1, pos: (s) => s },
    northUp: {
      scale: PX_TO_M, pos: toNorthUp,
      place(it) {
        if (it.layoutKey && layout[it.layoutKey]) return add(layout[it.layoutKey], centreOffset(it), -PX_TO_M) // re-laid-out for north-up
        const c = add(it.s, centreOffset(it))
        if (it.of) { // keep the on-screen offset from the thing it names
          const parent = byId.get(it.of), pc = add(parent.s, centreOffset(parent))
          return add(add(toNorthUp(pc, parent.zone), [c[0] - pc[0], c[1] - pc[1]], PX_TO_M), centreOffset(it), -PX_TO_M)
        }
        return add(toNorthUp(c, it.zone), centreOffset(it), -PX_TO_M) // by the visual centre: anchors point the other way once north is up
      },
    },
  }
  await measureTexts(SP, GROUPS, extraTexts)
  const sprite = (it) => { const fn = SP[it.kind]; if (!fn) throw new Error(`no sprite ${it.kind}`); return fn(...(it.args || [])) }
  // a dashed walking route with an arrow head (official-map pixels in `pts`)
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
      const body = items.map(({ it, at }) => { if (it.kind === 'route') return route(it, f)
        const scale = +(f.scale * (it.k ?? 1)).toFixed(5)
        return `<g${it.tag ? ` data-name="${esc(it.tag)}"` : ''} transform="translate(${at[0].toFixed(2)},${at[1].toFixed(2)})${scale !== 1 ? ` scale(${scale})` : ''}">${sprite(it)}</g>` }).join('')
      return `<g id="l2-${grp.id}" data-name="${grp.name}">${body}</g>`
    }).join('\n')
  }
  const layer = (f) => `<g id="layer2" data-name="레이어 2 · 운영 표시">\n${build(f)}\n</g>`
  const VW = BOX.east - BOX.west, VH = BOX.north - BOX.south
  const northUp = `<svg xmlns="http://www.w3.org/2000/svg" width="${VW * 3}" height="${VH * 3}" viewBox="0 0 ${VW} ${VH}">\n${layer(frames.northUp)}\n</svg>\n`
  fs.mkdirSync(OUT, { recursive: true })
  if (officialView) {
    const { width, height } = officialView
    fs.writeFileSync(path.join(OUT, 'layer2-operations-official-view.svg'), `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">\n${layer(frames.official)}\n</svg>\n`)
  }
  fs.writeFileSync(path.join(OUT, 'layer2-operations-north-up.svg'), northUp)
  console.log('objects', GROUPS.reduce((s, g) => s + g.items.length, 0), 'north-up svg KB', (northUp.length / 1024).toFixed(0))
}
