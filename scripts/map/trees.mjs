import { assembleRings, isClosed, pointInRing } from './geo.mjs'

const ROAD_CLEARANCE_PX = 14
const GRID_PX = 62
const JITTER_PX = 22

// Deterministic so regenerating the map gives the same picture.
function mulberry32(seed) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const distToSegment = (px, py, [ax, ay], [bx, by]) => {
  const dx = bx - ax, dy = by - ay
  const len2 = dx * dx + dy * dy
  const t = len2 ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2)) : 0
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy))
}

/** Pixel spots for decorative trees: inside the park, off paths, water, buildings and the zone art. */
export function treeSpots(osm, proj, { exclusions, seed = 2026 }) {
  const byId = new Map(osm.ways.map((w) => [w.id, w]))
  const park = osm.relations.find((r) => r.tags.leisure === 'park')
  const parkRings = park ? assembleRings(park.outer.map((id) => byId.get(id)?.pts).filter(Boolean)) : []
  const blocked = osm.ways.filter((w) => isClosed(w.pts) && (w.tags.building || w.tags.natural === 'water' || w.tags.water || w.tags.leisure === 'pitch'))
  const waterRels = osm.relations
    .filter((r) => r.tags.natural === 'water')
    .flatMap((r) => assembleRings(r.outer.map((id) => byId.get(id)?.pts).filter(Boolean)))
  const toPx = ([lat, lng]) => [proj.x(lng), proj.y(lat)]
  const segments = osm.ways
    .filter((w) => w.tags.highway || w.tags.waterway)
    .flatMap((w) => w.pts.slice(1).map((p, i) => [toPx(w.pts[i]), toPx(p)]))

  const rand = mulberry32(seed)
  const spots = []
  for (let gy = GRID_PX / 2; gy < proj.height; gy += GRID_PX) {
    for (let gx = GRID_PX / 2; gx < proj.width; gx += GRID_PX) {
      const x = gx + (rand() - 0.5) * 2 * JITTER_PX
      const y = gy + (rand() - 0.5) * 2 * JITTER_PX
      const variant = Math.floor(rand() * 4)
      if (exclusions.some(([x0, y0, x1, y1]) => x >= x0 && x <= x1 && y >= y0 && y <= y1)) continue
      const ll = proj.toLatLng(x, y)
      if (!parkRings.some((ring) => pointInRing(ll, ring))) continue
      if (blocked.some((w) => pointInRing(ll, w.pts)) || waterRels.some((ring) => pointInRing(ll, ring))) continue
      if (segments.some(([a, b]) => distToSegment(x, y, a, b) < ROAD_CLEARANCE_PX)) continue
      spots.push({ x, y, variant })
    }
  }
  return spots
}
