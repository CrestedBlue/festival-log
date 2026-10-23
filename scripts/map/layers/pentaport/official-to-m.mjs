// Official-map pixel ↔ local metres, with the similarity fit (rotation + scale + shift) of the control points.
// Shared by all three layers, so they line up exactly.
import fs from 'node:fs'
import path from 'node:path'
import { SRC } from './paths.mjs'

export const CONTROL_POINTS = JSON.parse(fs.readFileSync(path.join(SRC, 'control-points.json'))) // [{ name, s: [x, y] official px, m: [east, north] metres }]
const P = CONTROL_POINTS.map((c) => [c.s[0], -c.s[1]]), Q = CONTROL_POINTS.map((c) => c.m), n = P.length
const mp = P.reduce((a, b) => [a[0] + b[0] / n, a[1] + b[1] / n], [0, 0]), mq = Q.reduce((a, b) => [a[0] + b[0] / n, a[1] + b[1] / n], [0, 0])
let sxx = 0, sxy = 0, spp = 0
for (let i = 0; i < n; i++) { const px = P[i][0] - mp[0], py = P[i][1] - mp[1], qx = Q[i][0] - mq[0], qy = Q[i][1] - mq[1]; sxx += px * qx + py * qy; sxy += px * qy - py * qx; spp += px * px + py * py }
const a = sxx / spp, b = sxy / spp, det = a * a + b * b
export const officialToM = ([x, y]) => { const X = x - mp[0], Y = -y - mp[1]; return [a * X - b * Y + mq[0], b * X + a * Y + mq[1]] }
export const mToOfficial = ([e, nn]) => { const X = e - mq[0], Y = nn - mq[1]; return [(a * X + b * Y) / det + mp[0], -((-b * X + a * Y) / det + mp[1])] }
export const SCALE_M_PER_PX = Math.hypot(a, b)
export const ROTATION_DEG = (Math.atan2(b, a) * 180) / Math.PI
