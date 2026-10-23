// Layer 2 (operational objects): flat sprites (style B) at the official positions, as SVG in the official frame and
// north-up (label positions from layout-north-up.mjs). Positions: objects.mjs; drawings: sprites.mjs; how: lib/layer2.mjs.
//   node scripts/map/layers/pentaport/layer2.mjs
import { BOX } from './frame.mjs'
import * as SP from './sprites.mjs'
import { GROUPS } from './objects.mjs'
import * as geometry from './geometry.mjs'
import { OUT, CACHE } from './paths.mjs'
import { drawLayer2 } from '../lib/layer2.mjs'

await drawLayer2({ GROUPS, SP, geometry, BOX, CACHE, OUT, officialView: { width: 1080, height: 1350 }, extraTexts: [[SP.BANNER, 8.5, 'en']] })
