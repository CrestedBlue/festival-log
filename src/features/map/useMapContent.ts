import type L from 'leaflet'
import { useMemo } from 'react'
import { isMapLabelPin } from '../../data/catalog'
import type { Pin } from '../../data/schema'
import { buildAnnotations, iconSize } from './annotations'
import type { FestivalMap } from './festivalMaps'
import { pinSizeForZoom } from './pinSize'
import { useAnnotationLayer } from './useAnnotationLayer'
import { usePinLayer } from './useMapLayers'

const TILE_MAP_PIN = { size: 38, showIcon: true }
const NO_PINS: ReadonlySet<string> = new Set()

/**
 * What a festival map shows over its images. On an illustrated map the pins it has icons for are drawn with them,
 * with its names, by zoom (annotations.ts); places its drawing already labels are listed only; the rest (the user's
 * own pins, …) are plain pins. On the tile map every pin is a plain pin. `activeIds`: the pins of the list row last
 * tapped, all kept on the map. Returns the pin size on screen (for pulses).
 */
export function useMapContent(
  map: L.Map | null,
  festivalMap: FestivalMap | null,
  pins: readonly Pin[],
  zoom: number | null,
  selectedId: string | null,
  onSelect: (id: string) => void,
  interactive = true,
  activeIds: ReadonlySet<string> = NO_PINS,
): number {
  const plainPins = useMemo(
    () => (festivalMap ? pins.filter((pin) => !isMapLabelPin(pin) && !(pin.mapIcon && pin.mapIcon in festivalMap.icons)) : pins),
    [festivalMap, pins],
  )
  const look = festivalMap ? pinSizeForZoom(zoom ?? 0) : TILE_MAP_PIN
  const annotations = useMemo(
    () => (festivalMap && zoom !== null ? buildAnnotations(festivalMap, pins, zoom, selectedId, activeIds) : []),
    [festivalMap, pins, zoom, selectedId, activeIds],
  )
  usePinLayer(map, plainPins, selectedId, onSelect, look)
  useAnnotationLayer(map, annotations, onSelect, interactive)
  return festivalMap ? Math.max(look.size, iconSize(zoom ?? 0)) : look.size
}
