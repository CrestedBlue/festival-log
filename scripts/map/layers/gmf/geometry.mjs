// GMF's sprite geometry (lib/geometry.mjs) with its own stages. Each object is carried by its zone's fit.
import { BOX } from './frame.mjs'
import { officialToM } from './official-to-m.mjs'
import * as SP from './sprites.mjs'
import { makeGeometry } from '../lib/geometry.mjs'

export const { PX_TO_M, toNorthUp, centreOffset, sizeOf, labelSize } = makeGeometry({ BOX, officialToM, SP,
  stages: { mint: { lift: 59, size: [200, 120] }, lfg: { lift: 55, size: [130, 112] }, cms: { lift: 52, size: [124, 104] } },
})
