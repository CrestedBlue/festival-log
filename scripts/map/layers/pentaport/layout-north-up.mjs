// North-up layout of the Pentaport labels and pins (lib/layout.mjs): which pin marks which object, and pin sizes.
//   node scripts/map/layers/pentaport/layout-north-up.mjs   (after pins-place.mjs) → cache labels-northup.json, pins-northup.json
import { toLL, BOX } from './frame.mjs'
import { CACHE } from './paths.mjs'
import * as SP from './sprites.mjs'
import { GROUPS } from './objects.mjs'
import * as geometry from './geometry.mjs'
import { layoutNorthUp } from '../lib/layout.mjs'
import { R, GATE_R } from './pin-design.mjs'

const PIN_R = (type) => (type === 'gate' ? GATE_R : R)
const MARKS = { toilet: ['toiletPair'], accessibleToilet: ['accessibleToilet'], nursingRoom: ['hut'], charging: ['charging'], coolZone: ['dome', 'pool'], mainCoolZone: ['dome'],
  medical: ['tent:의료', 'table'], pentaDreamer: ['tent:펜타 드리머'], promotionBooth: ['tent:홍보 부스'], vendorBooth: ['tent:벤더'], bar: ['tent:주류·라운지'], fnb: ['tent:F&B', 'umbrellaTable'],
  waterBar: ['tent:주류·라운지', 'table'], interpretation: ['table'], info: ['table'], kiosk: ['kiosk'], securityCheck: ['container:물품검색'], lockers: ['container:물품보관'],
  washStation: ['washStation', 'building'], police: ['tent:경찰'], fireStation: ['tent:소방'], officialMd: ['stripedTent'], artistMd: ['tent:아티스트MD'], smoking: ['shelter'], gate: ['arch'] }

await layoutNorthUp({ GROUPS, SP, geometry, toLL, BOX, CACHE,
  pinSize: (type) => { const r = PIN_R(type); return [2 * r, 2 * r + 3] },
  marks: MARKS, near: 90, big: new Set(['stage', 'lounge', 'lush', 'arch', 'building']), first: { gate: 0, mainCoolZone: 1 } })
