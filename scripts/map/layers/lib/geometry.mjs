// Where layer 2 sprites sit: visual centre relative to the anchor, size, and the north-up frame (used by layer2 and the
// north-up layout). Sprite pixels unless said otherwise; an object's `k` scales its sprite.
export const PX_TO_M = 0.4496 // sprite pixel in metres on the north-up maps (Pentaport's official-map scale; the same on every map)
const LIFT = { tent: (w = 42) => 0.36 * w + 2.5, stripedTent: () => 18, dome: (w = 52) => 0.3 * w, pool: () => 12, container: () => 10, toiletPair: () => 13, accessibleToilet: () => 13,
  kiosk: () => 14, tower: () => 28, campTent: () => 10, umbrellaTable: () => 21, sign: () => 35,
  building: () => 25, shelter: () => 14, table: () => 6, washStation: () => 11, charging: () => 12, hut: () => 14, arch: () => 40, label: () => 0, blanket: () => 0 }
const SIZE = { tent: (w = 42) => [w, 0.72 * w + 5], stripedTent: () => [44, 37], dome: (w = 52) => [w, 0.6 * w], pool: () => [50, 24], container: () => [28, 18], toiletPair: () => [28, 26], accessibleToilet: () => [18, 26],
  kiosk: () => [12, 28], tower: () => [28, 56], campTent: () => [34, 22], umbrellaTable: () => [36, 45],
  building: () => [76, 50], shelter: () => [34, 29], table: () => [28, 12], washStation: () => [30, 26], charging: () => [34, 23], hut: () => [31, 28], arch: () => [56, 79], blanket: () => [30, 16] }
const arg0 = (it) => (it.kind === 'tent' ? it.args?.[3] : it.args?.[0]) // tent args: base, light, dark, width
const k = (it) => it.k ?? 1

/**
 * BOX: frame box; officialToM(s, zone): official px → local metres; SP: the festival's sprites (for measured text);
 * stages: { kind: { lift, size } } of its stage sprites; kinds: the same for its other own sprites.
 */
export function makeGeometry({ BOX, officialToM, SP, stages, kinds = {} }) {
  const own = (key) => Object.fromEntries(Object.entries(kinds).map(([n, v]) => [n, () => v[key]]))
  const pick = (key) => (s) => { if (!stages[s]) throw new Error(`no stage ${s}`); return stages[s][key] }
  const lifts = { ...LIFT, ...own('lift'), stage: pick('lift') }
  const sizes = { ...SIZE, ...own('size'), stage: pick('size') }
  const toNorthUp = (s, zone) => { const [e, n] = officialToM(s, zone); return [e - BOX.west, BOX.north - n] }
  const measured = (t, size, font) => SP.MEASURED.get(SP.textKey(t, size, font))
  const flagBox = (it) => { const [t, , o = {}] = it.args; const size = o.size ?? 13, pole = o.pole ?? 62; const w = measured(t, size, 'kr') + 18; return { c: [(o.left ? -1 : 1) * (w / 2 - 3), -pole + 11], wh: [w, 22] } }
  const labelSize = (it) => { const [parts, o = {}] = it.args; const size = o.size ?? 13; return [parts.reduce((s, [t, , f]) => s + measured(t, size, f), 0) + size * 0.45 * (parts.length - 1) + 26, 26] }
  const signW = (it) => measured(it.args[0], it.args[2]?.size ?? 11, 'en') + 14
  /** Visual centre of the sprite relative to its anchor. */
  function centreOffset(it) {
    if (it.kind === 'flag') return flagBox(it).c.map((v) => v * k(it))
    const lift = lifts[it.kind]; if (!lift) throw new Error(`no centre for ${it.kind}`)
    return [0, -lift(arg0(it)) * k(it)]
  }
  /** Width and height of the sprite (for flags: the pennant). */
  function sizeOf(it) {
    if (it.kind === 'flag') return flagBox(it).wh.map((v) => v * k(it))
    if (it.kind === 'label') return labelSize(it).map((v) => v * k(it))
    if (it.kind === 'sign') return [signW(it) * k(it), 44 * k(it)]
    const f = sizes[it.kind]; if (!f) throw new Error(`no size for ${it.kind}`)
    return f(arg0(it)).map((v) => v * k(it))
  }
  return { PX_TO_M, toNorthUp, centreOffset, sizeOf, labelSize }
}
