// Three design directions for the KB국민카드 STAGE sprite (anchor = front centre of the stage on the ground).
const BANNER = 'PENTAPORT ROCK FESTIVAL 2026'
const EN = 'Arial Black, Arial, sans-serif'
const pts = (list) => list.map((p) => p.map((v) => +v.toFixed(2)).join(',')).join(' ')

// A — 2.5D: front faces true to size, depth going up-right, three tones per material.
export function kbA() {
  const P = (x, d, z) => [x + d * 0.5, -z - d * 0.36]
  const box = (x0, x1, d0, d1, z0, z1, c) =>
    `<polygon points="${pts([P(x1, d0, z0), P(x1, d1, z0), P(x1, d1, z1), P(x1, d0, z1)])}" fill="${c.side}"/>`
    + `<polygon points="${pts([P(x0, d0, z1), P(x1, d0, z1), P(x1, d1, z1), P(x0, d1, z1)])}" fill="${c.top}"/>`
    + `<polygon points="${pts([P(x0, d0, z0), P(x1, d0, z0), P(x1, d0, z1), P(x0, d0, z1)])}" fill="${c.front}"/>`
  const frame = { front: '#34304a', top: '#4a4566', side: '#26233a' }
  const deck = { front: '#cdd1de', top: '#e8eaf2', side: '#aeb3c4' }
  const roof = { front: '#5b3fb8', top: '#7a5fd6', side: '#45309a' }
  const [dx, dy] = P(10, 64, 92)
  const dome = `<clipPath id="kbA-dome"><circle cx="${dx}" cy="${dy}" r="60"/></clipPath>`
    + `<circle cx="${dx}" cy="${dy}" r="60" fill="#2ec4b6"/>`
    + `<g clip-path="url(#kbA-dome)" stroke="#1e9e92" stroke-width="2" fill="none">${[-40, -20, 0, 20, 40].map((o) => `<ellipse cx="${dx}" cy="${dy}" rx="${Math.abs(o) * 1.5 + 4}" ry="60"/>`).join('')}${[-40, -20].map((o) => `<line x1="${dx - 70}" y1="${dy + o}" x2="${dx + 70}" y2="${dy + o}"/>`).join('')}</g>`
    + `<path d="M${dx - 42},${dy - 40} A60,60 0 0 1 ${dx + 10},${dy - 58}" stroke="#7de3d8" stroke-width="4" fill="none" stroke-linecap="round"/>`
  const speakers = (x) => [30, 52, 74, 96].map((z) => { const [cx, cy] = P(x, 4, z); return `<circle cx="${cx}" cy="${cy}" r="7" fill="#1f1c2e" stroke="#5a5478" stroke-width="2.5"/>` }).join('')
  const [s0x, s0y] = P(-78, 34, 96), [s1x, s1y] = P(78, 34, 12)
  const screen = `<linearGradient id="kbA-screen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8b7cff"/><stop offset="1" stop-color="#4f3fd6"/></linearGradient>`
    + `<rect x="${s0x}" y="${s0y}" width="${s1x - s0x}" height="${s1y - s0y}" fill="url(#kbA-screen)"/>`
  const beam = (x) => `<polygon points="${pts([P(x - 4, 22, 104), P(x + 4, 22, 104), P(x + 26, 10, 12), P(x - 26, 10, 12)])}" fill="#fff3c4" opacity="0.35"/>`
  const flames = Array.from({ length: 11 }, (_, i) => { const x = -100 + i * 20, [fx, fy] = P(x, 0, 116), h = i % 2 ? 13 : 19
    return `<path d="M${fx - 9},${fy} C${fx - 9},${fy - h * 0.5} ${fx - 2},${fy - h * 0.7} ${fx},${fy - h} C${fx + 2},${fy - h * 0.7} ${fx + 9},${fy - h * 0.5} ${fx + 9},${fy} Z" fill="#ff6b3d"/><path d="M${fx - 4},${fy} C${fx - 4},${fy - h * 0.35} ${fx},${fy - h * 0.45} ${fx},${fy - h * 0.6} C${fx},${fy - h * 0.45} ${fx + 4},${fy - h * 0.35} ${fx + 4},${fy} Z" fill="#ffc14d"/>` }).join('')
  const [bx, by] = P(0, 0, 110)
  return `<g>${dome}<ellipse cx="${P(0, 22, 0)[0]}" cy="${P(0, 22, 0)[1] + 2}" rx="122" ry="16" fill="#000" opacity="0.14"/>`
    + box(-100, 100, 0, 44, 0, 12, deck) + screen + box(-100, -78, 4, 34, 12, 104, frame) + speakers(-89) + box(78, 100, 4, 34, 12, 104, frame) + speakers(89)
    + beam(-40) + beam(40) + box(-106, 106, 0, 40, 104, 116, roof) + flames
    + `<text x="${bx}" y="${by + 3}" text-anchor="middle" font-family="${EN}" font-size="8" fill="#ffffff">${BANNER}</text></g>`
}

