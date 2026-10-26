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
const LABEL_FONT: Record<MapLabelKind, number> = { station: 13, building: 11, stage: 12, place: 11, bus: 10 }
const LABEL_ICON = 18
const BADGE_FONT = 10
const GAP = 3 // px kept clear around each one

/** Higher first when two would overlap. */
const PRIORITY = { selected: 1000, active: 900, station: 100, named: 90, stage: 80, exit: 70, pin: 60, place: 50, building: 40, bus: 35 }

export const iconSize = (zoom: number): number => (zoom < 17 ? 20 : zoom < 18 ? 24 : 30)

/** Rough rendered width: Hangul about a full em, other characters a little over half. */
export function textWidth(text: string, font: number): number {
  return [...text].reduce((w, ch) => w + (/[ㄱ-힝]/.test(ch) ? font : ch === ' ' ? font * 0.3 : font * 0.62), 0)
}

export type AnnotationView =
  | { type: 'pin'; pin: Pin; iconUrl: string; size: number; caption: string | null; selected: boolean; active: boolean }
  | { type: 'label'; label: MapLabel; iconUrl: string | null; font: number }

export interface Annotation {
  key: string
  lat: number
  lng: number
  /** Screen box relative to the point (px). */
  box: { left: number; top: number; width: number; height: number }
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
    priority,
    view: { type: 'pin', pin, iconUrl, size, caption, selected, active },
  }
}

function labelAnnotation(label: MapLabel, index: number, icons: FestivalMap['icons'], zoom: number): Annotation | null {
  if (zoom < label.minZoom) return null
  const font = LABEL_FONT[label.kind] + (zoom >= 17.5 && label.kind !== 'building' && label.kind !== 'bus' ? 1 : 0)
  const iconUrl = label.icon ? (icons[label.icon] ?? null) : null
  const badge = label.badge ? textWidth(label.badge.text, BADGE_FONT) + 10 : 0
  const width = (iconUrl ? LABEL_ICON + 4 : 0) + (badge ? badge + 4 : 0) + textWidth(label.text, font) + 12
  const height = Math.max(font + 10, iconUrl ? LABEL_ICON + 4 : 0)
  return {
    key: `label:${index}`,
    lat: label.lat,
    lng: label.lng,
    box: { left: -width / 2, top: -height / 2, width, height },
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

/** The keys to show: the most important first, then each one that overlaps none shown so far. `at` gives screen points. */
export function placeAnnotations(items: readonly Annotation[], at: (item: Annotation) => { x: number; y: number }): Set<string> {
  const shown: { x0: number; y0: number; x1: number; y1: number }[] = []
  const keys = new Set<string>()
  for (const item of [...items].sort((a, b) => b.priority - a.priority)) {
    const { x, y } = at(item)
    const box = { x0: x + item.box.left - GAP, y0: y + item.box.top - GAP, x1: x + item.box.left + item.box.width + GAP, y1: y + item.box.top + item.box.height + GAP }
    if (shown.some((b) => box.x0 < b.x1 && b.x0 < box.x1 && box.y0 < b.y1 && b.y0 < box.y1)) continue
    shown.push(box)
    keys.add(item.key)
  }
  return keys
}
