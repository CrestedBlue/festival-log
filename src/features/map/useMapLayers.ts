import L from 'leaflet'
import { useEffect, useRef } from 'react'
import type { Pin } from '../../data/schema'
import type { GeoState } from '../../hooks/useGeolocation'
import type { LatLng } from '../../lib/geo'
import { PIN_META } from './pinMeta'

const ME_SIZE = 22

/** Pin markers. Only enum-derived values go into the icon HTML; names use the title attribute. */
export function usePinLayer(
  map: L.Map | null,
  pins: readonly Pin[],
  selectedId: string | null,
  onSelect: (id: string) => void,
  pinSize: number,
) {
  useEffect(() => {
    if (!map) return
    const layer = L.layerGroup().addTo(map)
    pins.forEach((pin) => {
      const icon = L.divIcon({
        className: '',
        html: `<span class="map-pin map-pin--${pin.kind}${pin.id === selectedId ? ' is-selected' : ''}" style="font-size:${Math.round(pinSize * 0.47)}px">${PIN_META[pin.kind].emoji}</span>`,
        iconSize: [pinSize, pinSize],
        iconAnchor: [pinSize / 2, pinSize / 2],
      })
      L.marker([pin.lat, pin.lng], { icon, title: pin.name, alt: pin.name, riseOnHover: true })
        .on('click', () => onSelect(pin.id))
        .addTo(layer)
    })
    return () => {
      layer.remove()
    }
  }, [map, pins, selectedId, onSelect, pinSize])
}

/** Blue dot + accuracy ring for the device position. */
export function useMyLocationLayer(map: L.Map | null, geo: GeoState) {
  const markerRef = useRef<L.Marker | null>(null)
  const circleRef = useRef<L.Circle | null>(null)

  useEffect(() => {
    if (!map) return
    if (geo.status !== 'ok') {
      markerRef.current?.remove()
      circleRef.current?.remove()
      markerRef.current = null
      circleRef.current = null
      return
    }
    const at: L.LatLngExpression = [geo.position.lat, geo.position.lng]
    if (!markerRef.current || !circleRef.current) {
      circleRef.current = L.circle(at, { radius: geo.accuracy, className: 'map-me-accuracy', interactive: false }).addTo(map)
      markerRef.current = L.marker(at, {
        icon: L.divIcon({ className: '', html: '<span class="map-me"></span>', iconSize: [ME_SIZE, ME_SIZE] }),
        interactive: false,
        keyboard: false,
        zIndexOffset: 1000,
      }).addTo(map)
      return
    }
    markerRef.current.setLatLng(at)
    circleRef.current.setLatLng(at).setRadius(geo.accuracy)
  }, [map, geo])

  useEffect(
    () => () => {
      markerRef.current?.remove()
      circleRef.current?.remove()
    },
    [],
  )
}

/** While picking, the next map tap returns its coordinates. */
export function useMapPick(map: L.Map | null, active: boolean, onPick: (at: LatLng) => void) {
  useEffect(() => {
    if (!map || !active) return
    const container = map.getContainer()
    container.classList.add('is-picking')
    const handler = (e: L.LeafletMouseEvent) => onPick({ lat: e.latlng.lat, lng: e.latlng.lng })
    map.once('click', handler)
    return () => {
      container.classList.remove('is-picking')
      map.off('click', handler)
    }
  }, [map, active, onPick])
}
