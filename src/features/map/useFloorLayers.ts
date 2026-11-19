import L from 'leaflet'
import { useEffect } from 'react'
import type { FestivalMap } from './festivalMaps'
import { toLatLngBounds } from './useLeafletMap'

/**
 * The floor plans of the shown floor over the map's images, in the map's own order (the floors' layers are never merged):
 * switching the floor takes the old floor's layers off and puts the new one's on.
 */
export function useFloorLayers(map: L.Map | null, festivalMap: FestivalMap | null, floor: number | null) {
  useEffect(() => {
    if (!map || !festivalMap || floor === null) return
    const overlays = festivalMap.layers
      .filter((layer) => layer.floor === floor)
      .map((layer) => L.imageOverlay(layer.url, toLatLngBounds(layer.bounds)).addTo(map))
    return () => overlays.forEach((overlay) => overlay.remove())
  }, [map, festivalMap, floor])
}
