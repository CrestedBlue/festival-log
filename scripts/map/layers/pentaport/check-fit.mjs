// How well the official map fits the real coordinates: scale, rotation and each control point's error after the
// similarity fit (rotation + scale + shift only, no bending).
//   node scripts/map/layers/pentaport/check-fit.mjs
import { CONTROL_POINTS, officialToM, SCALE_M_PER_PX, ROTATION_DEG } from './official-to-m.mjs'

console.log(`scale ${SCALE_M_PER_PX.toFixed(4)} m/px, rotation ${ROTATION_DEG.toFixed(1)}°`)
const errs = CONTROL_POINTS.map((c) => { const [e, n] = officialToM(c.s); return [c.name, Math.hypot(e - c.m[0], n - c.m[1])] })
for (const [name, d] of errs) console.log(`${d.toFixed(1).padStart(6)} m  ${name}`)
console.log(`RMS ${Math.sqrt(errs.reduce((s, [, d]) => s + d * d, 0) / errs.length).toFixed(1)} m`)
