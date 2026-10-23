// Pentaport's own sprites — its stages and booths — on top of the shared ones (lib/sprites.mjs), which this re-exports.
import { shadow } from '../lib/sprites.mjs'
import { kbB } from './kb-variants.mjs'

export * from '../lib/sprites.mjs'
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
