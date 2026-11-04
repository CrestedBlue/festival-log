// A festival map drawn from its zones (the user, 2026-11-04: "다른것들도 디자인 펜타포트처럼 영역 예쁘게 꾸며주시고
// 스테이지 아이콘 넣어주세요"): for a festival whose official map is too rough to redraw shape by shape (or has none), the
// venue map's layer 1 only — the venue on the real ground (OSM), each zone of the official map on the real place it
// names (an OSM area or an outline read on the satellite) in the official colour, the real paths through it on top —
// over the big area map (lib/big-layer1.mjs) with the stations. The app writes the stage names with their icons, the
// zone names, the stations, landmarks and bus stops, and draws the pins (one design, scripts/map/layers/app-pins.mjs).
// No layer 2 (tents and stages drawn as objects): the official maps do not place them well enough.
import path from 'node:path'
import { makeGround } from './ground.mjs'
import { areaRings, drawBigLayer1, stationCentre, stationNameAt } from './big-layer1.mjs'
import { findStation } from './station.mjs'
import { writeAppMap, boundsOf, busStopLabels } from './app.mjs'
import { busIcon, exitIcon, stationIcon } from './app-icons.mjs'
import { osmCentre } from './big-app.mjs'

// Pentaport's ground: grass, grey paths (its layer 1 colours).
export const GROUND = { grass: '#74bc6c', paved: '#d9d9db', path: '#c8c8ca' }
const PATH_WAYS = /^(footway|path|pedestrian|service|cycleway|steps|track|living_street)$/
const PATH_WIDTH = { service: 6, footway: 4, path: 3, cycleway: 3, steps: 3, track: 3, pedestrian: 5, living_street: 6 }
const SNAP_M = 5
const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
const ll6 = ([lat, lng]) => ({ lat: +lat.toFixed(6), lng: +lng.toFixed(6) })
const mean = (pts) => [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length]

/** A shape's outlines in local metres: `ll` [[lat, lng]] read on the satellite, OSM areas (`osm`: way/relation ids), or
 *  `parts` (several such shapes together). */
function outlines(frame, rings, shape) {
  if (shape.parts) return shape.parts.flatMap((part) => outlines(frame, rings, part))
  if (shape.ll) return [shape.ll.map((p) => frame.toM(p))]
  const found = rings.filter((r) => shape.osm.includes(r.id)).map((r) => r.pts.map((p) => frame.toM(p)))
  if (found.length === 0) throw new Error(`no OSM area ${shape.osm.join(', ')}`)
  return found
}

/**
 * The venue map's layer 1. frame: the small frame (lib/frame.mjs); venue: { ll | osm, fill, path? } — the festival grounds,
 * their ground colour and their paths' (default Pentaport's grey); zones: [{ name, label, colour, ll | osm, solid?, edge? }] painted in order (later on top), inside
 * the venue — `solid` ones (a hall, a pitch, a stage area) are not crossed by paths, `edge` draws a line round one. Writes out/layer1-ground-north-up.svg
 * (its `venue` outline is what the big map leaves for it) and out/north-up-bounds.json.
 */
export async function drawVenueLayer1({ frame, venue, zones, out, cache }) {
  const { W, H, BOX, PPM, toPx, trace } = frame
  const { maskOf, toF, joinLooseEnds, pathStrokes, closeOpen, writeNorthUp, areas } = makeGround(frame)
  const rings = areaRings(frame.OSM)
  // outlines as they are (straight sides: fields, halls and plazas have corners); the tracing softens them a little
  const pxD = (ring) => frame.pathD(ring.map(toPx), true)
  const mD = (ring) => frame.pathD(ring.map(([e, n]) => [e - BOX.west, BOX.north - n]), true) // metres in SVG units
  const venueRings = outlines(frame, rings, venue)
  const inVenue = await maskOf(`<g fill="#000">${venueRings.map((r) => `<path d="${pxD(r)}"/>`).join('')}</g>`)

  const CLASSES = [['ground', venue.fill], ...zones.map((z) => [z.name, z.colour])]
  const C = Object.fromEntries(CLASSES.map(([n], i) => [n, i]))
  const cls = new Int8Array(W * H).fill(-1)
  for (let i = 0; i < W * H; i++) if (inVenue[i] > 127) cls[i] = C.ground
  const solid = new Uint8Array(W * H)
  for (const zone of zones) {
    const m = await maskOf(`<g fill="#000">${outlines(frame, rings, zone).map((r) => `<path d="${pxD(r)}"/>`).join('')}</g>`)
    for (let i = 0; i < W * H; i++) if (inVenue[i] > 127 && m[i] > 127) { cls[i] = C[zone.name]; solid[i] = zone.solid ? 1 : 0 }
  }

  // the real paths through the grounds, at real widths, as one shape (not across a solid zone)
  const ways = frame.OSM.ways.filter((w) => PATH_WAYS.test(w.tags?.highway ?? '') && w.tags.layer !== '-1')
    .map((w) => ({ hw: w.tags.highway, width: PATH_WIDTH[w.tags.highway], pts: w.pts.map((p) => frame.toM(p)) }))
  joinLooseEnds(ways, SNAP_M)
  const strokes = await maskOf(`<g fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round">${pathStrokes(ways)}</g>`)
  const keep = (i) => inVenue[i] > 127 && !solid[i]
  const grey = await closeOpen(Buffer.from(strokes.map((v, i) => (v > 127 && keep(i) ? 255 : 0))), keep)

  const zoneGroups = zones.map((z) => {
    const d = trace(toF((i) => cls[i] === C[z.name]), { sigma: 1.5, tolerance: 0.2 })
    // `edge`: a line round the zone (the official map's white lines between zones of one colour)
    const [stroke, width] = z.edge ? [z.edge, 1.2] : [z.colour, 0.4]
    return d ? `<g id="zone-${z.name}" data-name="${esc(z.label)}" fill="${z.colour}" stroke="${stroke}" stroke-width="${width}" stroke-linejoin="round"><path fill-rule="evenodd" d="${d}"/></g>` : ''
  }).join('\n')
  const venueD = venueRings.map(mD).join('')
  const greyD = trace(toF((i) => grey[i] > 0), { sigma: 2, tolerance: 0.2 })
  const content = `<defs><clipPath id="venue-clip"><path d="${venueD}"/></clipPath></defs>
<g id="layer1" data-name="레이어 1 · 바닥">
<path id="venue" data-name="행사장" d="${venueD}" fill="${venue.fill}"/>
<g id="zones" data-name="구역" clip-path="url(#venue-clip)">${zoneGroups}</g>
<path id="paved" data-name="길" d="${greyD}" fill="${venue.path ?? GROUND.path}" fill-rule="evenodd" clip-path="url(#venue-clip)"/>
</g>`
  writeNorthUp({ content, cls, colour: Object.fromEntries(CLASSES), out, cache })
  console.log('venue layer 1 | areas m²', areas(cls, CLASSES), '| px', W, H, PPM)
  return { rings }
}

