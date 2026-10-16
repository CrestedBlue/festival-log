import L from 'leaflet'
import { useEffect, useRef, useState } from 'react'
import type { LatLng } from '../../lib/geo'

const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
export const DEFAULT_ZOOM = 16
const MAX_ZOOM = 19

/** Creates a Leaflet map once per mount and tears it down on unmount. */
export function useLeafletMap(center: LatLng) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<L.Map | null>(null)
  const initialCenter = useRef(center)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const instance = L.map(el, { zoomControl: false }).setView(
      [initialCenter.current.lat, initialCenter.current.lng],
      DEFAULT_ZOOM,
    )
    // CORS tiles let the service worker cache real (non-opaque) responses that don't bloat storage quota.
    L.tileLayer(TILE_URL, { maxZoom: MAX_ZOOM, attribution: ATTRIBUTION, crossOrigin: true }).addTo(instance)
    L.control.zoom({ position: 'bottomright' }).addTo(instance)
    // The bottom panel changes height (pin list ↔ form), so keep Leaflet's size in sync.
    const resizeObserver = new ResizeObserver(() => instance.invalidateSize())
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
