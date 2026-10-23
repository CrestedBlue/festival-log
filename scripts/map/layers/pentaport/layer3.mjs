// Layer 3 (pins): the official map's round badges, redrawn as vectors (Tabler icons, MIT) in the official colours,
// at the official positions. Writes the official-frame SVG (1080×1350), the north-up one in metres (positions from
// layout-north-up.mjs) and the pins' coordinates for the app.
//   node scripts/map/layers/pentaport/layer3.mjs
import fs from 'node:fs'
import path from 'node:path'
import { sharp, BOX, toLL } from './frame.mjs'
import { OUT, CACHE, ICONS } from './paths.mjs'

const PX_TO_M = 0.4496 // official map pixel in metres (similarity scale)
const R = 19.5 // badge radius in official pixels
const GATE_R = 24.5
const OUTLINE = '#2b2b2b'

const tabler = (name, style = 'outline') => fs.readFileSync(`${ICONS}/${style}/${name}.svg`, 'utf8')
  .replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').replace(/<path stroke="none" d="M0 0h24v24H0z" fill="none"\s*\/>/, '').trim()
// An outline icon in one colour with a dark edge (dark wide stroke under the coloured one), centred, `size` px wide.
const icon = (name, colour, size = 26, [dx, dy] = [0, 0]) => {
  const k = size / 24, body = tabler(name)
  return `<g transform="translate(${dx - 12 * k},${dy - 12 * k}) scale(${k})" fill="none" stroke-linecap="round" stroke-linejoin="round">`
    + `<g stroke="${OUTLINE}" stroke-width="3.6">${body}</g><g stroke="${colour}" stroke-width="2">${body}</g></g>`
}
// A filled icon in one colour with a dark edge, centred, `size` px wide.
const filled = (name, colour, size = 26, [dx, dy] = [0, 0]) => { const k = size / 24
  return `<g transform="translate(${dx - 12 * k},${dy - 12 * k}) scale(${k})">${tabler(name, 'filled').replace(/<path /g, `<path fill="${colour}" stroke="${OUTLINE}" stroke-width="1.4" stroke-linejoin="round" `)}</g>` }
const text = (t, colour, size, dy = 0, weight = 900) => `<text x="0" y="${dy}" text-anchor="middle" dominant-baseline="central" font-family="Arial Black, Arial, sans-serif" font-weight="${weight}" font-size="${size}" fill="${colour}" stroke="${OUTLINE}" stroke-width="${size / 9}" paint-order="stroke">${t}</text>`
const small = (lines, colour, y0) => lines.map((l, i) => `<text x="0" y="${y0 + i * 5.6}" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="5.2" fill="${colour}">${l}</text>`).join('')

