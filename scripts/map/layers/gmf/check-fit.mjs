// How well the official map fits real coordinates: first one similarity for the whole map (fails for GMF: it is a
// schematic), then the per-zone affine fits used for layers 2 and 3 (their landmark errors).
//   node scripts/map/layers/gmf/check-fit.mjs
import { CONTROL_POINTS, officialToM } from './official-to-m.mjs'

const P = CONTROL_POINTS.map((c) => [c.s[0], -c.s[1]]), Q = CONTROL_POINTS.map((c) => c.m), n = P.length
const mp = P.reduce((a, b) => [a[0] + b[0] / n, a[1] + b[1] / n], [0, 0]), mq = Q.reduce((a, b) => [a[0] + b[0] / n, a[1] + b[1] / n], [0, 0])
let sxx = 0, sxy = 0, spp = 0
for (let i = 0; i < n; i++) { const px = P[i][0] - mp[0], py = P[i][1] - mp[1], qx = Q[i][0] - mq[0], qy = Q[i][1] - mq[1]; sxx += px * qx + py * qy; sxy += px * qy - py * qx; spp += px * px + py * py }
const a = sxx / spp, b = sxy / spp
const sim = ([x, y]) => { const X = x - mp[0], Y = -y - mp[1]; return [a * X - b * Y + mq[0], b * X + a * Y + mq[1]] }
const rms = (errs) => Math.sqrt(errs.reduce((s, d) => s + d * d, 0) / errs.length).toFixed(1)
const simErr = CONTROL_POINTS.map((c) => { const [e, nn] = sim(c.s); return Math.hypot(e - c.m[0], nn - c.m[1]) })
console.log(`one similarity for the whole map: ${Math.hypot(a, b).toFixed(3)} m/px, ${((Math.atan2(b, a) * 180) / Math.PI).toFixed(1)}°, RMS ${rms(simErr)} m`)
const ZONE_OF = { 'MINT BREEZE': 'mintBreeze', MAIN: 'mintBreeze', '88잔디마당': 'mintBreeze', LOVING: 'lovingForest', CLUB: 'clubMidnight', 'GATE 2': 'clubMidnight', ART: 'artZone', TICKET: 'ticketBooth', RADAR: 'hungryEast' }
const zoneErr = CONTROL_POINTS.map((c) => { const zone = Object.entries(ZONE_OF).find(([k]) => c.name.startsWith(k))?.[1] ?? 'between'; const [e, nn] = officialToM(c.s, zone); const d = Math.hypot(e - c.m[0], nn - c.m[1]); console.log(`${d.toFixed(1).padStart(6)} m  ${c.name}  (${zone})`); return d })
console.log(`per-zone fits: RMS ${rms(zoneErr)} m`)
