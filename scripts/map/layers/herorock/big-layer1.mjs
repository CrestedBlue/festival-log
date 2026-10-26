// Layer 1 (ground) of Hero Rock's big area map (lib/big-layer1.mjs): 송도컨벤시아 — the announced venue, drawn as a
// block in the festival's bronze gold — and the walks from the 인천 1호선 stations.
//   node scripts/map/layers/herorock/big-layer1.mjs   → out/big-layer1-ground-north-up.svg, out/big-north-up-bounds.json
import { bigFrame } from './frame.mjs'
import { STATIONS } from './stations.mjs'
import { OUT, CACHE } from './paths.mjs'
import { VENUE } from './venue.mjs'
import { drawBigLayer1 } from '../lib/big-layer1.mjs'

await drawBigLayer1({ frame: bigFrame, venue: VENUE, out: OUT, cache: CACHE, stations: STATIONS })
