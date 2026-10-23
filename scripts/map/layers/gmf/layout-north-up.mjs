// North-up layout of the GMF labels and pins (lib/layout.mjs). Every object and pin is carried by the fit of its own
// zone; pins with no drawn facility (toilets, water, …) keep their own place. GMF stalls stand close together, so pins
// are laid out tidy (off other stalls, never below what they mark when they can).
//   node scripts/map/layers/gmf/layout-north-up.mjs   (after pins-place.mjs) → cache labels-northup.json, pins-northup.json
import { toLL, BOX } from './frame.mjs'
import { CACHE } from './paths.mjs'
import * as SP from './sprites.mjs'
import { GROUPS } from './objects.mjs'
import * as geometry from './geometry.mjs'
import { layoutNorthUp } from '../lib/layout.mjs'
import { PIN_R, PIN_TAIL } from './pin-design.mjs'

const MARKS = { sponsor: ['tent:스폰서'], fnb: ['tent:F&B', 'tent:푸드'], eating: ['table'], photo: ['hut:포토 부스'], firstaid: ['hut:의료부스'], smoking: ['shelter'],
  radar: ['flag:RADAR'], slogan: ['tent:민트샵'], shop: ['tent:민트샵'], artist: ['tent:Artist & Label · Vinyl'], vinyl: ['tent:Artist & Label · Vinyl'], info: ['tent:인포'], wristband: ['hut:티켓 부스'] }

await layoutNorthUp({ GROUPS, SP, geometry, toLL, BOX, CACHE,
  pinSize: () => [2 * PIN_R, 2 * PIN_R + PIN_TAIL],
  marks: MARKS, near: 70, big: new Set(['stage', 'arch', 'sign']), tidy: true })
