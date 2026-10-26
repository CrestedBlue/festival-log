// Layer 1 (ground) of a festival's big area map: the walk from the stations (and stops) to the venue, in real shapes
// (OSM) — roads at real widths as one shape with pale kerbs, parks, pitches, water, car parks, construction sites, the
// stations as boxes in their line's colour along the track (lib/station.mjs), and buildings as light 2.5D blocks (roof
// lifted over its walls, a soft shadow). The venue is either only its outline (in the small map's path grey, the small
// map's layers lying on top of it), or — for a festival with no venue map — its building as a block in the festival's
// own colours. One look for every festival: a light street map (the reference the user liked, 2026-10-26).
import fs from 'node:fs'
import path from 'node:path'
import { makeGround } from './ground.mjs'
import { findStation, stationBoxSvg } from './station.mjs'

// Zone classes: name, flat colour.
export const BIG_CLASSES = [
  ['land', '#f3e9ce'], // cream ground and blocks
  ['open', '#efe2c2'], // construction sites, greenfield: a shade darker
  ['park', '#7bc157'], // parks, gardens, grass
  ['pitch', '#048244'], // sports pitches
  ['paved', '#dcdcdf'], // car parks
  ['water', '#3faef3'],
  ['building', '#e6e6e9'], // the roof; walls and shadow below (STYLE)
  ['venue', '#c8c8ca'], // the festival grounds: the small map draws them on top
  ['road', '#c3c5ca'],
]
// How roads and buildings are drawn (metres).
const STYLE = {
  kerb: '#f8f0d9', kerbWidth: 2.4, // a pale pavement edge along every road (half shows outside)
  wall: '#c4c6cc', roofLift: 2.2, // a building's roof sits this far up its walls (looking from the south)
  shadow: '#c0bcb4', shadowOffset: [1.4, 1.2],
}
const SNAP_M = 5
// Road widths in metres per OSM way, read on the satellite. Big roads are mapped as two one-way carriageways (two
// ways side by side), so a carriageway with its pavement is about half the road.
const ROAD_WIDTH = { motorway: 14, motorway_link: 7, primary: 16, primary_link: 7, secondary: 16, secondary_link: 7, tertiary: 12, tertiary_link: 7,
  residential: 10, service: 5, construction: 10, footway: 3, pedestrian: 5, cycleway: 3, steps: 3, track: 3, path: 2 }
const AREA = [ // tag test → class, painted in this order (later wins)
  [(t) => t.landuse === 'construction' || t.landuse === 'greenfield', 'open'],
  [(t) => t.leisure === 'park' || t.leisure === 'garden' || t.landuse === 'grass' || t.landuse === 'plant_nursery' || t.natural === 'grassland' || t.natural === 'scrub' || t.natural === 'wood', 'park'],
  [(t) => t.leisure === 'pitch', 'pitch'],
  [(t) => t.amenity === 'parking', 'paved'],
  [(t) => t.natural === 'water', 'water'],
  [(t) => !!t.building, 'building'],
]
const ORDER = ['open', 'park', 'pitch', 'paved', 'water', 'venue']
// Traced coarser than a venue map (the big map is mostly seen zoomed out): 10 cm figures, straight lines through
// points at most 30 cm off the outline (curves would be three times the size).
const TRACE = { digits: 1, tolerance: 0.3, straight: true }
const LABEL = { open: '공사장·빈터', park: '공원', pitch: '운동장', paved: '주차장', water: '물', venue: '행사장(작은 지도 자리)' }

const same = (a, b) => a[0] === b[0] && a[1] === b[1]
const closed = (pts) => pts.length > 3 && same(pts[0], pts[pts.length - 1])

