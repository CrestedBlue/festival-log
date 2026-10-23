import 'leaflet/dist/leaflet.css'
import { useCallback, useEffect, useRef, useState } from 'react'
import { addUserPin, removeUserPin } from '../../data/userData'
import { PinSchema, type Festival, type PinKind } from '../../data/schema'
import { showNotice, updateData } from '../../data/store'
import { LocateIcon, PlusIcon } from '../../components/icons'
import { useGeolocation } from '../../hooks/useGeolocation'
import { useStoredFlag } from '../../hooks/useStoredFlag'
import { distanceMeters, formatDistance, isInsideBounds, type LatLng } from '../../lib/geo'
import { makeId } from '../../lib/id'
import { festivalMapFor, isMapLabelPin } from '../../data/catalog'
import { MapCredits } from './MapCredits'
import { PinForm } from './PinForm'
import { PIN_META } from './pinMeta'
import { useLeafletMap } from './useLeafletMap'
import { pinSizeForZoom } from './pinSize'
import { useMapPick, useMapZoom, useMyLocationLayer, usePinHighlight, usePinLayer, useTapLayer, type PinHighlight } from './useMapLayers'
import { groupPins, type PinGroup } from './pinGroups'
import './map.css'

const FOCUS_ZOOM = 17
const TILE_MAP_PIN = { size: 38, showIcon: true }
const PANEL_COLLAPSED_KEY = 'festival-log:pins-collapsed'

async function isLocationAlreadyGranted(): Promise<boolean> {
  try {
    const status = await navigator.permissions?.query({ name: 'geolocation' })
    return status?.state === 'granted'
  } catch (error) {
    console.warn('[festival-log] permissions API unavailable', error)
    return false
  }
}

interface Props {
  festival: Festival
  /** Pins the user added; only these can be deleted (the rest come from the festival catalog). */
  userPinIds: ReadonlySet<string>
}

