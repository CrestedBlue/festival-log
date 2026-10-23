// North-up layout of the layer 2 labels and the layer 3 pins. Objects stand at their real places; each label goes
// next to the thing it names, each pin next to the facility it marks (same on-screen offset as on the official map
// when free), trying spots around it until it overlaps no other pin or label. Writes positions only; the layers are
// drawn by layer2.mjs / layer3.mjs (never merged).
//   node scripts/map/layers/pentaport/layout-north-up.mjs   (after pins-place.mjs) → cache labels-northup.json, pins-northup.json
import fs from 'node:fs'
import path from 'node:path'
import { sharp, toLL, BOX } from './frame.mjs'
import { CACHE } from './paths.mjs'
import * as SP from './sprites.mjs'
import { GROUPS } from './objects.mjs'
import { centreOffset, sizeOf, toNorthUp, PX_TO_M as K } from './geometry.mjs'

const PINS = JSON.parse(fs.readFileSync(path.join(CACHE, 'pins-placed.json')))
const PIN_R = (type) => (type === 'gate' ? 24.5 : 19.5)
const GAP = 3 // px between neighbours

async function measure(text, size, font) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.ceil(size * text.length * 1.6 + 40)}" height="${Math.ceil(size * 2)}"><text x="10" y="${size * 1.3}" font-family="${SP.FONTS[font]}" font-weight="900" font-size="${size}" fill="#000">${text}</text></svg>`
  const { info } = await sharp(Buffer.from(svg), { density: 288 }).trim().toBuffer({ resolveWithObject: true })
  return info.width / 4
}
for (const grp of GROUPS) for (const it of grp.items) {
  if (it.kind === 'label') { const size = it.args[1]?.size ?? 13; for (const [t, , f] of it.args[0]) SP.MEASURED.set(SP.textKey(t, size, f), await measure(t, size, f)) }
  if (it.kind === 'flag') { const size = it.args[2]?.size ?? 13; SP.MEASURED.set(SP.textKey(it.args[0], size, 'kr'), await measure(it.args[0], size, 'kr')) }
}

const add = (p, q, k = 1) => [p[0] + q[0] * k, p[1] + q[1] * k]
const box = (c, [w, h]) => ({ x0: c[0] - (w * K) / 2, x1: c[0] + (w * K) / 2, y0: c[1] - (h * K) / 2, y1: c[1] + (h * K) / 2 })
const hits = (a, b, m = GAP * K) => a.x0 < b.x1 + m && b.x0 < a.x1 + m && a.y0 < b.y1 + m && b.y0 < a.y1 + m

// Objects at their real places (centre in the north-up frame, metres).
const objects = []
GROUPS.forEach((g) => g.items.forEach((it, i) => {
  if (it.kind === 'route' || it.kind === 'label') return
  const official = add(it.s, centreOffset(it))
  objects.push({ key: `${g.id}:${i}`, it, official, c: toNorthUp(official), size: sizeOf(it), group: g.id })
}))
const BIG = new Set(['stage', 'lounge', 'lush', 'arch', 'building'])
const placed = [] // boxes of labels and pins already placed
const blockers = objects.filter((o) => BIG.has(o.it.kind) || o.it.kind === 'flag').map((o) => ({ ...box(o.c, o.size), who: o.key }))
const free = (b, ignore) => !placed.some((p) => hits(b, p)) && !blockers.some((p) => p.who !== ignore && hits(b, p))
const overlapArea = (a, b) => Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)) * Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0))
const crowding = (b, ignore) => placed.reduce((s, p) => s + overlapArea(b, p), 0) + blockers.filter((p) => p.who !== ignore).reduce((s, p) => s + overlapArea(b, p), 0)
// first free spot; if none is free, the least crowded one
const pick = (spots, size, ignore) => spots.find((c) => free(box(c, size), ignore)) || spots.map((c) => ({ c, v: crowding(box(c, size), ignore) })).sort((a, b) => a.v - b.v)[0].c
// candidate centres around an object: above, right, left, below, then corners, then a step further out
function around(o, [w, h]) {
  const [ow, oh] = o.size, out = []
  for (const extra of [0, 12, 24, 36, 48]) {
    const dx = ((ow + w) / 2 + GAP + extra) * K, dy = ((oh + h) / 2 + GAP + extra) * K
    out.push([0, -dy], [dx, 0], [-dx, 0], [0, dy], [dx, -dy], [-dx, -dy], [dx, dy], [-dx, dy])
  }
  return out.map((d) => add(o.c, d))
}

