import { assembleRings, centroid, isClosed, pointInRing } from './geo.mjs'

/** Palette sampled from the official festival map so the real-geography base matches the art. */
export const PALETTE = {
  paper: '#e1dfc6',
  grid: '#d8d5ba',
  park: '#adcf85',
  parkEdge: '#8fb466',
  water: '#9fd4e6',
  waterEdge: '#7fbfd6',
  building: '#f3efe0',
  buildingEdge: '#cfc6a8',
  cityBuilding: '#d6d1b6',
  roadCasing: '#cbc3a6',
  road: '#f6f3e8',
  street: '#f1eedf',
  walkway: '#ebe6e2',
  cityPath: '#d3cdb2',
  label: '#5b4a3a',
}

const MAJOR_ROADS = new Set(['trunk', 'primary', 'secondary', 'tertiary', 'primary_link', 'secondary_link'])
const STREETS = new Set(['residential', 'service', 'unclassified', 'living_street'])
const WALKWAYS = new Set(['footway', 'path', 'cycleway', 'pedestrian', 'steps', 'track'])
const GRID_PX = 28

const escapeXml = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

export function renderBaseSvg(osm, proj, { highlights, labels }) {
  const pts = (list) => list.map(([lat, lng]) => `${proj.x(lng).toFixed(1)},${proj.y(lat).toFixed(1)}`).join(' ')
  const byId = new Map(osm.ways.map((w) => [w.id, w]))
  const ringsOf = (rel, role) => assembleRings(rel[role].map((id) => byId.get(id)?.pts).filter(Boolean))
  const parkRel = osm.relations.find((r) => r.tags.leisure === 'park')
  const parkRings = parkRel ? ringsOf(parkRel, 'outer') : []
  const inPark = (p) => parkRings.some((ring) => pointInRing(p, ring))

  const layers = []
  layers.push(`<rect width="100%" height="100%" fill="${PALETTE.paper}"/>`)
  layers.push(
    `<defs><pattern id="grid" width="${GRID_PX}" height="${GRID_PX}" patternUnits="userSpaceOnUse"><path d="M ${GRID_PX} 0 L 0 0 0 ${GRID_PX}" fill="none" stroke="${PALETTE.grid}" stroke-width="1"/></pattern></defs><rect width="100%" height="100%" fill="url(#grid)"/>`,
  )
  for (const ring of parkRings) {
    layers.push(`<polygon points="${pts(ring)}" fill="${PALETTE.park}" stroke="${PALETTE.parkEdge}" stroke-width="7" stroke-linejoin="round"/>`)
  }
  for (const w of osm.ways) {
    if (w.tags.leisure === 'park' && isClosed(w.pts)) layers.push(`<polygon points="${pts(w.pts)}" fill="${PALETTE.park}"/>`)
  }

  const water = (ring) => `<polygon points="${pts(ring)}" fill="${PALETTE.water}" stroke="${PALETTE.waterEdge}" stroke-width="1.5"/>`
  for (const rel of osm.relations.filter((r) => r.tags.natural === 'water')) for (const ring of ringsOf(rel, 'outer')) layers.push(water(ring))
  for (const w of osm.ways) {
    if ((w.tags.natural === 'water' || w.tags.water) && isClosed(w.pts)) layers.push(water(w.pts))
    if (w.tags.waterway === 'stream' || w.tags.waterway === 'river') {
      layers.push(`<polyline points="${pts(w.pts)}" fill="none" stroke="${PALETTE.water}" stroke-width="7" stroke-linecap="round"/>`)
    }
  }

  // Like the official map: only the park's own landmarks are drawn; the city around it stays plain paper.
  for (const w of osm.ways) {
    if (!w.tags.building || !isClosed(w.pts) || !inPark(centroid(w.pts))) continue
    layers.push(`<polygon points="${pts(w.pts)}" fill="${PALETTE.building}" stroke="${PALETTE.buildingEdge}" stroke-width="1.2"/>`)
  }

  const line = (w, color, width) =>
    `<polyline points="${pts(w.pts)}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`
  const roads = osm.ways.filter((w) => MAJOR_ROADS.has(w.tags.highway))
  for (const w of osm.ways) {
    const h = w.tags.highway
    const park = inPark(centroid(w.pts))
    if (park && (WALKWAYS.has(h) || STREETS.has(h))) layers.push(line(w, PALETTE.walkway, 9))
    else if (STREETS.has(h)) layers.push(line(w, PALETTE.street, 7))
  }
  for (const w of roads) layers.push(line(w, PALETTE.roadCasing, 19))
  for (const w of roads) layers.push(line(w, PALETTE.road, 15))

  for (const { name, fill, stroke } of highlights) {
    const w = osm.ways.find((way) => way.tags.name === name && isClosed(way.pts))
    if (!w) throw new Error(`highlight feature not found in OSM extract: ${name}`)
    layers.push(`<polygon points="${pts(w.pts)}" fill="${fill}" ${stroke ? `stroke="${stroke}" stroke-width="2"` : ''}/>`)
  }

  for (const { name, text, size = 20, dx = 0, dy = 0 } of labels) {
    const w = osm.ways.find((way) => way.tags.name === name)
    if (!w) throw new Error(`label feature not found in OSM extract: ${name}`)
    const [lat, lng] = centroid(w.pts)
    layers.push(
      `<text x="${(proj.x(lng) + dx).toFixed(1)}" y="${(proj.y(lat) + dy).toFixed(1)}" font-family="Apple SD Gothic Neo, sans-serif" font-weight="800" font-size="${size}" fill="${PALETTE.label}" stroke="${PALETTE.paper}" stroke-width="4" paint-order="stroke" text-anchor="middle">${escapeXml(text ?? name)}</text>`,
    )
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${proj.width}" height="${proj.height}">${layers.join('')}</svg>`
}

export function findFeatureCentroid(osm, name) {
  const w = osm.ways.find((way) => way.tags.name === name)
  if (!w) throw new Error(`feature not found in OSM extract: ${name}`)
  return centroid(isClosed(w.pts) ? w.pts.slice(0, -1) : w.pts)
}
