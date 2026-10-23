// Official pins (map-src/gmf/markers.json, read off the official map earlier; their zones as in scripts/map/marks.mjs)
// → local metres (of the spot each pin points at) with the fit of each pin's zone.
//   node scripts/map/layers/gmf/pins-place.mjs   → cache pins-placed.json
import fs from 'node:fs'
import path from 'node:path'
import { officialToM } from './official-to-m.mjs'
import { CACHE, SRC } from './paths.mjs'

const TIP_DY = 17 // official px from a pin's head (where `s` is) down to its tip — the spot it points at
const pins = JSON.parse(fs.readFileSync(path.join(SRC, 'pins-official.json')))
const placed = pins.map((p) => {
  const tip = [p.s[0], p.s[1] + TIP_DY], m = officialToM(tip, p.zone)
  return { id: p.id, type: p.type, zone: p.zone, official: p.s, tip, m: m.map((v) => +v.toFixed(1)) }
})
fs.mkdirSync(CACHE, { recursive: true })
fs.writeFileSync(path.join(CACHE, 'pins-placed.json'), JSON.stringify(placed, null, 1))
console.log('pins placed', placed.length)
