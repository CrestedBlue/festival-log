// Layer 1 (ground) of the big area map (lib/big-layer1.mjs): the walk from 송도달빛축제공원역 and the shuttle stops to
// the venue.
//   node scripts/map/layers/pentaport/big-layer1.mjs   (after layer1.mjs) → out/big-layer1-ground-north-up.svg, out/big-north-up-bounds.json
import { bigFrame, BOX } from './frame.mjs'
import { STATIONS } from './stations.mjs'
import { OUT, CACHE } from './paths.mjs'
import { drawBigLayer1 } from '../lib/big-layer1.mjs'

await drawBigLayer1({ frame: bigFrame, venue: { small: BOX }, out: OUT, cache: CACHE, stations: STATIONS })
