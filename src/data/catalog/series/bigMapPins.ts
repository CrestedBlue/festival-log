import { seriesMapFor } from '../../../features/map/festivalMaps'
import type { Pin } from '../../schema'

/** A place a big area map draws (the venue, a station): its pin without the spot and icon, which come from the map. */
export type Place = { id: string } & Omit<Pin, 'id' | 'lat' | 'lng' | 'mapIcon'>

/** A station: its pin, and the name and line its exits are listed under ("인천대입구역 출구", "인천 1호선"). */
export type StationPlace = Place & { station: string; line: string }

/**
 * The pins of a festival whose map is a big area map alone (scripts/map/layers/<code>/app.mjs): the venue and the
 * stations where the map draws them, and every numbered exit of the stations (OpenStreetMap), one list row per station.
 * `stations` is keyed by the station's key on the map.
 */
export function bigMapPins(code: string, venue: Place, stations: Readonly<Record<string, StationPlace>>): Pin[] {
  const map = seriesMapFor(code)
  if (!map) throw new Error(`${code} map metadata is missing`)
  return map.marks.map((mark): Pin => {
    const spot = { mapIcon: mark.kind, lat: mark.lat, lng: mark.lng }
    if (mark.kind === 'venue') return { ...venue, id: `${code}-${venue.id}`, ...spot }
    const stationKey = mark.kind.startsWith('station-') ? mark.kind.slice('station-'.length) : mark.zone
    const station = stations[stationKey]
    if (!station) throw new Error(`${code} map mark ${mark.id} (${mark.kind}) is of no known station`)
    const { station: stationName, line, ...pin } = station
    if (mark.kind.startsWith('station-')) return { ...pin, id: `${code}-${pin.id}`, ...spot }
    const n = mark.kind.slice('exit-'.length)
    return { id: `${code}-exit-${stationKey}-${n}`, name: `${stationName} ${n}번 출구`, group: `${stationName} 출구`, detail: line, kind: 'etc', ...spot }
  })
}
