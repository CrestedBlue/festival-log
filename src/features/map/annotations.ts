import type { Pin } from '../../data/schema'
import type { FestivalMap, MapLabel, MapLabelKind } from './festivalMaps'

/*
 * What an illustrated map writes and draws on top of its images, the way a street map does: names and icons keep
 * their size on screen, small things only show once zoomed in, and something that would overlap a more important one
 * is left out at that zoom.
 */

/** Pins drawn as the map's own icons show from this zoom on; named places (a caption) from CAPTIONED_FROM_ZOOM. */
export const ICON_FROM_ZOOM = 16
export const CAPTIONED_FROM_ZOOM = 15
const CAPTION_FONT = 11
const LABEL_FONT: Record<MapLabelKind, number> = { station: 13, building: 11, stage: 12, place: 11, zone: 11, bus: 10 }
const LABEL_ICON = 18
const BADGE_FONT = 10
const GAP = 3 // px kept clear around each one

/** Higher first when two would overlap. Stage names come right after the station, so they never drop out for a pin. */
const PRIORITY = { selected: 1000, active: 900, station: 100, stage: 95, named: 90, exit: 70, pin: 60, zone: 55, place: 50, building: 40, bus: 35 }

export const iconSize = (zoom: number): number => (zoom < 17 ? 20 : zoom < 18 ? 24 : 30)

/** Rough rendered width: Hangul about a full em, other characters a little over half. */
export function textWidth(text: string, font: number): number {
  return [...text].reduce((w, ch) => w + (/[ㄱ-힝]/.test(ch) ? font : ch === ' ' ? font * 0.3 : font * 0.62), 0)
}

export interface Offset {
  dx: number
  dy: number
}
const NO_NUDGES: readonly Offset[] = []
const NUDGING: ReadonlySet<MapLabelKind> = new Set(['station', 'stage', 'place', 'zone'])

export type AnnotationView =
  | { type: 'pin'; pin: Pin; iconUrl: string; size: number; caption: string | null; selected: boolean; active: boolean }
  | { type: 'label'; label: MapLabel; iconUrl: string | null; font: number }

export interface Annotation {
  key: string
  lat: number
  lng: number
  /** Screen box relative to the point (px). */
  box: { left: number; top: number; width: number; height: number }
  /** Other places to try (px from the point) when the first would overlap: a name may move just above or below. */
  nudges: readonly Offset[]
  priority: number
  view: AnnotationView
}

function pinAnnotation(pin: Pin, iconUrl: string, zoom: number, selected: boolean, active: boolean): Annotation | null {
  const exitIcon = pin.mapIcon?.startsWith('exit-') ?? false
  const fromZoom = pin.caption ? CAPTIONED_FROM_ZOOM : ICON_FROM_ZOOM
  if (!selected && !active && zoom < fromZoom) return null
  const size = iconSize(zoom) - (exitIcon ? 4 : 0)
  const caption = pin.caption ?? null
  const width = size + (caption ? 4 + textWidth(caption, CAPTION_FONT) + 8 : 0)
  const at = pin.spot ?? pin
  const priority = selected ? PRIORITY.selected : active ? PRIORITY.active : caption ? PRIORITY.named : exitIcon ? PRIORITY.exit : PRIORITY.pin
  return {
    key: `pin:${pin.id}`,
    lat: at.lat,
    lng: at.lng,
    box: { left: -size / 2, top: -size / 2, width, height: size },
    nudges: NO_NUDGES,
    priority,
    view: { type: 'pin', pin, iconUrl, size, caption, selected, active },
  }
}

function labelAnnotation(label: MapLabel, index: number, icons: FestivalMap['icons'], zoom: number): Annotation | null {
  if (zoom < label.minZoom) return null
  const font = LABEL_FONT[label.kind] + (zoom >= 17.5 && label.kind !== 'building' && label.kind !== 'bus' ? 1 : 0)
  const iconUrl = label.icon ? (icons[label.icon] ?? null) : null
  const badges = (label.badges ?? []).reduce((w, b) => w + textWidth(b.text, BADGE_FONT) + 10 + 4, 0)
  const width = (iconUrl ? LABEL_ICON + 4 : 0) + badges + textWidth(label.text, font) + 12
  const height = Math.max(font + 10, iconUrl ? LABEL_ICON + 4 : 0)
  return {
    key: `label:${index}`,
    lat: label.lat,
    lng: label.lng,
    box: { left: -width / 2, top: -height / 2, width, height },
    // names may move a line up or down to make room (a station's name two lines up, clear of its exits); buildings and
    // stops stay put
    nudges: NUDGING.has(label.kind) ? [{ dx: 0, dy: -(height + 2) }, { dx: 0, dy: height + 2 }, ...(label.kind === 'station' ? [{ dx: 0, dy: -2 * (height + 2) }] : [])] : NO_NUDGES,
    priority: PRIORITY[label.kind],
    view: { type: 'label', label, iconUrl, font },
  }
}

/**
 * Everything the map would show at this zoom (before leaving out overlaps): its labels and the pins it has icons for.
 * The selected pin and the active ones (a pin-list row tapped) show at any zoom and before everything else, so a row's
 * pins are all on the map.
 */
export function buildAnnotations(
  map: FestivalMap,
  pins: readonly Pin[],
  zoom: number,
  selectedId: string | null,
  activeIds: ReadonlySet<string> = new Set(),
): Annotation[] {
  const pinItems = pins.flatMap((pin) => {
    const iconUrl = pin.mapIcon ? map.icons[pin.mapIcon] : undefined
    const item = iconUrl ? pinAnnotation(pin, iconUrl, zoom, pin.id === selectedId, activeIds.has(pin.id)) : null
    return item ? [item] : []
  })
  const labelItems = map.labels.flatMap((label, i) => {
    const item = labelAnnotation(label, i, map.icons, zoom)
    return item ? [item] : []
  })
  return [...labelItems, ...pinItems]
}

/**
 * What to show and where: the most important first, each at the first of its places (its own, then its nudges) that
 * overlaps nothing shown so far; left out if none is free — except the selected and active pins, which always show
 * (on top of each other if they must). `at` gives screen points. Returns key → offset from the point.
 */
export function placeAnnotations(items: readonly Annotation[], at: (item: Annotation) => { x: number; y: number }): Map<string, Offset> {
  const shown: { x0: number; y0: number; x1: number; y1: number }[] = []
  const placed = new Map<string, Offset>()
  for (const item of [...items].sort((a, b) => b.priority - a.priority)) {
    const { x, y } = at(item)
    const boxAt = (offset: Offset) => {
      const x0 = x + offset.dx + item.box.left, y0 = y + offset.dy + item.box.top
      return { x0: x0 - GAP, y0: y0 - GAP, x1: x0 + item.box.width + GAP, y1: y0 + item.box.height + GAP }
    }
    const offsets = [{ dx: 0, dy: 0 }, ...item.nudges]
    const free = offsets.find((offset) => {
      const box = boxAt(offset)
      return !shown.some((b) => box.x0 < b.x1 && b.x0 < box.x1 && box.y0 < b.y1 && b.y0 < box.y1)
    })
    const offset = free ?? (item.priority >= PRIORITY.active ? offsets[0]! : null)
    if (!offset) continue
    shown.push(boxAt(offset))
    placed.set(item.key, offset)
  }
  return placed
}
