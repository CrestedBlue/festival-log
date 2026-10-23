// Official pins → local metres with the shared similarity fit (so in the official view each pin stays on its own pixel).
// Tried and dropped: bending with extra zone centres (pushed edge pins ~40 m into the wrong zone) and snapping each
// pin to the ground colour around it on the official map (tents and roads in that colour misplaced them).
//   node scripts/map/layers/pentaport/pins-place.mjs   → cache pins-placed.json
import fs from 'node:fs'
import path from 'node:path'
import { officialToM, mToOfficial } from './official-to-m.mjs'
import { CACHE, SRC } from './paths.mjs'

const pins = JSON.parse(fs.readFileSync(path.join(SRC, 'pins-official.json')))
const placed = pins.map((p) => { const m = officialToM(p.s); return { id: p.id, type: p.type, official: p.s, m: m.map((v) => +v.toFixed(1)), view: mToOfficial(m).map((v) => +v.toFixed(1)) } })
fs.mkdirSync(CACHE, { recursive: true })
fs.writeFileSync(path.join(CACHE, 'pins-placed.json'), JSON.stringify(placed, null, 1))
console.log('pins placed', placed.length)
