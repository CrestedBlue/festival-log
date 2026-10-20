import type { Pin } from '../../schema'
import { PENTAPORT_SERIES as CODE } from '../ids'
import type { FestivalSeries } from './types'

const PINS: readonly Pin[] = [
  { id: `${CODE}-zone-venue`, name: '송도달빛축제공원 · 행사장', kind: 'stage', lat: 37.406261, lng: 126.63584 },
  { id: `${CODE}-zone-moonlight-park-exit-4`, name: '송도달빛축제공원역 4번 출구 (인천 1호선)', kind: 'etc', lat: 37.4069213, lng: 126.6263411 },
]

/**
 * Incheon Pentaport Rock Festival at Songdo Moonlight Festival Park (Incheon). Coordinates: OpenStreetMap
 * (the park outline's centroid, and Songdo Moonlight Festival Park station exit 4 — the exit closest to the
 * park's edge in a straight line, ~280 m). No illustrated map yet, so the app shows it on OpenStreetMap tiles.
 */
export const PENTAPORT: FestivalSeries = {
  code: CODE,
  name: '인천펜타포트 락 페스티벌',
  venue: { name: '송도달빛축제공원', lat: 37.406261, lng: 126.63584 },
  pins: () => [...PINS],
}
