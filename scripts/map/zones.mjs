/**
 * The festival zones, redrawn on their real footprints in the official map's colours. Sizes are in
 * output pixels (1.6 px per metre) and were tuned so labels read at the app's first zoom level.
 */
import { simplify, smoothRing } from './geo.mjs'

const FONT = 'Apple SD Gothic Neo, sans-serif'
const OUTLINE_SIMPLIFY_PX = 5
const OUTLINE_SMOOTH_PASSES = 4
// Art Zone area radii (px); marks.mjs fits the official Art Zone icons into this ellipse.
export const ART_ZONE_RADII = [70, 42]

// Real positions (lat, lng). Lawn and dome shapes come from OSM; the rest sit where the official map
// puts them relative to those footprints.
export const SPOTS = {
  mbTitle: [37.520274, 127.125581],
  mbStage: [37.51987, 127.125545],
  mbStanding: [37.519421, 127.12551],
  picnicMain: [37.518927, 127.124405],
  picnicBottomLeft: [37.518225, 127.124943],
  picnicBottomRight: [37.518310, 127.125552],
  picnicRight: [37.518905, 127.125835],
  hungryLawn: [37.518467, 127.124235],
  subGate: [37.518781, 127.126019],
  mainGate: [37.517861, 127.124844],
  lfgTitle: [37.521475, 127.125453],
  lfgArea: [37.520925, 127.125453],
  lfgStage: [37.521127, 127.125453],
  lfgGate: [37.520645, 127.125453],
  cmsTitle: [37.519123, 127.127471],
  cmsStage: [37.519477, 127.127492],
  gate23: [37.519836, 127.127471],
  gate22: [37.519432, 127.126642],
  gate21: [37.518635, 127.127067],
  hungryEast: [37.520117, 127.127138],
  radar: [37.520117, 127.128214],
  artZone: [37.518298, 127.127181],
  ticketBooth: [37.517681, 127.128002],
}

const COLORS = {
  lawn: '#1ca289',
  lawnDeep: '#0e5e50',
  standing: '#5cc4ad',
  picnic: '#8fdcc8',
  gate: '#ffd23f',
  lfg: '#fdaac4',
  lfgDeep: '#d63c75',
  cms: '#de4f47',
  cmsDeep: '#8c1f1a',
  hungry: '#f2a541',
  hungryInk: '#5a3410',
  radar: '#3d3a8c',
  art: '#f4d072',
  artInk: '#6b4e00',
  ink: '#3b2f25',
  paper: '#fffaf0',
}

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

