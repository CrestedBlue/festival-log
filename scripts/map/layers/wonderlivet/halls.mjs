// The halls of KINTEX's second exhibition centre in local metres (frame.mjs), and the official 2026 festival map's
// pixels laid onto them.
//
// Where the halls are: KINTEX's own floor plans (kintex.com, 제2전시장 전시홀, read 2026-11-12) — two rows facing each
// other across the lobby: halls 6, 7, 8 on the south-east side (7 and 8 each 126 m along the row, 90 m across), halls
// 10 and 9 on the north-west side (each 132 × 99 m, set at a slight angle to each other); hall 6 and hall 10 at the
// north-north-east end (towards the plaza with the entrances A–C, 킨텍스역 and the first exhibition centre). The rows
// are put on the building's outline in OpenStreetMap (relation 6921083): its long outer walls and short end walls,
// with the strips of service rooms the plans draw outside the halls (about 15 m outside, 11–16 m on the lobby side).
//
// The official festival map (map-src/wonderlivet/official-map-2026.jpg) draws the halls as two isometric blocks of
// the same size (7·8 and 9·10) with the 1F lobby between them and the 2F lobby apart, at the top right; the GTX end
// at the bottom left is the north-north-east end. It is not to scale (the blocks are much wider than the halls), so
// each block gets its own affine fit from its corners onto its halls (as GMF's zones do: MAP.md, 배치도형), and the
// 9·10 block one per hall, its two halls being at an angle. The lobby (between the blocks) and the 2F lobby use fits
// over the halls' lobby-side corners.
import { frame } from './frame.mjs'

const { OSM, toM } = frame
const OUTLINE = OSM.relations.find((r) => r.id === '6921083').outer.flatMap((id) => OSM.ways.find((w) => w.id === id).pts.map(toM))
/** The building's outline point nearest a rough spot (so the halls follow the OSM outline, not numbers typed in). */
const corner = ([e, n]) => OUTLINE.reduce((best, p) => (Math.hypot(p[0] - e, p[1] - n) < Math.hypot(best[0] - e, best[1] - n) ? p : best))
const unit = ([e, n]) => { const l = Math.hypot(e, n); return [e / l, n / l] }
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]]
/** A row of halls: from `origin` (a corner on the outer wall), `t` metres along `along`, `s` metres in towards the lobby. */
const row = (origin, along, across) => (t, s) => [origin[0] + along[0] * t + across[0] * s, origin[1] + along[1] * t + across[1] * s]

// the south-east row (6·7·8): its outer wall's south-south-west corner, along the wall to the north-north-east, in
// across the south-south-west end wall
const SE = corner([90, -214])
const se = row(SE, unit(sub(corner([190, -39]), SE)), unit(sub(corner([-16, -155]), SE)))
// the north-west row: hall 9 from its outer corner at the south-south-west end, hall 10 from the one at the other end
const NW9 = corner([-232, -25]), NW10 = corner([-105, 213])
const h9 = row(NW9, unit(sub(corner([-188, 35]), NW9)), unit(sub(corner([-131, -100]), NW9)))
const h10 = row(NW10, unit(sub(corner([-140, 113]), NW10)), unit(sub(corner([19, 167]), NW10)))

/** The rows as functions (t metres along from the outer corner, s metres in towards the lobby) → [e, n]. */
export const ROWS = { se, h9, h10 }

const H78 = { t: [10, 262], s: [15, 105] } // 8 then 7 (126 m each), 90 m across
const H9 = { t: [8, 140], s: [13, 112] }
const H10 = H9
const rect = (f, { t, s }) => [f(t[0], s[0]), f(t[1], s[0]), f(t[1], s[1]), f(t[0], s[1])]

/** The halls as rectangles [[e, n] × 4] (hall 6 is not used). */
export const HALLS = {
  h78: rect(se, H78),
  h7: rect(se, { t: [136, H78.t[1]], s: H78.s }),
  h8: rect(se, { t: [H78.t[0], 136], s: H78.s }),
  h9: rect(h9, H9),
  h10: rect(h10, H10),
}

// the halls' corners: NNE / SSW end, outer / lobby side
const C = {
  h78NneOut: se(H78.t[1], H78.s[0]), h78SswOut: se(H78.t[0], H78.s[0]), h78SswIn: se(H78.t[0], H78.s[1]), h78NneIn: se(H78.t[1], H78.s[1]),
  h10NneIn: h10(H10.t[0], H10.s[1]), h10SswIn: h10(H10.t[1], H10.s[1]), h10SswOut: h10(H10.t[1], H10.s[0]), h10NneOut: h10(H10.t[0], H10.s[0]),
  h9NneIn: h9(H9.t[1], H9.s[1]), h9SswIn: h9(H9.t[0], H9.s[1]), h9SswOut: h9(H9.t[0], H9.s[0]), h9NneOut: h9(H9.t[1], H9.s[0]),
}

