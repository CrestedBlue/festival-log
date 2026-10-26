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

// Without a position, rows come in this order of kinds: what people look for most first.
const KIND_ORDER: readonly Pin['kind'][] = ['wristband', 'toilet', 'firstaid', 'info', 'luggage', 'water', 'food', 'eating', 'meet', 'shop', 'smoking', 'stage', 'photo', 'sponsor', 'slogan', 'radar', 'artist', 'vinyl', 'etc']
const KIND_RANK_FROM = 10 // explicit ranks below this go before every kind
/** A row's place in the list when the position is unknown: its pins' `rank`, else its kind's. */
const rankOf = (group: PinGroup): number =>
  Math.min(...group.pins.map((pin) => pin.rank ?? KIND_RANK_FROM + Math.max(0, KIND_ORDER.indexOf(pin.kind))))

/** The list row a pin belongs to. */
export const groupKeyOf = (pin: Pin): string => (pin.group ? `group:${pin.group}` : `pin:${pin.id}`)

/** Pins sharing a `group` form one row; the others a row each. Nearest first when the position is known, else the
 *  most looked-for first (rankOf), then by name. */
export function groupPins(pins: readonly Pin[], me: LatLng | null): PinGroup[] {
  const byKey = new Map<string, readonly Pin[]>()
  for (const pin of pins) {
    const key = groupKeyOf(pin)
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
    .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0) || rankOf(a) - rankOf(b) || a.label.localeCompare(b.label, 'ko'))
}
