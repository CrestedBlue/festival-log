/** Local equirectangular projection. Over ~2km the gap to Web Mercator is far below one pixel. */
export function createProjection(bounds, pxPerMeter) {
  const lat0 = ((bounds.south + bounds.north) / 2) * (Math.PI / 180)
  const mPerDegLat = 111_320
  const mPerDegLng = 111_320 * Math.cos(lat0)
  const width = Math.round((bounds.east - bounds.west) * mPerDegLng * pxPerMeter)
  const height = Math.round((bounds.north - bounds.south) * mPerDegLat * pxPerMeter)
  const x = (lng) => ((lng - bounds.west) / (bounds.east - bounds.west)) * width
  const y = (lat) => ((bounds.north - lat) / (bounds.north - bounds.south)) * height
  const toLatLng = (px, py) => [
    +(bounds.north - (py / height) * (bounds.north - bounds.south)).toFixed(6),
    +(bounds.west + (px / width) * (bounds.east - bounds.west)).toFixed(6),
  ]
  return { width, height, x, y, toLatLng }
}

const samePoint = (a, b) => a[0] === b[0] && a[1] === b[1]

/** Joins multipolygon member ways end-to-end into closed rings. */
export function assembleRings(wayPointLists) {
  const pending = wayPointLists.map((pts) => [...pts])
  const rings = []
  while (pending.length > 0) {
    let ring = pending.shift()
    let extended = true
    while (!samePoint(ring[0], ring.at(-1)) && extended) {
      extended = false
      for (let i = 0; i < pending.length; i++) {
        const next = pending[i]
        if (samePoint(ring.at(-1), next[0])) ring = [...ring, ...next.slice(1)]
        else if (samePoint(ring.at(-1), next.at(-1))) ring = [...ring, ...next.slice(0, -1).reverse()]
        else continue
        pending.splice(i, 1)
        extended = true
        break
      }
    }
    rings.push(ring)
  }
  return rings
}

export function pointInRing([lat, lng], ring) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [yi, xi] = ring[i]
    const [yj, xj] = ring[j]
    if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

export const centroid = (pts) => [
  pts.reduce((sum, p) => sum + p[0], 0) / pts.length,
  pts.reduce((sum, p) => sum + p[1], 0) / pts.length,
]

export const isClosed = (pts) => pts.length > 3 && samePoint(pts[0], pts.at(-1))
