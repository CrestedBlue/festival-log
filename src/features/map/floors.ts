import type { Pin } from '../../data/schema'
import type { FestivalMap } from './festivalMaps'

/** A pin or a name that says no floor is on this one. */
export const GROUND_FLOOR = 1

export const pinFloor = (pin: Pin): number => pin.floor ?? GROUND_FLOOR

/** The floors a map is drawn for (a building's floor plans, lowest first); empty when it has one floor or none —
 *  then there is nothing to switch between. */
export function mapFloors(map: FestivalMap | null): number[] {
  const floors = new Set((map?.layers ?? []).flatMap((layer) => (layer.floor === undefined ? [] : [layer.floor])))
  return floors.size > 1 ? [...floors].sort((a, b) => a - b) : []
}

/** The pins on a floor; every pin when the map has no floors (`floor` null). */
export const pinsOnFloor = (pins: readonly Pin[], floor: number | null): readonly Pin[] =>
  floor === null ? pins : pins.filter((pin) => pinFloor(pin) === floor)

/** The map as seen on a floor: the layers drawn for every floor and for it, the names of it and of no floor. */
export function mapOnFloor(map: FestivalMap, floor: number): FestivalMap {
  const here = (item: { floor?: number }) => item.floor === undefined || item.floor === floor
  return { ...map, layers: map.layers.filter(here), labels: map.labels.filter(here) }
}

export const floorLabel = (floor: number): string => `${floor}F`
