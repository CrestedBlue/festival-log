import 'leaflet/dist/leaflet.css'
import { useState } from 'react'
import { festivalMapFor, isMapLabelPin } from '../../data/catalog'
import type { Festival } from '../../data/schema'
import { MapCredits } from '../map/MapCredits'
import { PIN_META } from '../map/pinMeta'
import { pinSizeForZoom } from '../map/pinSize'
import { useLeafletMap } from '../map/useLeafletMap'
import { useMapZoom, usePinLayer } from '../map/useMapLayers'
import '../map/map.css'

const TILE_MAP_PIN = { size: 38, showIcon: true }

/** Read-only festival map: the same map and pins users see, without location or pin editing. */
export default function AdminMap({ festival }: { festival: Festival }) {
  const festivalMap = festivalMapFor(festival.id)
  const { containerRef, map } = useLeafletMap({ center: festival.venue, image: festivalMap, fitPoints: festival.pins })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const zoom = useMapZoom(map)
  const pins = festivalMap ? festival.pins.filter((pin) => !isMapLabelPin(pin)) : festival.pins
  usePinLayer(map, pins, selectedId, setSelectedId, festivalMap ? pinSizeForZoom(zoom ?? 0) : TILE_MAP_PIN)
  const selected = festival.pins.find((pin) => pin.id === selectedId) ?? null

  return (
    <div className="admin-map">
      <div ref={containerRef} className={`map-canvas${festivalMap ? ' map-canvas--image' : ''}`}
        style={festivalMap?.background ? { backgroundColor: festivalMap.background } : undefined}
      />
      {festivalMap && <MapCredits text={festivalMap.attribution} />}
      {selected && (
        <div className="map-selected" role="status">
          <span className={`map-selected__icon map-pin--${selected.kind}`} aria-hidden="true">
            {PIN_META[selected.kind].emoji}
          </span>
          <span className="map-selected__name">{selected.name}</span>
          <button type="button" className="map-selected__close" aria-label="선택 닫기" onClick={() => setSelectedId(null)}>
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
