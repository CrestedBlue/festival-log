import { useEffect, useState } from 'react'
import type { LatLng } from '../lib/geo'

export type GeoState =
  | { status: 'off' }
  | { status: 'locating' }
  | { status: 'ok'; position: LatLng; accuracy: number }
  | { status: 'error'; message: string }

const WATCH_OPTIONS: PositionOptions = { enableHighAccuracy: true, maximumAge: 10_000, timeout: 20_000 }

function describeError(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return '위치 권한이 꺼져 있어요. 브라우저/폰 설정에서 이 사이트의 위치 접근을 허용해 주세요.'
    case error.POSITION_UNAVAILABLE:
      return '지금은 위치를 찾을 수 없어요. 하늘이 보이는 곳에서 다시 시도해 보세요.'
    default:
      return '위치를 찾는 데 시간이 너무 오래 걸려요. 잠시 후 다시 시도해 주세요.'
  }
}

/** `retryKey` lets callers restart the watch after an error (e.g. once permission is granted). */
export function useGeolocation(enabled: boolean, retryKey = 0): GeoState {
  const [state, setState] = useState<GeoState>({ status: 'off' })

  useEffect(() => {
    if (!enabled) {
      setState({ status: 'off' })
      return
    }
    if (!window.isSecureContext || !('geolocation' in navigator)) {
      setState({ status: 'error', message: '위치 기능은 HTTPS 주소에서만 쓸 수 있어요.' })
      return
    }
    setState({ status: 'locating' })
    const watchId = navigator.geolocation.watchPosition(
      (pos) =>
        setState({
          status: 'ok',
          position: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          accuracy: pos.coords.accuracy,
        }),
      // A timeout after a good fix shouldn't wipe the last known position.
      (error) =>
        setState((prev) =>
          prev.status === 'ok' && error.code === error.TIMEOUT ? prev : { status: 'error', message: describeError(error) },
        ),
      WATCH_OPTIONS,
    )
    return () => navigator.geolocation.clearWatch(watchId)
  }, [enabled, retryKey])

  return state
}
