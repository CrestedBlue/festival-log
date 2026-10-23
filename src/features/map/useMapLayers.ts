import L from 'leaflet'
import { useEffect, useRef, useState } from 'react'
import type { Pin } from '../../data/schema'
import type { GeoState } from '../../hooks/useGeolocation'
import type { LatLng } from '../../lib/geo'
import { PIN_META } from './pinMeta'

const ME_SIZE = 22

/** Pin markers. Only enum-derived values go into the icon HTML; names use the title attribute. */
export interface PinLook {
  size: number
  /** Without the icon a pin is a small dot (used when zoomed out over an illustrated map). */
  showIcon: boolean
}

export function usePinLayer(
  map: L.Map | null,
  pins: readonly Pin[],
  selectedId: string | null,
  onSelect: (id: string) => void,
  { size: pinSize, showIcon }: PinLook,
) {
  useEffect(() => {
    if (!map) return
    const layer = L.layerGroup().addTo(map)
    pins.forEach((pin) => {
      const icon = L.divIcon({
        className: '',
        html: `<span class="map-pin map-pin--${pin.kind}${showIcon ? '' : ' map-pin--dot'}${pin.id === selectedId ? ' is-selected' : ''}" style="font-size:${Math.round(pinSize * 0.5)}px">${showIcon ? PIN_META[pin.kind].emoji : ''}</span>`,
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
  }, [map, pins, selectedId, onSelect, pinSize, showIcon])
}

/**
 * Catalog pins the illustrated map draws itself (a pin badge, a stage): an invisible circle over each drawing makes it
 * tappable, and the selected one gets a ring. Circles are in metres, so they grow and shrink with the drawing.
 * `active` is off while a new pin's place is being picked, so taps reach the map.
 */
export function useTapLayer(
  map: L.Map | null,
  pins: readonly Pin[],
  selectedId: string | null,
  onSelect: (id: string) => void,
  active: boolean,
) {
  useEffect(() => {
    if (!map) return
    const layer = L.layerGroup().addTo(map)
    pins.forEach((pin) => {
      if (!pin.tap) return
      const selected = pin.id === selectedId
      L.circle([pin.tap.lat, pin.tap.lng], {
        radius: pin.tap.radius,
        className: `map-tap${selected ? ' is-selected' : ''}`,
        interactive: active,
        bubblingMouseEvents: false,
        stroke: selected,
        weight: 3,
        fillOpacity: selected ? 0.15 : 0,
      })
        .on('click', () => onSelect(pin.id))
        .addTo(layer)
    })
    return () => {
      layer.remove()
    }
  }, [map, pins, selectedId, onSelect, active])
}

/** Pins to make stand out on the map for a moment (a pin-list row was tapped); a new id replays it. */
export interface PinHighlight {
  id: number
  pins: readonly Pin[]
  /** The map zooms in to frame the pins, up to this far (and never out of view of them). */
  focusZoom: number
}

const PULSE_MS = 3300 // three pulses (map.css .map-pulse)
const PULSE_MIN_PX = 48 // a pulse is at least this wide on screen, however far out the map is
const HIGHLIGHT_PANE = 'pinHighlight'
const HIGHLIGHT_PADDING: L.PointTuple = [48, 48]
const EARTH_CIRCUMFERENCE_M = 40_075_016.686
/** Where the map shows a pin: its drawing when the map draws it itself, else the pin. */
const spotOf = (pin: Pin): LatLng => pin.tap ?? pin

/**
 * A short pulse behind every pin of the highlight (all the toilets, …), after moving the map so they are in view.
 * Its own pane sits under the pin markers and over the map images.
 */
export function usePinHighlight(map: L.Map | null, highlight: PinHighlight | null, pinSize: number) {
  useEffect(() => {
    if (!map || !highlight || highlight.pins.length === 0) return
    if (!map.getPane(HIGHLIGHT_PANE)) {
      const pane = map.createPane(HIGHLIGHT_PANE)
      pane.style.zIndex = '550'
      pane.style.pointerEvents = 'none'
    }
    const layer = L.layerGroup()
    let timer = 0
    const pulse = () => {
      const zoom = map.getZoom()
      highlight.pins.forEach((pin) => {
        const at = spotOf(pin)
        const metresPerPx = (EARTH_CIRCUMFERENCE_M * Math.cos((at.lat * Math.PI) / 180)) / 2 ** (zoom + 8)
        const size = Math.round(Math.max(PULSE_MIN_PX, Math.max(pinSize, pin.tap ? (2 * pin.tap.radius) / metresPerPx : 0) * 1.8))
        L.marker([at.lat, at.lng], {
          pane: HIGHLIGHT_PANE,
          interactive: false,
          keyboard: false,
          icon: L.divIcon({ className: '', html: '<span class="map-pulse"></span>', iconSize: [size, size] }),
        }).addTo(layer)
      })
      layer.addTo(map)
      timer = window.setTimeout(() => layer.remove(), PULSE_MS)
    }
    const spots = highlight.pins.map(spotOf)
    const bounds = L.latLngBounds(spots.map((p) => [p.lat, p.lng] as L.LatLngTuple))
    // frame them all: zoom in up to focusZoom (further if already in), out as far as needed
    const zoom = Math.min(map.getBoundsZoom(bounds, false, L.point(HIGHLIGHT_PADDING).multiplyBy(2)), Math.max(map.getZoom(), highlight.focusZoom))
    const inView = map.getBounds().pad(-0.1).contains(bounds) && Math.abs(map.getZoom() - zoom) < 0.25
    if (inView) pulse()
    else {
      map.once('moveend', pulse)
      map.flyTo(bounds.getCenter(), zoom)
    }
    return () => {
      map.off('moveend', pulse)
      window.clearTimeout(timer)
      layer.remove()
    }
  }, [map, highlight, pinSize])
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

/** Current zoom level, updated after every zoom. */
export function useMapZoom(map: L.Map | null): number | null {
  const [zoom, setZoom] = useState<number | null>(null)
  useEffect(() => {
    if (!map) return
    const update = () => setZoom(map.getZoom())
    update()
    map.on('zoomend', update)
    return () => {
      map.off('zoomend', update)
    }
  }, [map])
  return zoom
}