function text(x, y, value, { size, fill, weight = 800, anchor = 'middle', halo }) {
  const stroke = halo ? `stroke="${halo}" stroke-width="${Math.max(3, size / 6)}" paint-order="stroke"` : ''
  return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-family="${FONT}" font-weight="${weight}" font-size="${size}" fill="${fill}" text-anchor="${anchor}" dominant-baseline="central" ${stroke}>${esc(value)}</text>`
}

/** A signboard: rounded box, coloured border, one or two lines. Returns [svg, bbox]. */
function sign(x, y, lines, { width, border, ink, fill = '#ffffff', size = 26, subSize = 17 }) {
  const height = lines.length > 1 ? size + subSize + 22 : size + 18
  const top = y - height / 2
  let svg = `<rect x="${x - width / 2}" y="${top}" width="${width}" height="${height}" rx="12" fill="${fill}" stroke="${border}" stroke-width="4"/>`
  if (lines.length > 1) {
    svg += text(x, top + 9 + size / 2, lines[0], { size, fill: ink })
    svg += text(x, top + 13 + size + subSize / 2, lines[1], { size: subSize, fill: ink, weight: 600 })
  } else {
    svg += text(x, y, lines[0], { size, fill: ink })
  }
  return [svg, [x - width / 2, top, x + width / 2, top + height]]
}

function pill(x, y, label, { width, height = 32, fill, ink, size = 18, stroke = '#ffffff' }) {
  const svg =
    `<rect x="${x - width / 2}" y="${y - height / 2}" width="${width}" height="${height}" rx="${height / 2}" fill="${fill}" stroke="${stroke}" stroke-width="3"/>` +
    text(x, y, label, { size, fill: ink })
  return [svg, [x - width / 2, y - height / 2, x + width / 2, y + height / 2]]
}

const ellipse = (x, y, rx, ry, fill, extra = '') => `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`

export function renderZones(osm, proj) {
  const at = (key) => [proj.x(SPOTS[key][1]), proj.y(SPOTS[key][0])]
  // Real OSM footprints, traced from aerial photos, wobble every few metres. Drop wiggles under ~3 m and
  // round the corners so the outline reads like a drawn map while keeping the real shape and position.
  const polygonOf = (name) => {
    const way = osm.ways.find((w) => w.tags.name === name)
    if (!way) throw new Error(`zone footprint not found in OSM extract: ${name}`)
    const px = way.pts.slice(0, -1).map(([lat, lng]) => [proj.x(lng), proj.y(lat)])
    const smooth = smoothRing(simplify([...px, px[0]], OUTLINE_SIMPLIFY_PX).slice(0, -1), OUTLINE_SMOOTH_PASSES)
    return smooth.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  }
  const parts = []
  const boxes = []
  // Signs and pills: map pins are kept off these so the text stays readable.
  const labelBoxes = []
  const add = ([svg, box]) => {
    parts.push(svg)
    boxes.push(box)
    labelBoxes.push(box)
  }

  // Mint Breeze on the real bean-shaped 88잔디마당; inner areas are clipped to the lawn.
  const lawn = polygonOf('88잔디마당')
  parts.push(`<defs><clipPath id="lawn"><polygon points="${lawn}"/></clipPath></defs>`)
  parts.push(`<polygon points="${lawn}" fill="none" stroke="#ffffff" stroke-width="12" stroke-linejoin="round"/>`)
  parts.push(`<polygon points="${lawn}" fill="${COLORS.lawn}" stroke="${COLORS.lawnDeep}" stroke-width="4" stroke-linejoin="round"/>`)
  const [sx, sy] = at('mbStage')
  const [tx, ty] = at('mbStanding')
  const [p1x, p1y] = at('picnicMain')
  const picnicInner = [
    ellipse(p1x, p1y, 64, 46, COLORS.picnic),
    ellipse(...at('picnicBottomLeft'), 52, 40, COLORS.picnic),
    ellipse(...at('picnicBottomRight'), 50, 38, COLORS.picnic),
    ellipse(...at('picnicRight'), 38, 34, COLORS.picnic),
    ellipse(tx, ty, 84, 50, COLORS.standing),
  ].join('')
  parts.push(`<g clip-path="url(#lawn)">${picnicInner}</g>`)
  parts.push(text(tx, ty, 'STANDING', { size: 24, fill: COLORS.lawnDeep }))
  parts.push(text(p1x, p1y - 12, 'PICNIC', { size: 22, fill: COLORS.lawnDeep }))
  parts.push(text(p1x, p1y + 13, 'ZONE', { size: 22, fill: COLORS.lawnDeep }))
  parts.push(`<rect x="${sx - 82}" y="${sy - 24}" width="164" height="48" rx="10" fill="${COLORS.lawnDeep}" stroke="#ffffff" stroke-width="3"/>`)
  parts.push(text(sx, sy, 'STAGE', { size: 28, fill: '#ffffff' }))
  add(pill(...at('hungryLawn'), 'HUNGRY ZONE', { width: 128, height: 32, fill: COLORS.hungry, ink: COLORS.hungryInk, size: 17 }))
  const [gx, gy] = at('subGate')
  add(pill(gx, gy, 'SUB GATE', { width: 104, height: 34, fill: COLORS.gate, ink: COLORS.lawnDeep, size: 18, stroke: COLORS.lawnDeep }))
  const [mx, my] = at('mainGate')
  add(pill(mx, my + 6, 'MAIN GATE', { width: 128, height: 38, fill: COLORS.gate, ink: COLORS.lawnDeep, size: 21, stroke: COLORS.lawnDeep }))
  add(sign(...at('mbTitle'), ['MINT BREEZE STAGE', '88잔디마당'], { width: 270, border: COLORS.lawn, ink: '#127a68' }))

  // Loving Forest Garden: the small lakeside 수변무대 with its seating spreading south onto land.
  const [ax, ay] = at('lfgArea')
  parts.push(ellipse(ax, ay, 58, 58, COLORS.lfg, 'stroke="#ffffff" stroke-width="5"'))
  for (const r of [24, 36, 48]) {
    parts.push(`<path d="M ${ax - r} ${ay - 14} A ${r} ${r} 0 0 0 ${ax + r} ${ay - 14}" fill="none" stroke="#ffffff" stroke-width="4" opacity="0.85"/>`)
  }
  const [lsx, lsy] = at('lfgStage')
  parts.push(`<rect x="${lsx - 46}" y="${lsy - 15}" width="92" height="30" rx="8" fill="${COLORS.lfgDeep}" stroke="#ffffff" stroke-width="3"/>`)
  parts.push(text(lsx, lsy, 'STAGE', { size: 19, fill: '#ffffff' }))
  const [lgx, lgy] = at('lfgGate')
  add(pill(lgx, lgy + 6, 'GATE', { width: 72, height: 30, fill: COLORS.gate, ink: COLORS.lfgDeep, size: 17, stroke: COLORS.lfgDeep }))
  add(sign(...at('lfgTitle'), ['LOVING FOREST GARDEN', '88호수 수변무대'], { width: 300, border: COLORS.lfgDeep, ink: COLORS.lfgDeep, size: 24 }))
  boxes.push([ax - 64, ay - 64, ax + 64, ay + 64])

  // Club Midnight Sunset inside KSPO DOME (real round footprint).
  const dome = polygonOf('올림픽체조경기장')
  parts.push(`<polygon points="${dome}" fill="${COLORS.cms}" stroke="#ffffff" stroke-width="6" stroke-linejoin="round"/>`)
  const [csx, csy] = at('cmsStage')
  parts.push(`<rect x="${csx - 66}" y="${csy - 22}" width="132" height="44" rx="10" fill="${COLORS.cmsDeep}" stroke="#ffffff" stroke-width="3"/>`)
  parts.push(text(csx, csy, 'STAGE', { size: 26, fill: '#ffffff' }))
  const [ctx, cty] = at('cmsTitle')
  parts.push(text(ctx, cty, 'CLUB MIDNIGHT', { size: 25, fill: '#ffffff' }))
  parts.push(text(ctx, cty + 30, 'SUNSET', { size: 25, fill: '#ffffff' }))
  parts.push(text(ctx, cty + 56, 'KSPO DOME', { size: 16, fill: '#ffe3df', weight: 600 }))
  for (const [key, label] of [['gate23', 'GATE 2-3'], ['gate22', 'GATE 2-2'], ['gate21', 'GATE 2-1']]) {
    const [x, y] = at(key)
    add(pill(x, y, label, { width: 100, height: 30, fill: COLORS.gate, ink: COLORS.cmsDeep, size: 16, stroke: COLORS.cmsDeep }))
  }

  // Between KSPO DOME and the swimming pool.
  const [ex, ey] = at('hungryEast')
  parts.push(ellipse(ex, ey, 76, 30, COLORS.hungry, 'stroke="#ffffff" stroke-width="4"'))
  parts.push(text(ex, ey, 'HUNGRY ZONE', { size: 20, fill: COLORS.hungryInk }))
  boxes.push([ex - 80, ey - 34, ex + 80, ey + 34])
  add(pill(...at('radar'), 'RADAR', { width: 92, height: 32, fill: COLORS.radar, ink: '#ffffff', size: 18 }))

  // 한얼광장, right south of the dome.
  // The booths' pins sit inside the area, so its name goes on a sign just below it.
  const [zx, zy] = at('artZone')
  const [arx, ary] = ART_ZONE_RADII
  parts.push(ellipse(zx, zy, arx, ary, COLORS.art, 'stroke="#ffffff" stroke-width="4"'))
  boxes.push([zx - arx - 4, zy - ary - 4, zx + arx + 4, zy + ary + 4])
  // Nudged west so it clears the ticket booth sign.
  add(sign(zx - 52, zy + ary + 30, ['ART ZONE', '한얼광장'], { width: 150, border: '#c9a227', ink: COLORS.artInk, size: 20, subSize: 15 }))

  add(sign(...at('ticketBooth'), ['TICKET BOOTH', '손목밴드 교환'], { width: 180, border: COLORS.ink, ink: COLORS.ink, fill: COLORS.paper, size: 20, subSize: 15 }))

  return { svg: parts.join(''), boxes, labelBoxes }
}

const LINE_COLORS = { '5': '#996cac', '8': '#e6186c', '9': '#bdb092' }

/** Station badge above an exact exit point: line chips + station and exit name. */
export function stationBadge(proj, { lat, lng }, { name, exit, lines }) {
  const x = proj.x(lng)
  const y = proj.y(lat) - 46
  const width = 236
  let svg = `<rect x="${x - width / 2}" y="${y - 24}" width="${width}" height="48" rx="14" fill="#ffffff" stroke="${COLORS.ink}" stroke-width="3"/>`
  lines.forEach((line, i) => {
    const cx = x - width / 2 + 26 + i * 26
    svg += `<circle cx="${cx}" cy="${y}" r="12" fill="${LINE_COLORS[line]}"/>` + text(cx, y + 1, line, { size: 15, fill: '#ffffff' })
  })
  const textX = x - width / 2 + 26 + lines.length * 26 - 6
  svg += text(textX, y - 8, name, { size: 18, fill: COLORS.ink, anchor: 'start' })
  svg += text(textX, y + 12, exit, { size: 14, fill: COLORS.ink, anchor: 'start', weight: 600 })
  svg += `<line x1="${x}" y1="${y + 24}" x2="${x}" y2="${y + 38}" stroke="${COLORS.ink}" stroke-width="3"/>`
  return svg
}