// B — flat illustration: no outlines, shading with tones of the same hue, rounded corners.
export function kbB() {
  const flames = Array.from({ length: 11 }, (_, i) => { const x = -100 + i * 20, y = -120, h = i % 2 ? 12 : 18
    return `<path d="M${x - 9},${y} C${x - 9},${y - h * 0.5} ${x - 2},${y - h * 0.7} ${x},${y - h} C${x + 2},${y - h * 0.7} ${x + 9},${y - h * 0.5} ${x + 9},${y} Z" fill="#ff7a45"/><path d="M${x - 4},${y} C${x - 4},${y - h * 0.35} ${x},${y - h * 0.45} ${x},${y - h * 0.6} C${x},${y - h * 0.45} ${x + 4},${y - h * 0.35} ${x + 4},${y} Z" fill="#ffc94d"/>` }).join('')
  const tower = (x) => `<rect x="${x}" y="-96" width="26" height="80" rx="5" fill="#2f2b45"/>` + [-80, -58, -36].map((y) => `<circle cx="${x + 13}" cy="${y}" r="8" fill="#4a4566"/><circle cx="${x + 13}" cy="${y}" r="3.2" fill="#1f1c2e"/>`).join('')
  let zig = 'M-100,-110'; for (let x = -100; x < 100; x += 8) zig += ` L${x + 4},-118 L${x + 8},-110`
  return `<g><linearGradient id="kbB-screen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a7bff"/><stop offset="1" stop-color="#5a49e0"/></linearGradient>`
    + `<clipPath id="kbB-dome"><path d="M-62,-110 A62,62 0 0 1 62,-110 Z"/></clipPath>`
    + `<path d="M-62,-110 A62,62 0 0 1 62,-110 Z" fill="#2ec4b6"/><g clip-path="url(#kbB-dome)" stroke="#5fd9cc" stroke-width="2.4" fill="none">${[-36, -12, 12, 36].map((x) => `<path d="M${x},-110 Q${x * 0.4},-150 ${x * 0.2},-175"/>`).join('')}<path d="M-70,-140 Q0,-128 70,-140"/><path d="M-70,-160 Q0,-150 70,-160"/></g>`
    + `<ellipse cx="0" cy="0" rx="112" ry="8" fill="#000" opacity="0.12"/>`
    + flames + `<rect x="-106" y="-122" width="212" height="16" rx="4" fill="#2f2b45"/><path d="${zig}" stroke="#4a4566" stroke-width="1.6" fill="none" stroke-linejoin="round"/>`
    + `<rect x="-92" y="-106" width="184" height="12" rx="3" fill="#6a4bd8"/><text x="0" y="-97" text-anchor="middle" font-family="${EN}" font-size="7.5" fill="#ffffff">${BANNER}</text>`
    + tower(-102) + tower(76)
    + `<rect x="-74" y="-94" width="148" height="76" rx="5" fill="url(#kbB-screen)"/>`
    + `<path d="M-30,-94 L-14,-94 L6,-18 L-56,-18 Z" fill="#ffffff" opacity="0.18"/><path d="M14,-94 L30,-94 L56,-18 L-6,-18 Z" fill="#ffffff" opacity="0.18"/>`
    + `<path d="M0,-74 l3,7 7,1 -5.2,4.8 1.4,7.2 -6.2,-3.6 -6.2,3.6 1.4,-7.2 -5.2,-4.8 7,-1 Z" fill="#ffd166"/>`
    + `<rect x="-108" y="-22" width="216" height="16" rx="4" fill="#dcdfea"/><rect x="-108" y="-10" width="216" height="10" rx="3" fill="#b9becf"/></g>`
}

// C — pictogram marker: a white stage symbol in a rounded purple badge that points at the spot.
export function kbC() {
  return `<g><linearGradient id="kbC-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7b5cf0"/><stop offset="1" stop-color="#5a3dc4"/></linearGradient>`
    + `<ellipse cx="0" cy="0" rx="20" ry="5" fill="#000" opacity="0.18"/>`
    + `<path d="M-12,-24 L0,-4 L12,-24 Z" fill="#5a3dc4"/>`
    + `<rect x="-48" y="-118" width="96" height="96" rx="26" fill="url(#kbC-bg)"/><rect x="-43" y="-113" width="86" height="86" rx="22" fill="none" stroke="#ffffff" stroke-opacity="0.28" stroke-width="2"/>`
    + `<g fill="#ffffff"><rect x="-32" y="-97" width="64" height="8" rx="3"/>`
    + `<rect x="-34" y="-86" width="13" height="40" rx="3.5"/><rect x="21" y="-86" width="13" height="40" rx="3.5"/>`
    + `<rect x="-16" y="-86" width="32" height="28" rx="4" opacity="0.92"/><rect x="-36" y="-44" width="72" height="8" rx="3"/></g>`
    + [-76, -60].map((y) => `<circle cx="-27.5" cy="${y}" r="3.6" fill="#6a4bd8"/><circle cx="27.5" cy="${y}" r="3.6" fill="#6a4bd8"/>`).join('')
    + `<path d="M0,-80 l2.4,5.4 5.8,0.7 -4.3,3.9 1.2,5.8 -5.1,-2.9 -5.1,2.9 1.2,-5.8 -4.3,-3.9 5.8,-0.7 Z" fill="#ffc94d"/>`
    + `<path d="M34,-124 l3,7 7,3 -7,3 -3,7 -3,-7 -7,-3 7,-3 Z" fill="#ffc94d"/></g>`
}
export const KB_VARIANTS = { A: kbA, B: kbB, C: kbC }
