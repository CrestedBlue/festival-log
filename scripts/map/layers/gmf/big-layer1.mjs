// Layer 1 (ground) of the big area map (lib/big-layer1.mjs): Olympic Park and the walks from 몽촌토성역, 한성백제역 and
// 올림픽공원역 to the venue.
//   node scripts/map/layers/gmf/big-layer1.mjs   (after layer1.mjs) → out/big-layer1-ground-north-up.svg, out/big-north-up-bounds.json
import { bigFrame, BOX } from './frame.mjs'
import { STATIONS } from './stations.mjs'
import { OUT, CACHE } from './paths.mjs'
import { drawBigLayer1 } from '../lib/big-layer1.mjs'

await drawBigLayer1({ frame: bigFrame, venue: { small: BOX }, out: OUT, cache: CACHE, stations: STATIONS })
