// Layer 3 (pins) for GMF: the official map's teardrop pins (pin-design.mjs), north-up only (positions from
// layout-north-up.mjs), and the pins' coordinates for the app (lib/pins.mjs).
//   node scripts/map/layers/gmf/layer3.mjs
import { BOX, toLL } from './frame.mjs'
import { OUT, CACHE } from './paths.mjs'
import { PX_TO_M } from './geometry.mjs'
import { TYPES, pin } from './pin-design.mjs'
import { drawLayer3 } from '../lib/pins.mjs'

await drawLayer3({ TYPES, draw: pin, PX_TO_M, BOX, toLL, CACHE, OUT,
  idPrefix: 'gmf-pin-', source: '2026 Grand Mint Festival official site map pins; lat/lng = the facility each pin marks (its layer 2 object), else the spot the pin points at (per-zone fit, about ±17 m)',
  legend: { cols: 8, cell: 100, scale: 2, top: 40, background: '#e9e4cf' } })