/**
 * The 1F lobby between the rows, from the halls' lobby-side walls (with the service strips beside them) to the glass
 * fronts on the two plazas (OpenStreetMap: the north-east plaza's curve, the south-west plaza's edge), and on along
 * hall 10's lobby side behind the glass on the north-east plaza (KINTEX's plan has the lobby run there too).
 */
const between = (a, b) => OUTLINE.slice(Math.min(a, b), Math.max(a, b) + 1)
const at = (p) => OUTLINE.indexOf(corner(p))
// from the 7·8 row round the plaza, then along the glass front of hall 10's lobby side to its north-north-east end
const neFront = between(at([134, 75]), at([19, 167]))
const swEdge = between(at([-131, -100]), at([-16, -155]))
export const LOBBY = [
  C.h78NneIn, ...neFront,
  C.h10NneIn, C.h10SswIn, C.h9NneIn, C.h9SswIn,
  ...swEdge, C.h78SswIn,
]

// Corners of the official map's blocks (px, read on the orange outlines; the 9·10 block's far corner hidden under the
// booth icons is the parallelogram's).
const BLOCK78 = { nneOut: [249, 938], sswOut: [648, 726], sswIn: [876, 849], nneIn: [477, 1061] }
const BLOCK910 = { nneIn: [664, 1193], sswIn: [1064, 969], sswOut: [1281, 1079], nneOut: [881, 1303] }
const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
const BLOCK2F = { nne78: [738.6, 603.4], ssw78: [1043.4, 429], ssw910: [1345.5, 605.5], nne910: [1040.3, 779.9] }

const solve3 = (rows, values) => {
  const ata = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], atb = [0, 0, 0]
  rows.forEach((r, i) => { for (let j = 0; j < 3; j++) { atb[j] += r[j] * values[i]; for (let k = 0; k < 3; k++) ata[j][k] += r[j] * r[k] } })
  const m = ata.map((r, i) => [...r, atb[i]])
  for (let i = 0; i < 3; i++) {
    let p = i
    for (let r = i + 1; r < 3; r++) if (Math.abs(m[r][i]) > Math.abs(m[p][i])) p = r
    ;[m[i], m[p]] = [m[p], m[i]]
    for (let r = 0; r < 3; r++) { if (r === i) continue; const f = m[r][i] / m[i][i]; for (let c = i; c < 4; c++) m[r][c] -= f * m[i][c] }
  }
  return m.map((r, i) => r[3] / r[i])
}
const fitAffine = (pairs) => {
  const rows = pairs.map(([[x, y]]) => [x, y, 1])
  const ax = solve3(rows, pairs.map(([, [e]]) => e)), ay = solve3(rows, pairs.map(([, [, n]]) => n))
  const f = ([x, y]) => [ax[0] * x + ax[1] * y + ax[2], ay[0] * x + ay[1] * y + ay[2]]
  f.error = pairs.reduce((s, [p, q]) => s + Math.hypot(f(p)[0] - q[0], f(p)[1] - q[1]), 0) / pairs.length
  return f
}
const FITS = {
  h78: fitAffine([[BLOCK78.nneOut, C.h78NneOut], [BLOCK78.sswOut, C.h78SswOut], [BLOCK78.sswIn, C.h78SswIn], [BLOCK78.nneIn, C.h78NneIn]]),
  h10: fitAffine([[BLOCK910.nneIn, C.h10NneIn], [mid(BLOCK910.nneIn, BLOCK910.sswIn), C.h10SswIn], [mid(BLOCK910.nneOut, BLOCK910.sswOut), C.h10SswOut], [BLOCK910.nneOut, C.h10NneOut]]),
  h9: fitAffine([[mid(BLOCK910.nneIn, BLOCK910.sswIn), C.h9NneIn], [BLOCK910.sswIn, C.h9SswIn], [BLOCK910.sswOut, C.h9SswOut], [mid(BLOCK910.nneOut, BLOCK910.sswOut), C.h9NneOut]]),
  // the 1F lobby: the blocks' lobby-side corners onto the halls'
  lobby: fitAffine([[BLOCK78.nneIn, C.h78NneIn], [BLOCK78.sswIn, C.h78SswIn], [BLOCK910.nneIn, C.h10NneIn], [BLOCK910.sswIn, C.h9SswIn]]),
  // the 2F lobby over it: its sides along halls 7·8 and 10·9 onto the same corners
  lobby2F: fitAffine([[BLOCK2F.nne78, C.h78NneIn], [BLOCK2F.ssw78, C.h78SswIn], [BLOCK2F.nne910, C.h10NneIn], [BLOCK2F.ssw910, C.h9SswIn]]),
}
export const FIT_ERRORS = Object.fromEntries(Object.entries(FITS).map(([k, f]) => [k, +f.error.toFixed(1)]))

/** Official map pixel → local metres, with the fit of the block (or lobby) it is drawn in. */
export const officialToM = (px, zone) => {
  const f = FITS[zone]
  if (!f) throw new Error(`no fit for ${zone}`)
  return f(px)
}
