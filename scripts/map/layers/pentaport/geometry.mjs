// Where layer 2 sprites sit: visual centre relative to the anchor, size, and the north-up frame (shared by
// layer2.mjs and layout-north-up.mjs). Official-map pixels unless said otherwise.
import { BOX } from './frame.mjs'
import { officialToM } from './official-to-m.mjs'
import * as SP from './sprites.mjs'

export const PX_TO_M = 0.4496 // official map pixel in metres
export const toNorthUp = (s) => { const [e, n] = officialToM(s); return [e - BOX.west, BOX.north - n] }
const LIFT = { tent: (w = 42) => 0.36 * w + 2.5, stripedTent: () => 18, dome: (w = 52) => 0.3 * w, pool: () => 12, container: () => 10, toiletPair: () => 13, accessibleToilet: () => 13,
  kiosk: () => 14, tower: () => 28, campTent: () => 10, umbrellaTable: () => 21, stage: (k) => ({ monster: 65, kb: 88, stanley: 50 })[k], lounge: () => 35, monsterBooth: () => 13,
  building: () => 25, shelter: () => 14, table: () => 6, washStation: () => 11, charging: () => 12, hut: () => 14, arch: () => 40, lush: () => 0, label: () => 0, blanket: () => 0 }
const SIZE = { tent: (w = 42) => [w, 0.72 * w + 5], stripedTent: () => [44, 37], dome: (w = 52) => [w, 0.6 * w], pool: () => [50, 24], container: () => [28, 18], toiletPair: () => [28, 26], accessibleToilet: () => [18, 26],
  kiosk: () => [12, 28], tower: () => [28, 56], campTent: () => [34, 22], umbrellaTable: () => [36, 45], stage: (k) => ({ monster: [160, 130], kb: [216, 175], stanley: [104, 100] })[k], lounge: () => [136, 70],
  monsterBooth: () => [56, 26], building: () => [76, 50], shelter: () => [34, 29], table: () => [28, 12], washStation: () => [30, 26], charging: () => [34, 23], hut: () => [31, 28], arch: () => [56, 79], lush: () => [216, 90], blanket: () => [30, 16] }
const arg0 = (it) => (it.kind === 'tent' ? it.args?.[3] : it.args?.[0]) // tent args: base, light, dark, width
const flagBox = (it) => { const [t, , o = {}] = it.args; const size = o.size ?? 13, pole = o.pole ?? 62; const w = SP.MEASURED.get(SP.textKey(t, size, 'kr')) + 18; return { c: [w / 2 - 3, -pole + 11], wh: [w, 22] } }
export const labelSize = (it) => { const [parts, o = {}] = it.args; const size = o.size ?? 13; return [parts.reduce((s, [t, , f]) => s + SP.MEASURED.get(SP.textKey(t, size, f)), 0) + size * 0.45 * (parts.length - 1) + 26, 26] }
/** Visual centre of the sprite relative to its anchor. */
export function centreOffset(it) {
  if (it.kind === 'flag') return flagBox(it).c
  const lift = LIFT[it.kind]; if (!lift) throw new Error(`no centre for ${it.kind}`)
  return [0, -lift(arg0(it))]
}
/** Width and height of the sprite (for flags: the pennant). */
export function sizeOf(it) {
  if (it.kind === 'flag') return flagBox(it).wh
  if (it.kind === 'label') return labelSize(it)
  const f = SIZE[it.kind]; if (!f) throw new Error(`no size for ${it.kind}`)
  return f(arg0(it))
}
