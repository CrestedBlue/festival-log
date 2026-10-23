// Pentaport's sprite geometry (lib/geometry.mjs) with its own stages and booths. The official map is a plan, so one
// similarity fit carries everything (no zones).
import { BOX } from './frame.mjs'
import { officialToM } from './official-to-m.mjs'
import * as SP from './sprites.mjs'
import { makeGeometry } from '../lib/geometry.mjs'

export const { PX_TO_M, toNorthUp, centreOffset, sizeOf, labelSize } = makeGeometry({ BOX, officialToM, SP,
  stages: { monster: { lift: 65, size: [160, 130] }, kb: { lift: 88, size: [216, 175] }, stanley: { lift: 50, size: [104, 100] } },
  kinds: { lounge: { lift: 35, size: [136, 70] }, monsterBooth: { lift: 13, size: [56, 26] }, lush: { lift: 0, size: [216, 90] } },
})
