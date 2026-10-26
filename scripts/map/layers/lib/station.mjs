// A subway station the way Korean street maps draw it: a box in the line's colour lying along the track, the exits
// around it, the name with a line badge past its northern end (clear of the exits). Found in OpenStreetMap from the exits near a point and the
// direction of the subway track there.
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]]
const len = (v) => Math.hypot(v[0], v[1])

/**
 * frame: lib/frame.mjs; near: [e, n] metres around the station; radius: how far its exits may be.
 * Returns the box centre on the track, the track direction (unit [e, n]), the exits, and where the name goes (just past
 * the box's northern end).
 */
export function findStation({ OSM, toM }, near, { radius = 120, length = 140 } = {}) {
  const exits = OSM.subwayEntrances.map((x) => ({ ...x, m: toM([x.lat, x.lng]) })).filter((x) => len(sub(x.m, near)) < radius)
  if (exits.length === 0) throw new Error(`no subway exits within ${radius} m of ${near}`)
  const middle = [exits.reduce((s, x) => s + x.m[0], 0) / exits.length, exits.reduce((s, x) => s + x.m[1], 0) / exits.length]
  let best = null
  for (const way of OSM.ways.filter((w) => w.tags?.railway === 'subway')) {
    const m = way.pts.map(toM)
    for (let i = 1; i < m.length; i++) {
      const d = sub(m[i], m[i - 1]), l2 = d[0] ** 2 + d[1] ** 2 || 1e-9
      const t = Math.max(0, Math.min(1, ((middle[0] - m[i - 1][0]) * d[0] + (middle[1] - m[i - 1][1]) * d[1]) / l2))
      const at = [m[i - 1][0] + t * d[0], m[i - 1][1] + t * d[1]]
      const gap = len(sub(at, middle))
      if (!best || gap < best.gap) best = { gap, at, dir: [d[0] / Math.sqrt(l2), d[1] / Math.sqrt(l2)] }
    }
  }
  if (!best || best.gap > radius) throw new Error(`no subway track near ${near}`)
  const north = best.dir[1] >= 0 ? best.dir : [-best.dir[0], -best.dir[1]]
  const nameAt = [best.at[0] + north[0] * (length / 2 + 14), best.at[1] + north[1] * (length / 2 + 14)]
  return { centre: best.at, dir: best.dir, exits, nameAt }
}

/** SVG of the station box in a north-up frame (1 unit = 1 m, y down from `north`, x from `west`). */
export function stationBoxSvg({ centre, dir }, { west, north }, { length = 140, width = 18, fill, outline }) {
  const angle = (Math.atan2(-dir[1], dir[0]) * 180) / Math.PI
  const [x, y] = [centre[0] - west, north - centre[1]]
  return `<rect x="${-length / 2}" y="${-width / 2}" width="${length}" height="${width}" rx="${width / 2}" fill="${fill}" stroke="${outline}" stroke-width="1.4" transform="translate(${x.toFixed(2)},${y.toFixed(2)}) rotate(${angle.toFixed(2)})"/>`
}
