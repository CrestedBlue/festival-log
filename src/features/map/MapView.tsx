import 'leaflet/dist/leaflet.css'
import { useCallback, useEffect, useRef, useState } from 'react'
import { addPin, removePin, updateFestival } from '../../data/actions'
import { PinSchema, VenueSchema, type Festival, type PinKind } from '../../data/schema'
import { showNotice, updateData } from '../../data/store'
import { LocateIcon, PlusIcon } from '../../components/icons'
import { useGeolocation } from '../../hooks/useGeolocation'
import { distanceMeters, formatDistance, type LatLng } from '../../lib/geo'
import { makeId } from '../../lib/id'
import { PinForm } from './PinForm'
import { PIN_META } from './pinMeta'
import { DEFAULT_ZOOM, useLeafletMap } from './useLeafletMap'
import { useMapPick, useMyLocationLayer, usePinLayer } from './useMapLayers'
import './map.css'

const FOCUS_ZOOM = 17

async function isLocationAlreadyGranted(): Promise<boolean> {
  try {
    const status = await navigator.permissions?.query({ name: 'geolocation' })
    return status?.state === 'granted'
  } catch (error) {
    console.warn('[festival-log] permissions API unavailable', error)
    return false
  }
}

export default function MapView({ festival }: { festival: Festival }) {
  const { containerRef, map } = useLeafletMap(festival.venue)
  const [tracking, setTracking] = useState(false)
  const [retryKey, setRetryKey] = useState(0)
  const geo = useGeolocation(tracking, retryKey)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [picking, setPicking] = useState(false)
  const [draft, setDraft] = useState<LatLng | null>(null)
  const flyOnNextFix = useRef(false)
  const me = geo.status === 'ok' ? geo.position : null

  const onPick = useCallback((at: LatLng) => {
    setPicking(false)
    setDraft(at)
  }, [])

  usePinLayer(map, festival.pins, selectedId, setSelectedId)
  useMyLocationLayer(map, geo)
  useMapPick(map, picking, onPick)

  // Skip the permission prompt dance if the user already allowed location before.
  useEffect(() => {
    void isLocationAlreadyGranted().then((granted) => granted && setTracking(true))
  }, [])

  useEffect(() => {
    if (!map || !me || !flyOnNextFix.current) return
    flyOnNextFix.current = false
    map.flyTo([me.lat, me.lng], Math.max(map.getZoom(), FOCUS_ZOOM))
  }, [map, me])

  const locate = () => {
    if (map && me) {
      map.flyTo([me.lat, me.lng], Math.max(map.getZoom(), FOCUS_ZOOM))
      return
    }
    flyOnNextFix.current = true
    setTracking(true)
    if (geo.status === 'error') setRetryKey((k) => k + 1)
  }

  const focusPin = (id: string, at: LatLng) => {
    setSelectedId(id)
    map?.flyTo([at.lat, at.lng], Math.max(map.getZoom(), FOCUS_ZOOM))
  }

  const savePin = (name: string, kind: PinKind) => {
    if (!draft) return
    const parsed = PinSchema.safeParse({ id: makeId(), name, kind, lat: draft.lat, lng: draft.lng })
    if (!parsed.success) {
      showNotice('error', '핀을 저장하지 못했어요. 이름을 확인해 주세요.')
      return
    }
    updateData((d) => addPin(d, festival.id, parsed.data))
    setDraft(null)
    setSelectedId(parsed.data.id)
  }

  const deletePin = (id: string, name: string) => {
    if (!window.confirm(`'${name}' 핀을 지울까요?`)) return
    updateData((d) => removePin(d, festival.id, id))
    setSelectedId(null)
  }

  const saveVenueHere = () => {
    if (!map) return
    const center = map.getCenter().wrap()
    const venue = VenueSchema.safeParse({ ...festival.venue, lat: center.lat, lng: center.lng })
    if (!venue.success) {
      showNotice('error', '이 위치는 저장할 수 없어요. 지도를 행사장 쪽으로 옮겨 주세요.')
      return
    }
    updateData((d) => updateFestival(d, festival.id, { venue: venue.data }))
    showNotice('info', '지금 화면 가운데를 행사장 위치로 저장했어요.')
  }

  const backToVenue = () => map?.flyTo([festival.venue.lat, festival.venue.lng], DEFAULT_ZOOM)

  const rows = festival.pins
    .map((pin) => ({ pin, distance: me ? distanceMeters(me, pin) : null }))
    .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0) || a.pin.name.localeCompare(b.pin.name, 'ko'))

  return (
    <section className="map-view" aria-label="지도">
      <div className="map-stage">
        <div ref={containerRef} className="map-canvas" />
        <div className="map-fabs">
          <button type="button" className={`map-fab${tracking ? ' is-on' : ''}`} onClick={locate} aria-label="내 위치 보기">
            <LocateIcon />
          </button>
          <button
            type="button"
            className={`map-fab${picking ? ' is-on' : ''}`}
            onClick={() => {
              setDraft(null)
              setPicking((v) => !v)
            }}
            aria-pressed={picking}
            aria-label="핀 추가"
          >
            <PlusIcon />
          </button>
        </div>
        {picking && (
          <p className="map-hint" role="status">
            핀을 꽂을 곳을 지도에서 탭하세요
            {me && (
              <button type="button" className="btn btn--small btn--accent" onClick={() => onPick(me)}>
                내 위치에 꽂기
              </button>
            )}
          </p>
        )}
        {geo.status === 'locating' && <p className="map-hint" role="status">위치 찾는 중…</p>}
        {geo.status === 'error' && (
          <p className="map-hint map-hint--error" role="alert">
            {geo.message}
          </p>
        )}
      </div>

      <div className="map-panel">
        {draft ? (
          <PinForm onSave={savePin} onCancel={() => setDraft(null)} />
        ) : (
          <>
            <div className="map-panel__head">
              <h2 className="map-panel__title">핀 {festival.pins.length}개</h2>
              <div className="map-panel__tools">
                <button type="button" className="btn btn--small" onClick={backToVenue}>
                  행사장으로
                </button>
                <button type="button" className="btn btn--small btn--ghost" onClick={saveVenueHere}>
                  여기를 행사장으로 저장
                </button>
              </div>
            </div>
            {rows.length === 0 ? (
              <p className="map-panel__empty">+ 버튼을 눌러 스테이지, 화장실, 만날 장소를 표시해 두세요.</p>
            ) : (
              <ul className="pin-list">
                {rows.map(({ pin, distance }) => (
                  <li key={pin.id} className={pin.id === selectedId ? 'is-selected' : undefined}>
                    <button type="button" className="pin-list__main" onClick={() => focusPin(pin.id, pin)}>
                      <span className={`pin-list__icon map-pin--${pin.kind}`} aria-hidden="true">
                        {PIN_META[pin.kind].emoji}
                      </span>
                      <span className="pin-list__name">{pin.name}</span>
                      {distance !== null && <span className="pin-list__dist">{formatDistance(distance)}</span>}
                    </button>
                    {pin.id === selectedId && (
                      <button type="button" className="btn btn--small btn--danger" onClick={() => deletePin(pin.id, pin.name)}>
                        삭제
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </section>
  )
}