export default function MapView({ festival, userPinIds }: Props) {
  const festivalMap = festivalMapFor(festival.id)
  const { containerRef, map } = useLeafletMap({ center: festival.venue, image: festivalMap, fitPoints: festival.pins })
  const [tracking, setTracking] = useState(false)
  const [retryKey, setRetryKey] = useState(0)
  const geo = useGeolocation(tracking, retryKey)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [picking, setPicking] = useState(false)
  const [draft, setDraft] = useState<LatLng | null>(null)
  // The pin-list row last tapped (its pins pulse on the map)
  const [highlight, setHighlight] = useState<PinHighlight | null>(null)
  const [activeGroup, setActiveGroup] = useState<string | null>(null)
  const [collapsed, setCollapsed] = useStoredFlag(PANEL_COLLAPSED_KEY, true)
  const flyOnNextFix = useRef(false)
  const me = geo.status === 'ok' ? geo.position : null
  // On an illustrated map a fix outside the image can't be shown, only described.
  const meOffMap = me !== null && festivalMap !== null && !isInsideBounds(me, festivalMap.bounds)

  const onPick = useCallback((at: LatLng) => {
    setPicking(false)
    setDraft(at)
  }, [])

  const zoom = useMapZoom(map)
  // The illustrated map already labels stages, exits, … so only the other pins are drawn on it.
  const mapPins = festivalMap ? festival.pins.filter((pin) => !isMapLabelPin(pin)) : festival.pins
  // …but where the map draws one itself (a badge, a stage), tapping the drawing selects it.
  const drawnPins = festivalMap ? festival.pins.filter((pin) => isMapLabelPin(pin) && pin.tap) : []
  const pinLook = festivalMap ? pinSizeForZoom(zoom ?? 0) : TILE_MAP_PIN
  usePinLayer(map, mapPins, selectedId, setSelectedId, pinLook)
  useTapLayer(map, drawnPins, selectedId, setSelectedId, !picking)
  usePinHighlight(map, highlight, pinLook.size)
  useMyLocationLayer(map, geo)
  useMapPick(map, picking, onPick)

  // Skip the permission prompt dance if the user already allowed location before.
  useEffect(() => {
    void isLocationAlreadyGranted().then((granted) => granted && setTracking(true))
  }, [])

  useEffect(() => {
    if (!map || !me || meOffMap || !flyOnNextFix.current) return
    flyOnNextFix.current = false
    map.flyTo([me.lat, me.lng], Math.max(map.getZoom(), FOCUS_ZOOM))
  }, [map, me, meOffMap])

  const locate = () => {
    if (map && me) {
      if (!meOffMap) map.flyTo([me.lat, me.lng], Math.max(map.getZoom(), FOCUS_ZOOM))
      return
    }
    flyOnNextFix.current = true
    setTracking(true)
    if (geo.status === 'error') setRetryKey((k) => k + 1)
  }

  // A row of one pin selects it; a row of several (화장실 N개) makes them all pulse. Either way the map moves to show them.
  const showGroup = (group: PinGroup) => {
    const only = group.pins.length === 1 ? group.pins[0] : null
    setSelectedId(only ? only.id : null)
    setActiveGroup(group.key)
    setHighlight({ id: Date.now(), pins: group.pins, focusZoom: FOCUS_ZOOM })
  }

  const savePin = (name: string, kind: PinKind) => {
    if (!draft) return
    const parsed = PinSchema.safeParse({ id: makeId(), name, kind, lat: draft.lat, lng: draft.lng })
    if (!parsed.success) {
      showNotice('error', '핀을 저장하지 못했어요. 이름을 확인해 주세요.')
      return
    }
    updateData((d) => addUserPin(d, festival.id, parsed.data))
    setDraft(null)
    setSelectedId(parsed.data.id)
  }

  const deletePin = (id: string, name: string) => {
    if (!window.confirm(`'${name}' 핀을 지울까요?`)) return
    updateData((d) => removeUserPin(d, festival.id, id))
    setSelectedId(null)
  }

  const selected = festival.pins.find((pin) => pin.id === selectedId) ?? null

  const rows = groupPins(festival.pins, me)
  const isActive = (group: PinGroup) =>
    selectedId !== null ? group.pins.some((pin) => pin.id === selectedId) : activeGroup === group.key

  const hint = picking ? (
    <p className="map-hint" role="status">
      핀을 꽂을 곳을 지도에서 탭하세요
      {me && !meOffMap && (
        <button type="button" className="btn btn--small btn--accent" onClick={() => onPick(me)}>
          내 위치에 꽂기
        </button>
      )}
    </p>
  ) : geo.status === 'error' ? (
    <p className="map-hint map-hint--error" role="alert">
      {geo.message}
    </p>
  ) : geo.status === 'locating' ? (
    <p className="map-hint" role="status">
      위치 찾는 중…
    </p>
  ) : meOffMap && me ? (
    <p className="map-hint" role="status">
      지금 위치는 지도 밖이에요 · 행사장까지 {formatDistance(distanceMeters(me, festival.venue))}
    </p>
  ) : null

  return (
    <section className="map-view" aria-label="지도">
      <div className="map-stage">
        <div ref={containerRef} className={`map-canvas${festivalMap ? ' map-canvas--image' : ''}`}
        style={festivalMap?.background ? { backgroundColor: festivalMap.background } : undefined}
      />
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
        {hint}
        {festivalMap && <MapCredits text={festivalMap.attribution} />}
        {selected && collapsed && !draft && (
          <div className="map-selected" role="status">
            <span className={`map-selected__icon map-pin--${selected.kind}`} aria-hidden="true">
              {PIN_META[selected.kind].emoji}
            </span>
            <span className="map-selected__name">{selected.name}</span>
            {me && <span className="pin-list__dist">{formatDistance(distanceMeters(me, selected))}</span>}
            <button
              type="button"
              className="map-selected__close"
              aria-label="선택 닫기"
              onClick={() => {
                setSelectedId(null)
                setActiveGroup(null)
              }}
            >
              ✕
            </button>
          </div>
        )}
      </div>

      <div className={`map-panel${collapsed && !draft ? ' is-collapsed' : ''}`}>
        {draft ? (
          <PinForm onSave={savePin} onCancel={() => setDraft(null)} />
        ) : (
          <>
            <button
              type="button"
              className="map-panel__toggle"
              aria-expanded={!collapsed}
              aria-controls="pin-list"
              onClick={() => setCollapsed(!collapsed)}
            >
              <span className="map-panel__title">핀 {festival.pins.length}개</span>
              <span className="map-panel__chevron" aria-hidden="true" />
            </button>
            {!collapsed && (
              <div id="pin-list">
                {rows.length === 0 ? (
                  <p className="map-panel__empty">+ 버튼을 눌러 스테이지, 화장실, 만날 장소를 표시해 두세요.</p>
                ) : (
                  <ul className="pin-list">
                    {rows.map((group) => {
                      const only = group.pins.length === 1 ? group.pins[0] : null
                      return (
                        <li key={group.key} className={isActive(group) ? 'is-selected' : undefined}>
                          <button type="button" className="pin-list__main" onClick={() => showGroup(group)}>
                            <span className={`pin-list__icon map-pin--${group.kind}`} aria-hidden="true">
                              {PIN_META[group.kind].emoji}
                            </span>
                            <span className="pin-list__name">{group.label}</span>
                            {group.distance !== null && (
                              <span className="pin-list__dist">
                                {only ? '' : '가까운 곳 '}
                                {formatDistance(group.distance)}
                              </span>
                            )}
                          </button>
                          {only && only.id === selectedId && userPinIds.has(only.id) && (
                            <button type="button" className="btn btn--small btn--danger" onClick={() => deletePin(only.id, only.name)}>
                              삭제
                            </button>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
