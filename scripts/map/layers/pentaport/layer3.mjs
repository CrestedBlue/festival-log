// Layer 3 (pins): the official map's round badges (pin-design.mjs) at the official positions. Writes the official-frame
// SVG (1080×1350), the north-up one in metres (positions from layout-north-up.mjs) and the pins' coordinates for the
// app (lib/pins.mjs).
//   node scripts/map/layers/pentaport/layer3.mjs
import { BOX, toLL } from './frame.mjs'
import { OUT, CACHE } from './paths.mjs'
import { PX_TO_M } from './geometry.mjs'
import { TYPES, badge } from './pin-design.mjs'
import { drawLayer3 } from '../lib/pins.mjs'

await drawLayer3({ TYPES, draw: badge, PX_TO_M, BOX, toLL, CACHE, OUT, officialView: { width: 1080, height: 1350 },
  idPrefix: 'pentaport-pin-', source: '2026 Pentaport official site map pins; lat/lng = the facility each pin marks (its layer 2 object), else the pin itself (similarity fit, about ±15 m)',
  legend: { cols: 9, cell: 110, scale: 1.6, top: 46, background: '#fff' } })
