import type { Pin } from '../../data/schema'
import { distanceMeters, type LatLng } from '../../lib/geo'

/** One row of the pin list: every pin of one role (toilets, wash stations, …), or a single pin. */
export interface PinGroup {
  key: string
  /** The pin's name, or "<role> N개" for several. */
  label: string
  kind: Pin['kind']
  pins: readonly Pin[]
  /** Metres to the group's nearest pin, when the position is known. */
  distance: number | null
}

/** Pins sharing a `group` form one row; the others a row each. Nearest first when the position is known, else by name. */
export function groupPins(pins: readonly Pin[], me: LatLng | null): PinGroup[] {
  const byKey = new Map<string, readonly Pin[]>()
  for (const pin of pins) {
    const key = pin.group ? `group:${pin.group}` : `pin:${pin.id}`
    byKey.set(key, [...(byKey.get(key) ?? []), pin])
  }
  return [...byKey]
    .map(([key, list]): PinGroup => {
      const [first] = list as [Pin, ...Pin[]]
      return {
        key,
        pins: list,
        kind: first.kind,
        label: list.length > 1 ? `${first.group} ${list.length}개` : first.name,
        distance: me ? Math.min(...list.map((pin) => distanceMeters(me, pin))) : null,
      }
    })
    .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0) || a.label.localeCompare(b.label, 'ko'))
}
