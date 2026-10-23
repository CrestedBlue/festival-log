// Flat sprites for layer 2 (style B: no outlines, shading with tones of the same hue, rounded corners,
// soft ground shadow), drawn front-on in official-map pixels. Anchor (0,0) = where the object stands
// (bottom centre), except labels, blankets and the LUSH booth (centre).
import { kbB } from './kb-variants.mjs'

const KR = 'Apple SD Gothic Neo, Noto Sans KR, Malgun Gothic, sans-serif'
const EN = 'Arial Black, Arial, sans-serif'
const INK = '#2b2b3a'
const METAL = '#a0a6b2'
const shadow = (w, ry = 3) => `<ellipse cx="0" cy="0" rx="${w / 2 + 2}" ry="${ry}" fill="#000000" opacity="0.12"/>`

// Text widths measured by rendering (layer2.mjs fills this before drawing); the estimate is only a fallback.
export const MEASURED = new Map()
export const textKey = (t, size, font) => `${font}|${size}|${t}`
export const FONTS = { kr: KR, en: EN }
const textW = (t, size, font = 'kr') => MEASURED.get(textKey(t, size, font)) ?? [...t].reduce((w, ch) => w + (/[ㄱ-힝]/.test(ch) ? size : ch === ' ' ? size * 0.3 : size * (font === 'en' ? 0.74 : 0.62)), 0)

