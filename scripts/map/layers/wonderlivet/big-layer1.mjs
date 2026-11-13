// Layer 1 (ground) of the KINTEX big area map (lib/big-layer1.mjs) for the festivals in these halls whose own map is
// still to come (CDF, THE GLOW): KINTEX's second exhibition centre (halls 6–10) drawn as a block in WONDERLIVET's
// orange (it was drawn for WONDERLIVET first), and the walks from 킨텍스역 and 대화역.
//   node scripts/map/layers/wonderlivet/big-layer1.mjs   → out-kintex/big-layer1-ground-north-up.svg, out-kintex/big-north-up-bounds.json
import fs from 'node:fs'
import { bigFrame } from './frame.mjs'
import { STATIONS } from './stations.mjs'
import { OUT_KINTEX, CACHE } from './paths.mjs'
import { VENUE } from './venue.mjs'
import { drawBigLayer1 } from '../lib/big-layer1.mjs'

fs.mkdirSync(OUT_KINTEX, { recursive: true })
await drawBigLayer1({ frame: bigFrame, venue: VENUE, out: OUT_KINTEX, cache: CACHE, stations: STATIONS })
