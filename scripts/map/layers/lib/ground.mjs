// Layer 1 (ground) building blocks shared by every festival: masks, paths as one shape, zone outlines, and writing
// the north-up SVG with where it sits on the earth.
import fs from 'node:fs'
import path from 'node:path'

export const PATH_WIDTH = { service: 8, footway: 6, cycleway: 4, steps: 4, pedestrian: 6, track: 4 } // metres, by OSM highway
const PATH_WIDTH_OTHER = 5

/** frame: lib/frame.mjs */
export function makeGround({ sharp, W, H, PPM, BOX, toPx, toLL, trace, curve }) {
  /** Alpha mask (W×H bytes) of an SVG body drawn on the frame canvas. */
  const maskOf = async (svgBody) => sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${svgBody}</svg>`)).ensureAlpha().extractChannel(3).raw().toBuffer()
  const blurU8 = async (buf, sigma) => sharp(buf, { raw: { width: W, height: H, channels: 1 } }).blur(sigma).extractChannel(0).raw().toBuffer()
  /** 0/1 mask for the tracer from a per-pixel test. */
  const toF = (test) => { const m = new Float32Array(W * H); for (let i = 0; i < W * H; i++) m[i] = test(i) ? 1 : 0; return m }

  /** Join each loose path end to the path it nearly touches (within snapM metres). ways: [{ pts: [[e, n]] }], changed in place. */
  function joinLooseEnds(ways, snapM) {
    const nearestOnOthers = (p, self) => {
      let best = null
      for (const w of ways) { if (w === self) continue
        for (let i = 1; i < w.pts.length; i++) { const a = w.pts[i - 1], b = w.pts[i]; const dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy || 1e-9
          const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2)); const c = [a[0] + t * dx, a[1] + t * dy]; const d = Math.hypot(c[0] - p[0], c[1] - p[1])
          if (!best || d < best.d) best = { c, d } } }
      return best
    }
    let joined = 0
    for (const w of ways) for (const end of ['start', 'end']) {
      const p = end === 'start' ? w.pts[0] : w.pts[w.pts.length - 1]; const near = nearestOnOthers(p, w)
      if (near && near.d > 0.05 && near.d < snapM) { if (end === 'start') w.pts.unshift(near.c); else w.pts.push(near.c); joined++ }
    }
    return joined
  }
  /** SVG strokes of the paths at their real widths (put them in a group with stroke and round caps). */
  const pathStrokes = (ways) => ways.map((w) => `<path d="${curve(w.pts.map(toPx), false)}" stroke-width="${(w.width ?? PATH_WIDTH[w.hw] ?? PATH_WIDTH_OTHER) * PPM}"/>`).join('')
  /** Paths as one shape: close by ~1.5 m so junctions meet without notches, then open by ~0.8 m to drop thin hooks;
   *  keep(i) says which pixels may stay (inside the venue). */
  async function closeOpen(buf, keep) {
    let g = Buffer.from((await blurU8(buf, 1.5 * PPM)).map((v) => (v > 70 ? 255 : 0)))
    g = Buffer.from((await blurU8(g, 1.5 * PPM)).map((v) => (v > 185 ? 255 : 0)))
    g = Buffer.from((await blurU8(g, 0.8 * PPM)).map((v) => (v > 185 ? 255 : 0)))
    return Buffer.from((await blurU8(g, 0.8 * PPM)).map((v, i) => (v > 70 && keep(i) ? 255 : 0)))
  }
  /** One <g> per zone class, traced from the per-pixel classes. */
  const zoneGroups = (order, labels, cls, C, colour) => order.map((name) => { const d = trace(toF((i) => cls[i] === C[name])); return d ? `<g id="zone-${name}" data-name="${labels[name]}" fill="${colour[name]}" stroke="${colour[name]}" stroke-width="0.4" stroke-linejoin="round"><path fill-rule="evenodd" d="${d}"/></g>` : '' }).join('\n')

  /** Write the north-up SVG (1 unit = 1 m), the classes (cache) and north-up-bounds.json; returns the SVG. */
  function writeNorthUp({ content, cls, colour, out, cache }) {
    const VW = BOX.east - BOX.west, VH = BOX.north - BOX.south
    const northUp = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${VW} ${VH}">\n${content}\n</svg>\n`
    fs.mkdirSync(out, { recursive: true }); fs.mkdirSync(cache, { recursive: true })
    fs.writeFileSync(path.join(out, 'layer1-ground-north-up.svg'), northUp)
    fs.writeFileSync(path.join(cache, 'layer1-classes.bin'), Buffer.from(cls.buffer))
    const [south, west] = toLL([BOX.west, BOX.south]), [north, east] = toLL([BOX.east, BOX.north])
    fs.writeFileSync(path.join(out, 'north-up-bounds.json'), `${JSON.stringify({ size: [W, H], pxPerMeter: PPM, svgUnits: '1 unit = 1 m, origin at the north-west corner of bounds, y grows southward', bounds: [[+south.toFixed(6), +west.toFixed(6)], [+north.toFixed(6), +east.toFixed(6)]], colours: colour }, null, 2)}\n`)
    return northUp
  }
  /** Zone areas in m² (for the log). */
  const areas = (cls, CLASSES) => { const a = Object.fromEntries(CLASSES.map(([n]) => [n, 0])); for (let i = 0; i < W * H; i++) if (cls[i] >= 0) a[CLASSES[cls[i]][0]] += 1 / (PPM * PPM); return Object.fromEntries(Object.entries(a).map(([k, v]) => [k, Math.round(v)])) }
  return { maskOf, blurU8, toF, joinLooseEnds, pathStrokes, closeOpen, zoneGroups, writeNorthUp, areas }
}
