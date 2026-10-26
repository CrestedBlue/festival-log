// The app's copy of a festival map that is a big area map alone (a festival with no venue map yet): the big map's
// layer 1, and what the app draws on it — the venue, the stations and their numbered exits as icons (marks, which the
// catalog turns into pins), the stations' names with their lines, big landmarks and bus stops (labels).
import path from 'node:path'
import { writeAppMap, boundsOf, busStopLabels } from './app.mjs'
import { busIcon, exitIcon, stationIcon, venueIcon } from './app-icons.mjs'
import { stationCentre, stationNameAt } from './big-layer1.mjs'
import { findStation } from './station.mjs'

const ll = ([lat, lng]) => ({ lat: +lat.toFixed(6), lng: +lng.toFixed(6) })
const mean = (pts) => [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length]

/** The middle of OSM ways or relations (all their points), [lat, lng]. */
export function osmCentre(OSM, ids) {
  const wayIds = ids.flatMap((id) => OSM.relations.find((r) => r.id === id)?.outer ?? [id])
  const pts = wayIds.flatMap((id) => OSM.ways.find((w) => w.id === id)?.pts ?? [])
  if (pts.length === 0) throw new Error(`no OSM way or relation ${ids.join(', ')}`)
  return mean(pts)
}

/**
 * root, code: as writeAppMap; frame: the big map's frame; out: where big-layer1-ground-north-up.svg is; venue: { osm:
 * [ids], colour } (the icon's colour); stations: as for drawBigLayer1, each with a `key` (the mark's kind is
 * `station-<key>`); landmarks: [[name, [OSM ids]]]; openOn: keys of the stations the app opens with the venue in view;
 * attribution.
 */
export function writeBigOnlyAppMap({ root, code, frame, out, venue, stations, landmarks, openOn, attribution }) {
  const { OSM } = frame
  const bounds = boundsOf(path.join(out, 'big-north-up-bounds.json'))
  const venueAt = osmCentre(OSM, venue.osm)
  const centreOf = Object.fromEntries(stations.map((s) => [s.key, stationCentre(frame, s)]))
  // each station's numbered exits (OSM subway entrances by it): kind = the exit's icon, zone = the station's key
  // (one per number: OSM sometimes has the same exit twice)
  const exits = stations.flatMap((s) => findStation(frame, s.near, { length: s.length, track: s.track, radius: s.radius }).exits
    .filter((x, i, all) => /^\d+$/.test(x.ref) && all.findIndex((y) => y.ref === x.ref) === i)
    .sort((a, b) => Number(a.ref) - Number(b.ref))
    .map((x) => ({ kind: `exit-${x.ref}`, zone: s.key, ...ll([x.lat, x.lng]) })))
  const marks = [
    { kind: 'venue', zone: '', ...ll(venueAt) },
    ...stations.map((s) => ({ kind: `station-${s.key}`, zone: '', ...ll(centreOf[s.key]) })),
    ...exits,
  ].map((mark, i) => ({ id: i + 1, ...mark }))
  const icons = {
    venue: venueIcon(venue.colour), bus: busIcon(),
    ...Object.fromEntries(stations.map((s) => [`station-${s.key}`, stationIcon(s.lines[0].colour)])),
    ...Object.fromEntries(exits.map((x) => [x.kind, exitIcon(x.kind.slice('exit-'.length))])),
  }
  const labels = [
    // past the north end of each station box, with the lines' badges, as on Korean street maps
    ...stations.map((s) => ({ text: s.name, kind: 'station', badges: s.lines, minZoom: 14, ...ll(stationNameAt(frame, s)) })),
    ...landmarks.map(([text, ids]) => ({ text, kind: 'building', minZoom: 15.5, ...ll(osmCentre(OSM, ids)) })),
    ...busStopLabels(OSM, bounds),
  ]
  // opens centred on the venue (its name beside it in view), wide enough for the stations it is walked to from
  const PAD_DEG = 0.0008
  const reach = (i) => Math.max(...openOn.map((key) => Math.abs(centreOf[key][i] - venueAt[i]))) + PAD_DEG
  const initialView = [[venueAt[0] - reach(0), venueAt[1] - reach(1)], [venueAt[0] + reach(0), venueAt[1] + reach(1)]].map(([lat, lng]) => [+lat.toFixed(6), +lng.toFixed(6)])
  writeAppMap({ root, code,
    layers: [{ src: path.join(out, 'big-layer1-ground-north-up.svg'), file: 'big-layer1.svg', bounds }],
    initialView, marks, icons, labels, maxZoom: 19.5,
    background: '#f3e9ce', fillOnOpen: false, // the map's cream ground runs on around it
    zoomOutFills: true, // zoomed right out the map still fills the screen; the rest is a pan away
    attribution,
  })
  return { marks }
}
