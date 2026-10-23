// GMF pin designs: the official map's white teardrop pins with black icons, redrawn as vectors (Tabler icons). Shared
// by layer3.mjs (drawing) and layout-north-up.mjs (sizes).
import { ICONS } from './paths.mjs'
import { loadTabler } from '../lib/pins.mjs'

export const PIN_R = 12 // head radius — the official pins' size relative to the GMF art (smaller than Pentaport's badges)
export const PIN_TAIL = 7 // from the head's bottom to the tip
const R = PIN_R, TAIL = PIN_TAIL
const INK = '#1f1f24'

const tabler = loadTabler(ICONS)
const at = (size, [dx, dy]) => { const k = size / 24; return `translate(${dx - 12 * k},${dy - 12 * k}) scale(${k})` }
// a black outline icon, centred, `size` px wide
const icon = (name, size = 15, d = [0, 0], width = 2.3) => `<g transform="${at(size, d)}" fill="none" stroke="${INK}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round">${tabler(name)}</g>`
// a black solid icon, centred
const solid = (name, size = 15, d = [0, 0]) => `<g transform="${at(size, d)}" fill="${INK}">${tabler(name, 'filled')}</g>`
const words = (lines, size, y0) => lines.map((l, i) => `<text x="0" y="${y0 + i * size * 1.05}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="${size}" fill="${INK}">${l}</text>`).join('')

// names: the official legend (src/data/catalog/series/grandMint.ts MARK_KINDS)
export const TYPES = {
  toilet: { name: '화장실', art: () => icon('man', 13, [-4.4, 0], 2.6) + icon('woman', 13, [4.4, 0], 2.6) },
  fnb: { name: '푸드존 (식음료 판매)', art: () => icon('building-store') },
  eating: { name: '취식존', art: () => icon('tools-kitchen-2') },
  water: { name: '프리워터존', art: () => `<g transform="${at(15, [0, 0])}" fill="#ffffff" stroke="${INK}" stroke-width="2" stroke-linejoin="round">${tabler('droplet', 'filled')}</g>` },
  firstaid: { name: '의료부스', art: () => icon('first-aid-kit') },
  info: { name: '인포메이션', art: () => `<circle cx="0" cy="-5" r="2" fill="${INK}"/><rect x="-1.8" y="-1.8" width="3.6" height="8.6" rx="1.5" fill="${INK}"/>` },
  wristband: { name: '손목밴드 교환', art: () => solid('ticket') },
  luggage: { name: '물품보관소', art: () => icon('luggage') },
  shop: { name: '민트샵 (공식 MD)', art: () => solid('shirt') },
  slogan: { name: '슬로건 전시', art: () => solid('star') },
  radar: { name: 'RADAR (오픈 라디오)', art: () => icon('radio') },
  photo: { name: '포토존', art: () => solid('camera') },
  smoking: { name: '흡연구역', art: () => icon('smoking') },
  sponsor: { name: '스폰서 존', art: () => words(['SPONSOR', 'ZONE'], 4.4, -0.8) },
  artist: { name: 'Artist & Label', art: () => icon('music') },
  vinyl: { name: 'Vinyl & Accessory', art: () => solid('disc') },
}
// the teardrop: a circle whose sides run straight down to the tip
const TIP = R + TAIL, SIN = Math.sqrt(1 - (R / TIP) ** 2), TX = +(R * SIN).toFixed(2), TY = +((R * R) / TIP).toFixed(2)
const DROP = `M0,${TIP} L${-TX},${TY} A${R},${R} 0 1 1 ${TX},${TY} Z`
export const pin = (type) => `<ellipse cx="0" cy="${TIP}" rx="4.5" ry="1.7" fill="#000000" opacity="0.22"/>`
  + `<path d="${DROP}" fill="#ffffff" stroke="#d6d6d6" stroke-width="0.8" stroke-linejoin="round"/>${TYPES[type].art()}`
