// GMF's own sprites — its three stages — on top of the shared ones (lib/sprites.mjs), which this re-exports.
export * from '../lib/sprites.mjs'

function mintStage() { // MINT BREEZE: teal roof, mint screen, two side screens
  const side = (x) => `<rect x="${x}" y="-92" width="34" height="26" rx="3" fill="#ffe082"/><rect x="${x + 3}" y="-89" width="28" height="20" rx="2" fill="#fff3c4"/>`
  return `<ellipse cx="0" cy="0" rx="96" ry="7" fill="#000000" opacity="0.12"/>`
    + `<rect x="-62" y="-118" width="124" height="14" rx="4" fill="#2f6f66"/><rect x="-62" y="-118" width="124" height="4" rx="2" fill="#4c9a8e"/>`
    + `<rect x="-56" y="-104" width="10" height="84" rx="3" fill="#2f2b45"/><rect x="46" y="-104" width="10" height="84" rx="3" fill="#2f2b45"/>`
    + `<rect x="-46" y="-104" width="92" height="82" rx="4" fill="#7fe0c8"/><rect x="-46" y="-62" width="92" height="40" rx="4" fill="#2bb39a"/>`
    + `<path d="M-14,-104 L0,-104 L18,-22 L-30,-22 Z" fill="#ffffff" opacity="0.25"/>` + side(-96) + side(62)
    + `<rect x="-100" y="-24" width="200" height="14" rx="4" fill="#5cc4ad"/><rect x="-100" y="-12" width="200" height="12" rx="3" fill="#2f9c86"/>`
}
function lfgStage() { // LOVING FOREST GARDEN: pink shell over a white stage, seat rows in front
  const rows = [0, 1, 2].map((i) => `<path d="M${-52 + i * 6},${-6 + i * 0} q${52 - i * 6},${14 - i * 2} ${104 - i * 12},0" fill="none" stroke="#e86f98" stroke-width="5" stroke-linecap="round" transform="translate(0,${-i * 8})"/>`).join('')
  return `<ellipse cx="0" cy="0" rx="64" ry="6" fill="#000000" opacity="0.12"/>`
    + `<path d="M-48,-30 V-72 A48,40 0 0 1 48,-72 V-30 Z" fill="#f9b8cf"/><path d="M10,-111 A48,40 0 0 1 48,-72 V-30 H26 V-70 A26,22 0 0 0 10,-88 Z" fill="#f48fb1"/>`
    + `<rect x="-36" y="-70" width="72" height="34" rx="4" fill="#ffffff"/><rect x="-52" y="-36" width="104" height="10" rx="3" fill="#ffffff"/><rect x="-52" y="-28" width="104" height="4" rx="2" fill="#e6d3da"/>` + rows
}
function cmsStage() { // CLUB MIDNIGHT SUNSET (inside KSPO DOME): brown box stage, warm lights
  const lamp = (x) => `<rect x="${x}" y="-74" width="12" height="16" rx="2" fill="#2f2b45"/><circle cx="${x + 6}" cy="-66" r="3.5" fill="#ffd166"/>`
  return `<ellipse cx="0" cy="0" rx="62" ry="6" fill="#000000" opacity="0.12"/>`
    + `<path d="M-60,-84 L0,-104 L60,-84 Z" fill="#a8604a"/><path d="M0,-104 L60,-84 L20,-84 Z" fill="#8a4a38"/>`
    + `<rect x="-56" y="-84" width="112" height="60" rx="3" fill="#6b3a2c"/><rect x="-48" y="-78" width="96" height="48" rx="3" fill="#3a2230"/>`
    + `<path d="M-20,-78 L-8,-78 L8,-30 L-36,-30 Z" fill="#ffd166" opacity="0.35"/><path d="M8,-78 L20,-78 L36,-30 L-8,-30 Z" fill="#ffd166" opacity="0.35"/>`
    + lamp(-44) + lamp(32) + `<rect x="-60" y="-24" width="120" height="12" rx="3" fill="#c08a72"/><rect x="-60" y="-12" width="120" height="12" rx="3" fill="#8a5a46"/>`
}
const STAGES = { mint: mintStage, lfg: lfgStage, cms: cmsStage }
export function stage(kind) { const f = STAGES[kind]; if (!f) throw new Error(`no stage ${kind}`); return f() }
