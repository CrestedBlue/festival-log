// Layer 1 (ground) of WONDERLIVET's big area map (lib/big-layer1.mjs): KINTEX's second exhibition centre (halls 7–10),
// drawn as a block in the festival's orange, and the walks from 킨텍스역 and 대화역.
//   node scripts/map/layers/wonderlivet/big-layer1.mjs   → out/big-layer1-ground-north-up.svg, out/big-north-up-bounds.json
import { bigFrame } from './frame.mjs'
import { STATIONS } from './stations.mjs'
import { OUT, CACHE } from './paths.mjs'
import { VENUE } from './venue.mjs'
import { drawBigLayer1 } from '../lib/big-layer1.mjs'

await drawBigLayer1({ frame: bigFrame, venue: VENUE, out: OUT, cache: CACHE, stations: STATIONS })