const TYPES = {
  gate: { name: '입장 게이트', r: GATE_R, art: () => `<circle cx="0" cy="-7" r="10" fill="#f03048" stroke="${OUTLINE}" stroke-width="1.4"/>` + filled('star', '#ffffff', 14, [0, -7.4]).replace(/stroke="#2b2b2b" stroke-width="1.4"/g, 'stroke="none"') + `<text x="0" y="12.5" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="9.5" fill="${OUTLINE}">GATE</text>` },
  info: { name: '종합안내소', art: () => `<g stroke="${OUTLINE}" stroke-width="1.6"><circle cx="0" cy="-8.5" r="3.4" fill="#f03048"/><rect x="-3" y="-3" width="6" height="15" rx="2.6" fill="#f03048"/></g>` },
  barrierFreePass: { name: '배리어 프리 패스', fill: '#48f0a8', art: () => icon('wheelchair', '#ffffff', 19, [0, -6]) + small(['Barrier Free', 'Pass'], '#184830', 8) },
  securityCheck: { name: '물품검색대', art: () => icon('luggage', '#ffe11a', 24, [-3, -1]) + icon('zoom', '#304890', 15, [7, 6]) },
  lockers: { name: '물품보관소', art: () => icon('luggage', '#ffe11a', 26) },
  pentaDreamer: { name: '펜타 드리머', art: () => icon('bulb', '#ff90d8', 26) },
  promotionBooth: { name: '홍보 부스', art: () => icon('package', '#ffd830', 26) },
  vendorBooth: { name: '벤더 부스', art: () => icon('building-store', '#304890', 26) },
  fnb: { name: 'F&amp;B', art: () => icon('burger', '#f04830', 26) },
  bar: { name: '주류', art: () => icon('beer', '#ffc018', 26) },
  waterBar: { name: '워터바', art: () => `<path d="M-8,-10H8L6,10H-6Z" fill="#30c0f0" stroke="${OUTLINE}" stroke-width="1.6" stroke-linejoin="round"/>` + filled('droplet', '#ffffff', 11, [0, 1]).replace(/stroke="#2b2b2b" stroke-width="1.4"/g, 'stroke="none"') },
  kiosk: { name: '키오스크', art: () => icon('device-mobile', '#1b4f8a', 26) },
  medical: { name: '의료부스', art: () => filled('shield', '#18a848', 26) + `<path d="M0,-5.5V5.5M-5.5,0H5.5" stroke="#ffffff" stroke-width="2.8" stroke-linecap="round"/>` },
  coolZone: { name: '쿨존', art: () => icon('snowflake', '#36b6e8', 26) },
  mainCoolZone: { name: '메인쿨존', fill: '#30c0f0', art: () => icon('snowflake', '#ffffff', 27) },
  officialMd: { name: '공식MD', art: () => icon('gift', '#f03048', 26) },
  artistMd: { name: '아티스트MD', art: () => icon('gift-card', '#783090', 26) },
  charging: { name: '모바일 충전소', art: () => icon('battery-vertical-charging', '#18a848', 27) },
  toilet: { name: '화장실', art: () => icon('man', '#303090', 22, [-6.5, 0]) + icon('woman', '#f01878', 22, [6.5, 0]) },
  accessibleToilet: { name: '장애인 화장실', art: () => icon('wheelchair', '#1878c0', 26) },
  washStation: { name: '개수대', art: () => icon('wash-hand', '#30c0f0', 26) },
  nursingRoom: { name: '수유실', art: () => icon('baby-bottle', '#e8a868', 26) },
  barrierFreeZone: { name: '배리어 프리 존', art: () => icon('wheelchair', '#00a8a8', 18, [0, -6]) + small(['Barrier Free', 'Zone'], '#2b2b2b', 8) },
  police: { name: '연수 경찰서', art: () => text('112', '#303090', 15, 0.5) },
  fireStation: { name: '송도 소방서', art: () => text('119', '#d81830', 15, 0.5) },
  interpretation: { name: '통역 안내', art: () => icon('language', '#d81848', 26) },
  smoking: { name: '흡연구역', art: () => icon('smoking', '#9a9a9a', 26) },
}
const badge = (type) => {
  const t = TYPES[type], r = t.r || R
  return `<circle cx="0" cy="2.6" r="${r}" fill="#111"/><circle cx="0" cy="0" r="${r}" fill="${t.fill || '#ffffff'}" stroke="#7a7a7a" stroke-width="1"/>${t.art()}`
}
const pins = JSON.parse(fs.readFileSync(path.join(CACHE, 'pins-placed.json')))
function layer(place) {
  const groups = Object.keys(TYPES).map((type) => {
    const list = pins.filter((p) => p.type === type); if (!list.length) return ''
    return `<g id="pins-${type}" data-name="${TYPES[type].name}">${list.map((p) => `<g id="pin-${p.id}" transform="${place(p)}">${badge(type)}</g>`).join('')}</g>`
  }).join('\n')
  return `<g id="layer3" data-name="레이어 3 · 핀">\n${groups}\n</g>`
}
const official = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350">\n${layer((p) => `translate(${p.view[0]},${p.view[1]})`)}\n</svg>\n`
const VW = BOX.east - BOX.west, VH = BOX.north - BOX.south
// north-up: badges where the north-up layout put them (next to the facility they mark), upright
const NORTH_UP = JSON.parse(fs.readFileSync(path.join(CACHE, 'pins-northup.json')))
const northUp = `<svg xmlns="http://www.w3.org/2000/svg" width="${VW * 3}" height="${VH * 3}" viewBox="0 0 ${VW} ${VH}">\n${layer((p) => `translate(${NORTH_UP[p.id].badge.join(',')}) scale(${PX_TO_M})`)}\n</svg>\n`
fs.writeFileSync(path.join(OUT, 'layer3-pins-official-view.svg'), official)
fs.writeFileSync(path.join(OUT, 'layer3-pins-north-up.svg'), northUp)
// for the app: lat/lng = the facility the pin marks (its layer 2 object), else the pin itself
const NAMES = Object.fromEntries(Object.entries(TYPES).map(([k, t]) => [k, t.name.replace('&amp;', '&')]))
const json = pins.map((p) => { const nu = NORTH_UP[p.id]; const [lat, lng] = nu.facility ?? toLL(p.m); return { id: `pentaport-pin-${p.id}`, type: p.type, name: NAMES[p.type], lat, lng, officialPx: p.official, marks: nu.marks } })
fs.writeFileSync(path.join(OUT, 'layer3-pins.json'), `${JSON.stringify({ source: '2026 Pentaport official site map pins; lat/lng = the facility each pin marks (its layer 2 object), else the pin itself (similarity fit, about ±15 m)', pins: json }, null, 2)}\n`)
// legend sheet: every pin design, to compare with the official legend
const types = Object.keys(TYPES)
const sheet = `<svg xmlns="http://www.w3.org/2000/svg" width="${9 * 110}" height="${Math.ceil(types.length / 9) * 110}"><rect width="100%" height="100%" fill="#fff"/>${types.map((t, i) => `<g transform="translate(${(i % 9) * 110 + 55},${Math.floor(i / 9) * 110 + 46}) scale(1.6)">${badge(t)}</g><text x="${(i % 9) * 110 + 55}" y="${Math.floor(i / 9) * 110 + 100}" text-anchor="middle" font-family="Arial" font-size="12">${TYPES[t].name}</text>`).join('')}</svg>`
await sharp(Buffer.from(sheet)).png().toFile(path.join(CACHE, 'layer3-legend-sheet.png'))
console.log('pins', pins.length, 'types', types.length, 'svg KB', (official.length / 1024).toFixed(0))
