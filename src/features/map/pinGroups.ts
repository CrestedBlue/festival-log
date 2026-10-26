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

/**
 * A pin's standing (lower first), the user's order (2026-10-26): the entrance first; then what people look for all day —
 * toilets, wash stations, food, cool zones, MD; then the rest by kind; barrier-free help low; smoking areas last. The
 * catalog sets `rank` for roles the kind alone does not tell apart (entrance, wash stations, cool zones, barrier-free).
 */
export const RANK = { entrance: 0, toilet: 10, accessibleToilet: 11, washStation: 12, food: 13, coolZone: 14, md: 15, other: 20, barrierFree: 80, smoking: 90 } as const
const KIND_RANK: Partial<Record<Pin['kind'], number>> = { toilet: RANK.toilet, food: RANK.food, shop: RANK.md, smoking: RANK.smoking }
// the rest, by what people look for most
const OTHER_ORDER: readonly Pin['kind'][] = ['wristband', 'firstaid', 'info', 'luggage', 'water', 'eating', 'meet', 'stage', 'photo', 'sponsor', 'slogan', 'radar', 'artist', 'vinyl', 'etc']
export const pinRank = (pin: Pin): number => pin.rank ?? KIND_RANK[pin.kind] ?? RANK.other + Math.max(0, OTHER_ORDER.indexOf(pin.kind))
/** Ranks of one standing: the entrance, the all-day ones, the rest, barrier-free help, smoking. */
const STANDINGS = [RANK.entrance, RANK.toilet, RANK.other, RANK.barrierFree, RANK.smoking]
export const standingOf = (rank: number): number => STANDINGS.filter((from) => rank >= from).length - 1
const rankOf = (group: PinGroup): number => Math.min(...group.pins.map(pinRank))

/** The list row a pin belongs to. */
export const groupKeyOf = (pin: Pin): string => (pin.group ? `group:${pin.group}` : `pin:${pin.id}`)

/** Pins sharing a `group` form one row; the others a row each. By standing (RANK); within one, nearest first when the
 *  position is known, else by rank; then by name. */
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
    .sort(
      (a, b) =>
        standingOf(rankOf(a)) - standingOf(rankOf(b)) ||
        (a.distance ?? 0) - (b.distance ?? 0) ||
        rankOf(a) - rankOf(b) ||
        a.label.localeCompare(b.label, 'ko'),
    )
}