/** The closed outlines of an OSM area: a closed way, or a multipolygon relation's outer ways joined end to end. */
function areaRings(OSM) {
  const byId = new Map(OSM.ways.map((w) => [w.id, w]))
  const rings = OSM.ways.filter((w) => closed(w.pts)).map((w) => ({ id: w.id, tags: w.tags || {}, pts: w.pts }))
  for (const rel of OSM.relations ?? []) {
    const open = rel.outer.map((id) => byId.get(id)?.pts).filter(Boolean).map((pts) => [...pts])
    while (open.length) {
      let ring = open.shift()
      for (let grown = true; grown && !closed(ring);) {
        grown = false
        for (let i = 0; i < open.length; i++) {
          const w = open[i], end = ring[ring.length - 1]
          const next = same(w[0], end) ? w : same(w[w.length - 1], end) ? [...w].reverse() : null
          if (!next) continue
          ring = [...ring, ...next.slice(1)]; open.splice(i, 1); grown = true; break
        }
      }
      if (closed(ring)) rings.push({ id: rel.id, tags: rel.tags || {}, pts: ring })
    }
  }
  return rings
}

/** Mask of the venue: the small map's outline (its layer 1 `venue` path, small-frame metres) moved into this frame, or
 *  the OSM areas (ways or relations) the festival names. */
async function venueMask({ frame, maskOf, rings, out, venue }) {
  const { PPM, BOX, llToPx, pathD } = frame
  if (venue.osm) {
    const shapes = rings.filter((r) => venue.osm.includes(r.id)).map((r) => `<path d="${pathD(r.pts.map(llToPx), true)}"/>`)
    if (shapes.length === 0) throw new Error(`no OSM area ${venue.osm.join(', ')} for the venue`)
    return maskOf(`<g fill="#000">${shapes.join('')}</g>`)
  }
  const small = fs.readFileSync(path.join(out, 'layer1-ground-north-up.svg'), 'utf8')
  const venueD = small.match(/<path id="venue"[^>]* d="([^"]+)"/)?.[1]
  if (!venueD) throw new Error('run layer1.mjs first: no venue outline in the small layer 1')
  const [dx, dy] = [venue.small.west - BOX.west, BOX.north - venue.small.north] // small-frame origin in this frame, metres
  return maskOf(`<path transform="scale(${PPM}) translate(${dx},${dy})" d="${venueD}" fill="#000"/>`)
}

/**
 * frame: the big map's frame (lib/frame.mjs); venue: { small: the small map's box (same origin) } when the small
 * map's layers go on top (its layer 1 must be in out/: its `venue` outline), or { osm: [way or relation ids], roof,
 * wall } for a festival with no venue map: that building drawn as a block in those colours; out/cache: where the
 * festival's layers go; stations: [{ name, near: [e, n], lines: [{ text, colour }], length?, outline?, track? }] (the
 * box takes the first line's colour; `track`: the OSM name of the line's track when it is not tagged subway).
 * Writes out/big-layer1-ground-north-up.svg and out/big-north-up-bounds.json.
 */