export function tent(base, light, dark, w = 42) {
  const hw = w / 2, roofH = w * 0.32, legH = w * 0.38, val = 5, eave = -(legH + val), top = eave - roofH
  return shadow(w)
    + `<rect x="${-hw + 3}" y="${eave}" width="2.6" height="${-eave}" rx="1.2" fill="${METAL}"/><rect x="${hw - 5.6}" y="${eave}" width="2.6" height="${-eave}" rx="1.2" fill="${METAL}"/>`
    + `<rect x="${-hw + 4}" y="${-legH * 0.5}" width="${w - 8}" height="${legH * 0.5}" rx="2" fill="#efe9e1"/><rect x="${-hw + 4}" y="${-legH * 0.5}" width="${w - 8}" height="2.2" rx="1" fill="#ffffff"/>`
    + `<path d="M${-hw},${eave} L0,${top} L0,${eave} Z" fill="${light}"/><path d="M0,${top} L${hw},${eave} L0,${eave} Z" fill="${base}"/>`
    + `<rect x="${-hw}" y="${eave}" width="${w}" height="${val}" rx="1.6" fill="${dark}"/><circle cx="0" cy="${top}" r="1.8" fill="${dark}"/>`
}
export function stripedTent(w = 44) { // official MD: red and white stripes
  const hw = w / 2, roofH = w * 0.32, legH = w * 0.38, val = 5, eave = -(legH + val), top = eave - roofH
  const stripes = [-0.62, -0.2, 0.22, 0.62].map((t) => `<path d="M0,${top} L${hw * t - 3.2},${eave} L${hw * t + 3.2},${eave} Z" fill="#fff4f5"/>`).join('')
  return shadow(w)
    + `<rect x="${-hw + 3}" y="${eave}" width="2.6" height="${-eave}" rx="1.2" fill="${METAL}"/><rect x="${hw - 5.6}" y="${eave}" width="2.6" height="${-eave}" rx="1.2" fill="${METAL}"/>`
    + `<rect x="${-hw + 4}" y="${-legH * 0.5}" width="${w - 8}" height="${legH * 0.5}" rx="2" fill="#efe9e1"/>`
    + `<path d="M${-hw},${eave} L0,${top} L0,${eave} Z" fill="#f48a94"/><path d="M0,${top} L${hw},${eave} L0,${eave} Z" fill="#ef5866"/>${stripes}`
    + `<rect x="${-hw}" y="${eave}" width="${w}" height="${val}" rx="1.6" fill="#cf3f4d"/>`
}
export function dome(w = 52, band = '#6ccbf0') {
  const h = w * 0.6, wall = h * 0.3, ry = h - wall
  return shadow(w)
    + `<path d="M${-w / 2},${-wall} A${w / 2},${ry} 0 0 1 ${w / 2},${-wall} Z" fill="#ffffff"/>`
    + `<path d="M0,${-h} A${w / 2},${ry} 0 0 1 ${w / 2},${-wall} L${w * 0.22},${-wall} A${w * 0.22},${ry} 0 0 0 0,${-h} Z" fill="#e1f3fb"/>`
    + `<path d="M${-w * 0.3},${-wall - ry * 0.55} A${w / 2},${ry} 0 0 1 ${-w * 0.05},${-h + 1.5}" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity="0.9"/>`
    + `<rect x="${-w / 2}" y="${-wall}" width="${w}" height="${wall}" rx="2" fill="${band}"/><rect x="${w * 0.12}" y="${-wall}" width="${w * 0.38}" height="${wall}" rx="2" fill="#000000" opacity="0.1"/>`
}
export function pool(w = 50) { // kids zone tub
  return shadow(w) + `<rect x="${-w / 2}" y="-16" width="${w}" height="16" rx="3" fill="#6cc9ee"/><rect x="${w * 0.1}" y="-16" width="${w * 0.4}" height="16" rx="3" fill="#000000" opacity="0.08"/>`
    + `<ellipse cx="0" cy="-16" rx="${w / 2}" ry="7" fill="#dff4fd"/><ellipse cx="0" cy="-16" rx="${w / 2 - 5}" ry="4.5" fill="#8fd8f5"/>`
}
export function container(base, light, dark, w = 28, h = 18) {
  const ribs = [-0.3, -0.1, 0.1, 0.3].map((t) => `<rect x="${w * t - 0.7}" y="${-h + 5}" width="1.4" height="${h - 7}" rx="0.7" fill="${dark}"/>`).join('')
  return shadow(w, 2.5) + `<rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" rx="2.4" fill="${base}"/><rect x="${-w / 2}" y="${-h}" width="${w}" height="4" rx="2" fill="${light}"/>${ribs}`
}
export function toilet(colour, w = 13) {
  return shadow(w, 2) + `<rect x="${-w / 2}" y="-22" width="${w}" height="22" rx="2" fill="${colour}"/><rect x="${-w / 2 + 3}" y="-16" width="${w - 6}" height="14" rx="1.5" fill="#000000" opacity="0.18"/>`
    + `<rect x="${-w / 2 - 1}" y="-25.5" width="${w + 2}" height="4.5" rx="2" fill="#e6e9f0"/>`
}
export const toiletPair = () => `<g transform="translate(-7,0)">${toilet('#4c7bd9')}</g><g transform="translate(7,0)">${toilet('#f06aa8')}</g>`
export const accessibleToilet = () => toilet('#3f72c9', 18)
export function kiosk() {
  return shadow(12, 2) + `<rect x="-6" y="-28" width="12" height="28" rx="2.5" fill="#2c3e6b"/><rect x="3" y="-28" width="3" height="28" rx="1.5" fill="#43588c"/><rect x="-4" y="-25" width="8" height="10" rx="1.5" fill="#9fddf7"/>`
}
export function tower() {
  let bars = ''; for (let y = -48; y < -2; y += 11.5) bars += `<path d="M-9,${y} L9,${y + 11.5} M9,${y} L-9,${y + 11.5}" stroke="#77719a" stroke-width="1.4" stroke-linecap="round"/>`
  return shadow(24) + bars + `<rect x="-11" y="-50" width="3" height="50" rx="1.5" fill="#4a4566"/><rect x="8" y="-50" width="3" height="50" rx="1.5" fill="#4a4566"/><rect x="-14" y="-56" width="28" height="7" rx="2.5" fill="#3a3550"/>`
}
export function campTent(w = 34) {
  const h = w * 0.62
  return shadow(w) + `<path d="M${-w / 2},0 Q${-w / 2},${-h} 0,${-h} Q${w / 2},${-h} ${w / 2},0 Z" fill="#7c8da0"/>`
    + `<path d="M0,${-h} Q${w / 2},${-h} ${w / 2},0 L${w * 0.16},0 Q${w * 0.18},${-h * 0.7} 0,${-h} Z" fill="#5d6e80"/>`
    + `<path d="M-6,0 Q-6,-12 0,-12 Q6,-12 6,0 Z" fill="#3e4a57"/><path d="M${-w / 2 + 5},${-h * 0.45} Q0,${-h * 1.15} ${w / 2 - 5},${-h * 0.45}" fill="none" stroke="#a3b2c2" stroke-width="1.6" stroke-linecap="round"/>`
}
export function umbrellaTable() {
  return shadow(26) + `<rect x="-1.2" y="-31" width="2.4" height="26" rx="1.2" fill="${METAL}"/>`
    + `<path d="M-18,-28 Q0,-45 18,-28 Z" fill="#ff8a3d"/><path d="M0,-37 Q12,-36 18,-28 L6,-28 Z" fill="#e8662a"/><path d="M-6,-36 Q-2,-38 2,-37 L-1,-28 L-8,-28 Z" fill="#ffb066"/>`
    + `<ellipse cx="0" cy="-6" rx="12" ry="4" fill="#d7dae5"/><ellipse cx="0" cy="-5" rx="12" ry="3" fill="#b9becf" opacity="0.6"/><rect x="-16" y="-4.5" width="5" height="4.5" rx="1.5" fill="#9aa0ae"/><rect x="11" y="-4.5" width="5" height="4.5" rx="1.5" fill="#9aa0ae"/>`
}
export function blanket(kind) {
  const fill = kind === 'check' ? '#f6b2c4' : '#bfe2f6'
  const pat = kind === 'check' ? '<path d="M-9,-8V8M-3,-8V8M3,-8V8M9,-8V8M-15,-3H15M-15,3H15" stroke="#ffffff" stroke-width="1.4"/>'
    : [-9, 0, 9].flatMap((x) => [-3.5, 3.5].map((y) => `<circle cx="${x}" cy="${y}" r="2.2" fill="#ffffff"/>`)).join('')
  return `<g transform="skewX(-12)"><rect x="-15" y="-8" width="30" height="16" rx="1.5" fill="${fill}"/>${pat}</g>`
}
export function arch(text) {
  return shadow(54, 3.5)
    + `<rect x="-25" y="-46" width="12" height="46" rx="2.5" fill="#7a63f0"/><rect x="-16" y="-46" width="3" height="46" rx="1.5" fill="#5a45d0"/>`
    + `<rect x="13" y="-46" width="12" height="46" rx="2.5" fill="#7a63f0"/><rect x="22" y="-46" width="3" height="46" rx="1.5" fill="#5a45d0"/>`
    + `<rect x="-28" y="-60" width="56" height="16" rx="3.5" fill="#6a4bd8"/><rect x="-28" y="-60" width="56" height="4" rx="2" fill="#8c76f2"/>`
    + `<text x="0" y="-48" text-anchor="middle" font-family="${EN}" font-size="9" fill="#ffffff">${text}</text>`
    + `<rect x="-1.5" y="-66" width="3" height="7" fill="#cf3f4d"/><rect x="-12" y="-79" width="24" height="15" rx="5" fill="#ef5866"/><rect x="-12" y="-68" width="24" height="4" rx="2" fill="#cf3f4d"/>`
    + `<path d="M0,-76.5 L1.7,-73.4 L5.1,-73.1 L2.5,-70.9 L3.3,-67.5 L0,-69.3 L-3.3,-67.5 L-2.5,-70.9 L-5.1,-73.1 L-1.7,-73.4 Z" fill="#ffffff"/>`
}
export function flag(text, colour, { pole = 62, size = 13, textColour = INK } = {}) {
  const w = textW(text, size) + 18, h = 22, top = -pole
  return shadow(8, 2) + `<rect x="-1.6" y="${top - 2}" width="3.2" height="${pole + 2}" rx="1.6" fill="#e0a23a"/><circle cx="0" cy="${top - 3}" r="2.6" fill="#c98a2a"/>`
    + `<path d="M1,${top} H${w} q-1,0 -1.8,1.2 l-5.2,${h / 2 - 1.2} l5.2,${h / 2 - 1.2} q0.8,1.2 1.8,1.2 H1 Z" fill="${colour}"/>`
    + `<path d="M1,${top + h * 0.62} H${w - 7 * 0.76} l${7 * 0.76},${h * 0.38} H1 Z" fill="#000000" opacity="0.07"/>`
    + `<text x="${(w - 7) / 2 + 1}" y="${top + h / 2 + size * 0.36}" text-anchor="middle" font-family="${KR}" font-weight="800" font-size="${size}" fill="${textColour}">${text}</text>`
}
export function label(parts, { size = 13, shadow: tint = '#8f84d6' } = {}) { // parts: [[text, colour, font]]
  const gap = size * 0.45, w = parts.reduce((s, [t, , f]) => s + textW(t, size, f), 0) + gap * (parts.length - 1) + 26, h = 26
  let x = -w / 2 + 13
  const spans = parts.map(([t, c, f]) => { const tw = textW(t, size, f); const s = `<text x="${x}" y="${size * 0.36}" font-family="${f === 'kr' ? KR : EN}" font-weight="900" font-size="${size}" fill="${c}">${t}</text>`; x += tw + gap; return s }).join('')
  return `<rect x="${-w / 2}" y="${-h / 2 + 3.5}" width="${w}" height="${h}" rx="${h / 2}" fill="${tint}" opacity="0.55"/>`
    + `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${h / 2}" fill="#ffffff" stroke="#e3e5ec" stroke-width="1"/>${spans}`
}
export const BANNER = 'PENTAPORT ROCK FESTIVAL 2026'
function monsterStage() {
  const tower = (x) => `<rect x="${x}" y="-112" width="24" height="96" rx="5" fill="#2f2b45"/>` + [-96, -74, -52, -30].map((y) => `<circle cx="${x + 12}" cy="${y}" r="7.5" fill="#4a4566"/><circle cx="${x + 12}" cy="${y}" r="3" fill="#1f1c2e"/>`).join('')
  let zig = 'M-74,-118'; for (let x = -74; x < 74; x += 8) zig += ` L${x + 4},-125 L${x + 8},-118`
  return `<linearGradient id="mon-screen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b7ef7a"/><stop offset="1" stop-color="#6cc24a"/></linearGradient>`
    + `<ellipse cx="0" cy="0" rx="80" ry="7" fill="#000000" opacity="0.12"/>`
    + `<rect x="-78" y="-130" width="156" height="16" rx="4" fill="#2f2b45"/><path d="${zig}" stroke="#4a4566" stroke-width="1.6" fill="none" stroke-linejoin="round"/>`
    + tower(-76) + tower(52)
    + `<rect x="-52" y="-112" width="104" height="92" rx="5" fill="url(#mon-screen)"/>`
    + `<path d="M-22,-112 L-8,-112 L8,-20 L-44,-20 Z" fill="#ffffff" opacity="0.22"/><path d="M8,-112 L22,-112 L44,-20 L-8,-20 Z" fill="#ffffff" opacity="0.22"/>`
    + `<rect x="-80" y="-22" width="160" height="14" rx="4" fill="#dcdfea"/><rect x="-80" y="-10" width="160" height="10" rx="3" fill="#b9becf"/>`
}
function stanleyStage() {
  return `<ellipse cx="0" cy="0" rx="52" ry="6" fill="#000000" opacity="0.12"/>`
    + `<path d="M-48,-10 V-56 A48,44 0 0 1 48,-56 V-10 Z" fill="#5d6fb3"/><path d="M8,-99.5 A48,44 0 0 1 48,-56 V-10 H22 V-62 A26,24 0 0 0 8,-82 Z" fill="#4a5a98"/>`
    + `<path d="M-30,-10 V-58 A30,26 0 0 1 30,-58 V-10 Z" fill="#2e3550"/><path d="M-10,-80 L-24,-12 H24 L10,-80 Z" fill="#c9cfdc" opacity="0.4"/>`
    + `<rect x="-27" y="-70" width="15" height="10" rx="2" fill="#e8ecf5"/><rect x="12" y="-70" width="15" height="10" rx="2" fill="#e8ecf5"/>`
    + `<rect x="-52" y="-12" width="104" height="12" rx="3.5" fill="#b9becf"/><rect x="-52" y="-12" width="104" height="4" rx="2" fill="#dcdfea"/>`
}
export function stage(kind) { return kind === 'kb' ? kbB() : kind === 'monster' ? monsterStage() : stanleyStage() }
export function lounge() {
  const deck = (y) => `<rect x="-62" y="${y}" width="124" height="26" rx="3" fill="#fff3dc"/>` + [-45, -20, 5, 30].map((x) => `<path d="M${x},${y + 22} l8,-14 l6,14" fill="none" stroke="#e08a2b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`).join('')
  return shadow(136, 5) + `<rect x="-68" y="-70" width="136" height="70" rx="4" fill="#f2a33a"/>${deck(-62)}${deck(-30)}<rect x="-68" y="-70" width="136" height="5" rx="2.5" fill="#f7c06e"/><rect x="40" y="-70" width="28" height="70" rx="4" fill="#000000" opacity="0.07"/>`
}
export function lush() { // rocky waterfall booth with trees, centred
  const trees = [-95, -68, -40, -12, 18, 48, 78, 100].map((x, i) => { const r = 11 + (i % 3) * 3, y = -30 - (i % 2) * 7
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="#4cb86a"/><path d="M${x - r},${y} A${r},${r} 0 0 0 ${x + r},${y} Z" fill="#3a9e57"/>` }).join('')
  const falls = [-80, -52, -24, 8, 40, 72].map((x) => `<rect x="${x}" y="-26" width="15" height="50" rx="6" fill="#a8e2f6"/><rect x="${x + 3}" y="-22" width="3" height="40" rx="1.5" fill="#ffffff" opacity="0.7"/>`).join('')
  return trees + `<rect x="-108" y="-30" width="216" height="58" rx="14" fill="#8a96a0"/><rect x="-108" y="-30" width="216" height="10" rx="5" fill="#a9b4bd"/>${falls}`
}
export function monsterBooth() {
  return shadow(56, 3) + `<rect x="-28" y="-22" width="56" height="22" rx="3.5" fill="#8bd450"/><rect x="-28" y="-26" width="56" height="7" rx="3" fill="#2f2b45"/><rect x="-21" y="-16" width="42" height="9" rx="2" fill="#ffffff"/>`
}
export function building() { // toilet building next to the parking lot
  return shadow(76, 4) + `<path d="M-38,-22 L-22,-50 H38 L22,-22 Z" fill="#7a5646"/>` + [-26, -12, 2, 16].map((x) => `<path d="M${x},-22 L${x + 16},-50" stroke="#8f6a58" stroke-width="2.4"/>`).join('')
    + `<rect x="-38" y="-22" width="60" height="22" rx="2" fill="#b08a70"/><rect x="-28" y="-16" width="9" height="16" rx="1.5" fill="#8c6a54"/><rect x="-6" y="-16" width="9" height="16" rx="1.5" fill="#8c6a54"/>`
}
export function shelter() { return shadow(32, 2.5) + `<rect x="-13" y="-22" width="2.6" height="22" rx="1.3" fill="#7a808c"/><rect x="10.4" y="-22" width="2.6" height="22" rx="1.3" fill="#7a808c"/><path d="M-17,-21 H17 L13,-29 H-13 Z" fill="${METAL}"/>` }
export function table(colour) { return shadow(26, 2) + `<rect x="-11" y="-7" width="2.4" height="7" rx="1" fill="${METAL}"/><rect x="8.6" y="-7" width="2.4" height="7" rx="1" fill="${METAL}"/><rect x="-14" y="-12" width="28" height="6" rx="2" fill="${colour}"/>` }
export function washStation() { return shadow(28, 2.5) + `<rect x="-14" y="-16" width="28" height="16" rx="2.5" fill="#dde1ea"/><rect x="-15" y="-20" width="30" height="5" rx="2" fill="#c3c8d4"/><path d="M-7,-20 v-6 h3.5 M4,-20 v-6 h3.5" fill="none" stroke="#9aa0ae" stroke-width="2" stroke-linecap="round"/>` }
export function charging() { return shadow(28, 2.5) + `<rect x="-14" y="-14" width="28" height="14" rx="2.5" fill="#ffd34d"/><rect x="-14" y="-14" width="28" height="3.5" rx="1.5" fill="#ffe38a"/><path d="M-17,-15 H17 L13,-23 H-13 Z" fill="#3dba6a"/><path d="M-13,-23 H13 L14.5,-20 H-14.5 Z" fill="#6fd392"/>` }
export function hut() { return shadow(26, 2.5) + `<rect x="-12" y="-18" width="24" height="18" rx="2" fill="#efc28d"/><rect x="-4" y="-11" width="8" height="11" rx="1.5" fill="#b9824c"/><path d="M-15.5,-17 L0,-28 L15.5,-17 Z" fill="#c98d52"/>` }
