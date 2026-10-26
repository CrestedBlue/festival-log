import type { Pin } from '../../data/schema'
import { groupKeyOf, type PinGroup } from './pinGroups'

/** Pins to make stand out on the map for a moment (a pin-list row was tapped); a new id replays it. */
export interface PinHighlight {
  id: number
  pins: readonly Pin[]
  /** The map zooms in to frame the pins, up to this far (and never out of view of them). */
  focusZoom: number
}

/**
 * What the map has picked out: the pin whose card is open, the pin-list row last tapped (its pins all kept on the map)
 * and the pulse that tap started. The row and its pulse go together: once the row is let go, nothing brings it back.
 */
export interface MapSelection {
  selectedId: string | null
  activeGroup: string | null
  highlight: PinHighlight | null
}

export const NO_SELECTION: MapSelection = { selectedId: null, activeGroup: null, highlight: null }

/** A list row tapped: it becomes the active row and its pins pulse; a row of one pin also selects it. */
export function showRow(group: PinGroup, highlightId: number, focusZoom: number): MapSelection {
  const only = group.pins.length === 1 ? group.pins[0] : undefined
  return { selectedId: only?.id ?? null, activeGroup: group.key, highlight: { id: highlightId, pins: group.pins, focusZoom } }
}

/** A pin tapped on the map: its card opens. The active row stays only when the pin is one of it. */
export function selectPin(state: MapSelection, pin: Pin): MapSelection {
  const keepsRow = state.activeGroup !== null && state.activeGroup === groupKeyOf(pin)
  return keepsRow ? { ...state, selectedId: pin.id } : { ...NO_SELECTION, selectedId: pin.id }
}