/** Where a zone's name goes: its given spot, else the middle of its outline, [lat, lng]. */
const zoneCentre = (frame, rings, zone) => zone.labelAt ?? frame.toLL(mean(outlines(frame, rings, zone).flat()))

/**
 * The whole map: layer 1 of the venue map, the big area map under it, and the app's copy (src/assets/maps/<code>/).
 * root, code, out, cache: where things go; frame / bigFrame: the venue map's and the big map's frames (same origin);
 * venue, zones: as for drawVenueLayer1 (a zone with `label` is named on the map unless `unnamed`); stations: as for
 * drawBigLayer1, each with a `key`; stages: [{ text, stage (the theme's key), colour, at: [lat, lng] }]; places: other
 * names ({ text, at, colour? }); landmarks: [[name, [OSM ids]]]; openOn: [[south, west], [north, east]] the app opens
 * on (default: the venue map); attribution.
 */
export async function buildVenueMap({ root, code, out, cache, frame, bigFrame, venue, zones, stations = [], stages = [], places = [], landmarks = [], openOn, attribution }) {
  const { rings } = await drawVenueLayer1({ frame, venue, zones, out, cache })
  await drawBigLayer1({ frame: bigFrame, venue: { small: frame.BOX }, out, cache, stations })

  const OSM = bigFrame.OSM
  const big = boundsOf(path.join(out, 'big-north-up-bounds.json'))
  const small = boundsOf(path.join(out, 'north-up-bounds.json'))
  const exits = stations.flatMap((s) => findStation(bigFrame, s.near, { length: s.length, track: s.track, radius: s.radius }).exits
    .filter((x, i, all) => /^\d+$/.test(x.ref) && all.findIndex((y) => y.ref === x.ref) === i)
    .sort((a, b) => Number(a.ref) - Number(b.ref))
    .map((x) => ({ kind: `exit-${x.ref}`, zone: s.key, ...ll6([x.lat, x.lng]) })))
  const marks = [
    ...stations.map((s) => ({ kind: `station-${s.key}`, zone: '', ...ll6(stationCentre(bigFrame, s)) })),
    ...exits,
  ].map((mark, i) => ({ id: i + 1, ...mark }))
  const icons = {
    bus: busIcon(),
    ...Object.fromEntries(stations.map((s) => [`station-${s.key}`, stationIcon(s.lines[0].colour)])),
    ...Object.fromEntries(exits.map((x) => [x.kind, exitIcon(x.kind.slice('exit-'.length))])),
  }
  const labels = [
    ...stations.map((s) => ({ text: s.name, kind: 'station', badges: s.lines, minZoom: 14, ...ll6(stationNameAt(bigFrame, s)) })),
    ...landmarks.map(([text, ids]) => ({ text, kind: 'building', minZoom: 15.5, ...ll6(osmCentre(OSM, ids)) })),
    ...busStopLabels(OSM, big),
    ...zones.filter((z) => z.label && !z.unnamed).map((z) => ({ text: z.label, kind: 'zone', colour: z.colour, minZoom: 16.5, ...ll6(zoneCentre(frame, rings, z)) })),
    ...places.map((p) => ({ text: p.text, kind: 'place', minZoom: 16.5, ...(p.colour ? { colour: p.colour } : {}), ...ll6(p.at) })),
    ...stages.map((s) => ({ text: s.text, kind: 'stage', stage: s.stage, colour: s.colour, minZoom: 15.3, ...ll6(s.at) })),
  ]
  writeAppMap({ root, code,
    layers: [
      { src: path.join(out, 'big-layer1-ground-north-up.svg'), file: 'big-layer1.svg', bounds: big },
      { src: path.join(out, 'layer1-ground-north-up.svg'), file: 'layer1.svg', bounds: small },
    ],
    initialView: openOn ?? small, marks, icons, labels, maxZoom: 19.5,
    background: '#f3e9ce', fillOnOpen: false, // the big map's cream ground runs on around it
    zoomOutFills: true, attribution,
  })
}
