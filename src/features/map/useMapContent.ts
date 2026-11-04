import type L from 'leaflet'
import { useMemo } from 'react'
import type { Pin } from '../../data/schema'
import { buildAnnotations, iconSize, type StageLooks } from './annotations'
import type { FestivalMap } from './festivalMaps'
import { pinSizeForZoom } from './pinSize'
import { useAnnotationLayer } from './useAnnotationLayer'
import { usePinLayer } from './useMapLayers'

const TILE_MAP_PIN = { size: 34, showIcon: true }
const NO_PINS: ReadonlySet<string> = new Set()
const NO_STAGES: StageLooks = {}

/**
 * What a festival map shows over its images. On an illustrated map the festival's pins are drawn with their icons, with
 * its names (a stage's with its icon, from `stages`), by zoom (annotations.ts); the user's own pins (`userPinIds`) are
 * plain pins, always shown. On the tile map every pin is a plain pin. Every pin has the one design (pinIcons.ts).
 * `activeIds`: the pins of the list row last tapped, all kept on the map. Returns the pin size on screen (for pulses).
 */
export function useMapContent(
  map: L.Map | null,
  festivalMap: FestivalMap | null,
  pins: readonly Pin[],
  zoom: number | null,
  selectedId: string | null,
  onSelect: (id: string) => void,
  { interactive = true, activeIds = NO_PINS, userPinIds = NO_PINS, stages = NO_STAGES }: {
    interactive?: boolean
    activeIds?: ReadonlySet<string>
    userPinIds?: ReadonlySet<string>
    stages?: StageLooks
  } = {},
): number {
  const [plainPins, mapPins] = useMemo(
    () => (festivalMap ? [pins.filter((pin) => userPinIds.has(pin.id)), pins.filter((pin) => !userPinIds.has(pin.id))] : [pins, []]),
    [festivalMap, pins, userPinIds],
  )
  const look = festivalMap ? pinSizeForZoom(zoom ?? 0) : TILE_MAP_PIN
  const annotations = useMemo(
    () => (festivalMap && zoom !== null ? buildAnnotations(festivalMap, mapPins, zoom, selectedId, activeIds, stages) : []),
    [festivalMap, mapPins, zoom, selectedId, activeIds, stages],
  )
  usePinLayer(map, plainPins, selectedId, onSelect, look)
  useAnnotationLayer(map, annotations, onSelect, interactive)
  return festivalMap ? Math.max(look.size, iconSize(zoom ?? 0)) : look.size
}
