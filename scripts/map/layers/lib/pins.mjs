// Layer 3 (pins) shared by every festival: Tabler icons (MIT, vendored in map-src/icons/tabler), and writing the pins
// layer — north-up (positions from the north-up layout) and, when the festival has one, in the official frame — with
// the pins' coordinates for the app and a legend sheet for checking.
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

/** tabler(name, style): the inner SVG of a vendored Tabler icon (24×24), without its invisible bounding path. */
export const loadTabler = (ICONS) => (name, style = 'outline') => fs.readFileSync(`${ICONS}/${style}/${name}.svg`, 'utf8')
  .replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').replace(/<path stroke="none" d="M0 0h24v24H0z" fill="none"\s*\/>/, '').trim()
const esc = (t) => t.replace(/&(?!amp;)/g, '&amp;')

/**
 * TYPES: pin type → { name } (official legend name, plain text); draw(type): the pin's SVG at (0,0) in sprite px;
 * PX_TO_M, BOX, toLL, CACHE, OUT: the festival's; officialView: { width, height } to also write the official frame
 * (pins carry `view`, their place there), else null; idPrefix: id prefix in the JSON; source: the JSON's source note;
 * legend: { cols, cell, scale, top, background } of the check sheet.
 */
export async function drawLayer3({ TYPES, draw, PX_TO_M, BOX, toLL, CACHE, OUT, officialView = null, idPrefix, source, legend }) {
  const pins = JSON.parse(fs.readFileSync(path.join(CACHE, 'pins-placed.json')))
  for (const p of pins) if (!TYPES[p.type]) throw new Error(`no pin design for ${p.type} (#${p.id})`)
  const NORTH_UP = JSON.parse(fs.readFileSync(path.join(CACHE, 'pins-northup.json')))
  function layer(place) {
    const groups = Object.keys(TYPES).map((type) => {
      const list = pins.filter((p) => p.type === type); if (!list.length) return ''
      return `<g id="pins-${type}" data-name="${esc(TYPES[type].name)}">${list.map((p) => `<g id="pin-${p.id}" transform="${place(p)}">${draw(type)}</g>`).join('')}</g>`
    }).join('\n')
    return `<g id="layer3" data-name="레이어 3 · 핀">\n${groups}\n</g>`
  }
  fs.mkdirSync(OUT, { recursive: true })
  if (officialView) {
    const { width, height } = officialView
    fs.writeFileSync(path.join(OUT, 'layer3-pins-official-view.svg'), `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">\n${layer((p) => `translate(${p.view[0]},${p.view[1]})`)}\n</svg>\n`)
  }
  // north-up: pins where the north-up layout put them (next to the facility they mark), upright
  const VW = BOX.east - BOX.west, VH = BOX.north - BOX.south
  const northUp = `<svg xmlns="http://www.w3.org/2000/svg" width="${VW * 3}" height="${VH * 3}" viewBox="0 0 ${VW} ${VH}">\n${layer((p) => `translate(${NORTH_UP[p.id].badge.join(',')}) scale(${PX_TO_M})`)}\n</svg>\n`
  fs.writeFileSync(path.join(OUT, 'layer3-pins-north-up.svg'), northUp)
  // for the app: lat/lng = the facility the pin marks (its layer 2 object), else the spot the pin stands for
  const json = pins.map((p) => { const nu = NORTH_UP[p.id]; const [lat, lng] = nu.facility ?? toLL(p.m); return { id: `${idPrefix}${p.id}`, type: p.type, name: TYPES[p.type].name, lat, lng, officialPx: p.official, marks: nu.marks } })
  fs.writeFileSync(path.join(OUT, 'layer3-pins.json'), `${JSON.stringify({ source, pins: json }, null, 2)}\n`)
  // legend sheet: every pin design, to compare with the official map (cache)
  const types = Object.keys(TYPES), { cols, cell, scale, top, background } = legend
  const at = (i) => [(i % cols) * cell + cell / 2, Math.floor(i / cols) * cell]
  const sheet = `<svg xmlns="http://www.w3.org/2000/svg" width="${cols * cell}" height="${Math.ceil(types.length / cols) * cell}"><rect width="100%" height="100%" fill="${background}"/>${types.map((t, i) => { const [x, y] = at(i); return `<g transform="translate(${x},${y + top}) scale(${scale})">${draw(t)}</g><text x="${x}" y="${y + cell - 10}" text-anchor="middle" font-family="Apple SD Gothic Neo, Arial, sans-serif" font-size="11">${esc(TYPES[t].name)}</text>` }).join('')}</svg>`
  await sharp(Buffer.from(sheet)).png().toFile(path.join(CACHE, 'layer3-legend-sheet.png'))
  console.log('pins', pins.length, 'types', types.length, 'north-up svg KB', (northUp.length / 1024).toFixed(0))
}
