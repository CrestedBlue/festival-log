import L from 'leaflet'
import { useEffect, useRef, useState } from 'react'
import type { LatLng } from '../../lib/geo'
import type { FestivalMap } from './festivalMaps'

const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
const DEFAULT_ZOOM = 16
const MAX_ZOOM = 19
const FIT_PADDING: L.PointTuple = [32, 32]
const IMAGE_ZOOM_SNAP = 0.25

interface Options {
  center: LatLng
  image: FestivalMap | null
  /** Without an illustrated map, the tile map opens fitted to these (usually the pins). */
  fitPoints: readonly LatLng[]
}

/** The festival's own illustrated map when it has one; plain OSM tiles otherwise. */
function setUpLayers(map: L.Map, { center, image, fitPoints }: Options): () => void {
  if (image) {
    const bounds = L.latLngBounds(image.bounds.map(([lat, lng]) => [lat, lng] as L.LatLngTuple))
    L.imageOverlay(image.imageUrl, bounds, { attribution: image.attribution }).addTo(map)
    map.setMaxBounds(bounds)
    map.fitBounds(image.initialView.map(([lat, lng]) => [lat, lng] as L.LatLngTuple))
    // Open with the image filling the screen (no empty bands); zooming out further is still allowed.
    const coverZoom = map.getBoundsZoom(bounds, true)
    if (map.getZoom() < coverZoom) map.setZoom(coverZoom)
    // Zooming out stops once the whole image (venue + both stations) fits on screen.
    const syncMinZoom = () => map.setMinZoom(map.getBoundsZoom(bounds, false))
    syncMinZoom()
    return syncMinZoom
  }
  L.tileLayer(TILE_URL, { maxZoom: MAX_ZOOM, attribution: ATTRIBUTION, crossOrigin: true }).addTo(map)
  if (fitPoints.length > 0) map.fitBounds(fitPoints.map((p) => [p.lat, p.lng] as L.LatLngTuple), { padding: FIT_PADDING, maxZoom: 17 })
  else map.setView([center.lat, center.lng], DEFAULT_ZOOM)
  return () => {}
}

/** Creates a Leaflet map once per mount and tears it down on unmount. */
export function useLeafletMap(options: Options) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<L.Map | null>(null)
  const initialOptions = useRef(options)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const { image } = initialOptions.current
    const instance = L.map(el, {
      zoomControl: false,
      maxZoom: MAX_ZOOM,
      zoomSnap: image ? IMAGE_ZOOM_SNAP : 1,
      maxBoundsViscosity: image ? 1 : 0,
    })
    const onResize = setUpLayers(instance, initialOptions.current)
    instance.attributionControl.setPrefix(false)
    L.control.zoom({ position: 'bottomright' }).addTo(instance)
    // The bottom panel changes height (collapsed, list, form), so keep Leaflet's size in sync.
    const resizeObserver = new ResizeObserver(() => {
      instance.invalidateSize()
      onResize()
    })
    resizeObserver.observe(el)
    setMap(instance)
    return () => {
      resizeObserver.disconnect()
      instance.remove()
      setMap(null)
    }
  }, [])

  return { containerRef, map }
}
