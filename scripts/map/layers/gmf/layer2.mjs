// Layer 2 (operational objects) for GMF: flat sprites (style B), north-up only (the official map is a schematic, so
// there is no official-frame version). Positions: objects.mjs (each carried with its zone's fit); drawings: sprites.mjs;
// label positions from layout-north-up.mjs; how: lib/layer2.mjs.
//   node scripts/map/layers/gmf/layer2.mjs
import { BOX } from './frame.mjs'
import * as SP from './sprites.mjs'
import { GROUPS } from './objects.mjs'
import * as geometry from './geometry.mjs'
import { OUT, CACHE } from './paths.mjs'
import { drawLayer2 } from '../lib/layer2.mjs'

await drawLayer2({ GROUPS, SP, geometry, BOX, CACHE, OUT })