// 1) labels, next to the thing they name — first only where they cover no object at all; the rest wait until the
//    pins are placed and then take the nearest spot clear of pins, labels and big objects
const labels = {}
const byId = new Map(objects.filter((o) => o.it.id).map((o) => [o.it.id, o]))
const labelItems = []
GROUPS.forEach((g) => g.items.forEach((it, i) => { if (it.kind === 'label') labelItems.push({ key: `${g.id}:${i}`, it, parent: byId.get(it.of), size: sizeOf(it) }) }))
const deferred = []
// a stage's name may also sit on the stage's top edge (over the truss), as on the official map
const onTop = (L) => (L.parent.it.kind === 'stage' ? [0, 16, 32, 48].flatMap((down) => [0, 24, -24].map((dx) => add(L.parent.c, [dx * K, (-(L.parent.size[1] / 2) + down) * K]))) : [])
// preferred order: above, (stage top edge), below, right, left — no corners
const firstChoices = (L) => { const [up, right, left, below] = around(L.parent, L.size); return [up, ...onTop(L), below, right, left] }
for (const L of labelItems) {
  const others = objects.filter((o) => o.key !== L.parent.key && o.it.kind !== 'blanket').map((o) => box(o.c, o.size))
  const spot = firstChoices(L).find((c) => free(box(c, L.size), L.parent.key) && !others.some((b) => hits(box(c, L.size), b, 0)))
  if (spot) { labels[L.key] = spot.map((v) => +v.toFixed(2)); placed.push(box(spot, L.size)) } else deferred.push(L)
}

// 2) pins, next to the facility they mark
const MARKS = { toilet: ['toiletPair'], accessibleToilet: ['accessibleToilet'], nursingRoom: ['hut'], charging: ['charging'], coolZone: ['dome', 'pool'], mainCoolZone: ['dome'],
  medical: ['tent:의료', 'table'], pentaDreamer: ['tent:펜타 드리머'], promotionBooth: ['tent:홍보 부스'], vendorBooth: ['tent:벤더'], bar: ['tent:주류·라운지'], fnb: ['tent:F&B', 'umbrellaTable'],
  waterBar: ['tent:주류·라운지', 'table'], interpretation: ['table'], info: ['table'], kiosk: ['kiosk'], securityCheck: ['container:물품검색'], lockers: ['container:물품보관'],
  washStation: ['washStation', 'building'], police: ['tent:경찰'], fireStation: ['tent:소방'], officialMd: ['stripedTent'], artistMd: ['tent:아티스트MD'], smoking: ['shelter'], gate: ['arch'] }
const matches = (o, spec) => { const [kind, tag] = spec.split(':'); return o.it.kind === kind && (!tag || o.it.tag === tag) }
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1])
const FIRST = { gate: 0, mainCoolZone: 1 }
const order = [...PINS].sort((a, b) => (FIRST[a.type] ?? 2) - (FIRST[b.type] ?? 2))
const pins = {}
for (const p of order) {
  const r = PIN_R(p.type), size = [2 * r, 2 * r + 3]
  const specs = MARKS[p.type] || []
  const cands = objects.filter((o) => specs.some((s) => matches(o, s))).map((o) => ({ o, d: dist(o.official, p.official) })).filter((x) => x.d < 90).sort((a, b) => a.d - b.d)
  const o = cands[0]?.o
  let spots
  if (o) {
    const prefer = add(o.c, [p.official[0] - o.official[0], p.official[1] - o.official[1]], K) // same on-screen offset as on the official map
    spots = [prefer, ...around(o, size)]
  } else {
    const at = toNorthUp(p.official) // an area marker (barrier-free zone/pass): its own spot
    spots = [at, ...[1, 2, 3, 4].flatMap((k) => [[0, -1], [1, 0], [-1, 0], [0, 1]].map(([dx, dy]) => add(at, [dx * k * 18 * K, dy * k * 18 * K])))]
  }
  const spot = pick(spots, size, o?.key)
  if (process.env.DEBUG_PIN === String(p.id)) { const b = box(spots[0], size); console.log('pin', p.id, 'facility', o?.key, o?.c, 'prefer', spots[0], 'chosen', spot); console.log(' placed hits', placed.filter((q) => hits(b, q)).length, 'blocker hits', blockers.filter((q) => q.who !== o?.key && hits(b, q)).map((q) => q.who)) }
  placed.push(box(spot, size))
  const facility = o ? o.c : toNorthUp(p.official)
  const [lat, lng] = toLL([facility[0] + BOX.west, BOX.north - facility[1]])
  pins[p.id] = { badge: spot.map((v) => +v.toFixed(2)), marks: o ? o.key : null, facility: [+lat.toFixed(6), +lng.toFixed(6)] }
}
for (const L of deferred) {
  const spot = pick([...firstChoices(L), ...around(L.parent, L.size)], L.size, L.parent.key)
  labels[L.key] = spot.map((v) => +v.toFixed(2)); placed.push(box(spot, L.size))
}
fs.writeFileSync(path.join(CACHE, 'labels-northup.json'), JSON.stringify(labels, null, 1))
fs.writeFileSync(path.join(CACHE, 'pins-northup.json'), JSON.stringify(pins, null, 1))
const linked = Object.values(pins).filter((x) => x.marks).length
const moved = PINS.filter((p) => { const o = objects.find((x) => x.key === pins[p.id].marks); if (!o) return false; const pref = add(o.c, [p.official[0] - o.official[0], p.official[1] - o.official[1]], K); return dist(pref, pins[p.id].badge) > 0.1 })
console.log('labels', Object.keys(labels).length, '| pins', PINS.length, 'linked to a facility', linked, '| moved off their official offset to avoid overlap:', moved.map((p) => `#${p.id} ${p.type}`).join(', ') || 'none')
