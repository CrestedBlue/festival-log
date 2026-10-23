// Raster mask → smooth SVG outline helpers (d3-contour + Douglas–Peucker + centripetal Catmull–Rom).
import { contours } from 'd3-contour'

export function gaussianBlur(src, sigma, W, H) {
  const r = Math.ceil(sigma * 3), k = []
  let sum = 0
  for (let i = -r; i <= r; i++) { const v = Math.exp(-(i * i) / (2 * sigma * sigma)); k.push(v); sum += v }
  for (let i = 0; i < k.length; i++) k[i] /= sum
  const tmp = new Float32Array(W * H), out = new Float32Array(W * H)
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let s = 0; for (let i = -r; i <= r; i++) s += src[y * W + Math.min(W - 1, Math.max(0, x + i))] * k[i + r]; tmp[y * W + x] = s }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let s = 0; for (let i = -r; i <= r; i++) s += tmp[Math.min(H - 1, Math.max(0, y + i)) * W + x] * k[i + r]; out[y * W + x] = s }
  return out
}
export function simplify(points, tol) {
  if (points.length < 4) return points
  const keep = new Uint8Array(points.length); keep[0] = keep[points.length - 1] = 1
  const stack = [[0, points.length - 1]]
  while (stack.length) {
    const [a, b] = stack.pop(); const [ax, ay] = points[a], [bx, by] = points[b]
    const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1e-9
    let worst = -1, wd = tol
    for (let i = a + 1; i < b; i++) { const d = Math.abs(dy * points[i][0] - dx * points[i][1] + bx * ay - by * ax) / len; if (d > wd) { wd = d; worst = i } }
    if (worst > 0) { keep[worst] = 1; stack.push([a, worst], [worst, b]) }
  }
  return points.filter((_, i) => keep[i])
}
const f = (v) => +v.toFixed(2)
/** Centripetal Catmull–Rom through the points, as cubic Béziers. */
export function curve(points, closed) {
  const n = points.length
  if (n < 3) return `M${points.map((p) => p.map(f).join(',')).join('L')}${closed ? 'Z' : ''}`
  const P = (i) => (closed ? points[(i + n) % n] : points[Math.max(0, Math.min(n - 1, i))])
  let d = `M${f(points[0][0])},${f(points[0][1])}`
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2)
    const t01 = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) ** 0.5 || 1e-6, t12 = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) ** 0.5 || 1e-6, t23 = Math.hypot(p3[0] - p2[0], p3[1] - p2[1]) ** 0.5 || 1e-6
    const m1 = [0, 1].map((k) => t12 * ((p1[k] - p0[k]) / t01 - (p2[k] - p0[k]) / (t01 + t12) + (p2[k] - p1[k]) / t12))
    const m2 = [0, 1].map((k) => t12 * ((p2[k] - p1[k]) / t12 - (p3[k] - p1[k]) / (t12 + t23) + (p3[k] - p2[k]) / t23))
    d += `C${f(p1[0] + m1[0] / 3)},${f(p1[1] + m1[1] / 3)} ${f(p2[0] - m2[0] / 3)},${f(p2[1] - m2[1] / 3)} ${f(p2[0])},${f(p2[1])}`
  }
  return d + (closed ? 'Z' : '')
}
const ringArea = (ring) => { let a = 0; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) a += (ring[j][0] + ring[i][0]) * (ring[j][1] - ring[i][1]); return Math.abs(a / 2) }
/** A tracer for one frame: trace(mask) turns a 0/1 mask (Float32Array, W×H) into an SVG path in metres (y down from the
 *  frame's north edge). */
export const makeTracer = ({ W, H, PPM }) => function trace(mask, { sigma = 1.5, tolerance = 0.2, minAreaM2 = 2 } = {}) {
  const [mp] = contours().size([W, H]).smooth(true).thresholds([0.5])(gaussianBlur(mask, sigma, W, H))
  let d = ''
  for (const polygon of mp.coordinates) for (const ring of polygon) {
    const m = ring.map(([x, y]) => [x / PPM, y / PPM])
    if (ringArea(m) < minAreaM2) continue
    d += curve(simplify(m.slice(0, -1), tolerance), true)
  }
  return d
}