export async function drawBigLayer1({ frame, venue: where, out, cache, stations }) {
  const { OSM, W, H, BOX, llToPx, pathD } = frame
  const { maskOf, toF, joinLooseEnds, pathStrokes, closeOpen, zoneGroups, writeNorthUp, areas } = makeGround(frame)
  const C = Object.fromEntries(BIG_CLASSES.map(([n], i) => [n, i]))
  const colour = Object.fromEntries(BIG_CLASSES)

  const cls = new Int8Array(W * H).fill(C.land)
  const rings = areaRings(OSM)
  const venue = await venueMask({ frame, maskOf, rings, out, venue: where })
  for (const [test, name] of AREA) {
    // each area its own shape: one path of them all would cut holes where a ring lies inside another one wound the other way
    const shapes = rings.filter((r) => test(r.tags)).map((r) => `<path d="${pathD(r.pts.map(llToPx), true)}"/>`).join('')
    if (!shapes) continue
    const m = await maskOf(`<g fill="#000">${shapes}</g>`)
    for (let i = 0; i < W * H; i++) if (m[i] > 127) cls[i] = C[name]
  }
  for (let i = 0; i < W * H; i++) if (venue[i] > 127) cls[i] = C.venue

  // Roads (and paths) at real widths as one shape, outside the venue (the small map has its own paths).
  const ways = OSM.ways.filter((w) => w.tags?.highway in ROAD_WIDTH && w.tags.layer !== '-1').map((w) => ({ hw: w.tags.highway, width: ROAD_WIDTH[w.tags.highway], pts: w.pts.map(frame.toM) }))
  const joined = joinLooseEnds(ways, SNAP_M)
  const strokes = await maskOf(`<g fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round">${pathStrokes(ways)}</g>`)
  const road = await closeOpen(Buffer.from(strokes.map((v, i) => (v > 127 && venue[i] <= 127 ? 255 : 0))), (i) => venue[i] <= 127)
  for (let i = 0; i < W * H; i++) if (road[i]) cls[i] = C.road

  const zones = zoneGroups(ORDER, LABEL, cls, C, colour, TRACE)
  const roadD = frame.trace(toF((i) => cls[i] === C.road), { ...TRACE, sigma: 1.5 })
  const buildingD = frame.trace(toF((i) => cls[i] === C.building), { ...TRACE, sigma: 1 })
  const [sx, sy] = STYLE.shadowOffset
  const stationBoxes = stations.map(({ name, near, lines, length = 140, outline, track }) => {
    const station = findStation(frame, near, { length, track })
    return `<g data-name="${name}">${stationBoxSvg(station, BOX, { length, fill: lines[0].colour, outline: outline ?? darker(lines[0].colour) })}</g>`
  })
  const VW = BOX.east - BOX.west, VH = BOX.north - BOX.south
  const content = `<g id="layer1" data-name="레이어 1 · 바닥 (큰 지도)">
<rect id="land" data-name="땅" width="${VW}" height="${VH}" fill="${colour.land}"/>
<g id="zones" data-name="구역">${zones}</g>
<path id="roads" data-name="길" d="${roadD}" fill="${colour.road}" fill-rule="evenodd" stroke="${STYLE.kerb}" stroke-width="${STYLE.kerbWidth}" stroke-linejoin="round" paint-order="stroke"/>
<g id="stations" data-name="역">${stationBoxes.join('')}</g>
<g id="buildings" data-name="건물" fill-rule="evenodd">
<defs><path id="building-outline" data-name="건물 윤곽" d="${buildingD}"/></defs>
<use data-name="그림자" href="#building-outline" fill="${STYLE.shadow}" transform="translate(${sx},${sy})"/>
<use data-name="벽" href="#building-outline" fill="${STYLE.wall}"/>
<use data-name="지붕" href="#building-outline" fill="${colour.building}" transform="translate(0,${-STYLE.roofLift})"/>
</g>${where.osm ? venueBlock(frame.trace(toF((i) => venue[i] > 127), { ...TRACE, sigma: 1 }), where) : ''}
</g>`
  writeNorthUp({ content, cls, colour, out, cache, prefix: 'big-' })
  console.log('path ends joined', joined, '| areas m²', areas(cls, BIG_CLASSES))
}

/** The venue building as a 2.5D block in the festival's colours (roof lifted a little higher than the others). */
function venueBlock(d, { roof, wall }) {
  const [sx, sy] = STYLE.shadowOffset
  return `
<g id="venue" data-name="공연장" fill-rule="evenodd">
<path data-name="그림자" d="${d}" fill="${STYLE.shadow}" transform="translate(${sx * 1.5},${sy * 1.5})"/>
<path data-name="벽" d="${d}" fill="${wall}"/>
<path data-name="지붕" d="${d}" fill="${roof}" transform="translate(0,${-STYLE.roofLift * 1.5})"/>
</g>`
}

/** A line colour a third of the way to black (the station box's outline). */
function darker(hex) {
  const v = parseInt(hex.slice(1), 16)
  return `#${[16, 8, 0].map((s) => Math.round(((v >> s) & 255) * 0.67).toString(16).padStart(2, '0')).join('')}`
}

/** Where the app writes a station's name (past the northern end of its box), [lat, lng]. */
export function stationNameAt(frame, { near, length = 140, track }) {
  return frame.toLL(findStation(frame, near, { length, track }).nameAt)
}

/** The middle of a station's box on its track, [lat, lng]. */
export function stationCentre(frame, { near, length = 140, track }) {
  return frame.toLL(findStation(frame, near, { length, track }).centre)
}
