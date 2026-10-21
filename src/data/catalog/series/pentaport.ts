import { seriesMapFor } from '../../../features/map/festivalMaps'
import type { Pin } from '../../schema'
import { PENTAPORT_SERIES as CODE } from '../ids'
import type { FestivalSeries } from './types'

// Places drawn on the official map (scripts/map/build-pentaport.mjs carries them onto real coordinates).
// They are labelled in the drawing, so they are listed but not drawn again on it.
const DRAWN_PINS: ReadonlyArray<readonly [key: string, pin: Omit<Pin, 'id' | 'lat' | 'lng'>, anchorKey: string]> = [
  ['kb-stage', { name: 'KB국민카드 STAGE', kind: 'stage' }, 'kbStage'],
  ['monster-stage', { name: 'MONSTER ENERGY STAGE', kind: 'stage' }, 'monsterStage'],
  ['stanley-stage', { name: 'STANLEY 1913 STAGE', kind: 'stage' }, 'stanleyStage'],
  ['gate-1', { name: 'GATE 1', kind: 'etc' }, 'gate1'],
  ['gate-2', { name: 'GATE 2', kind: 'etc' }, 'gate2'],
  ['security-check', { name: '물품검색존', kind: 'etc' }, 'securityCheck'],
  ['ticket-booth-1', { name: '제1 티켓부스 (지하철 이용객)', kind: 'wristband' }, 'ticketBooth1'],
  ['ticket-booth-2', { name: '제2 티켓부스 (셔틀버스·택시 이용객)', kind: 'wristband' }, 'ticketBooth2'],
  ['free-shuttle-pickup', { name: '무료 셔틀버스 승차장', kind: 'etc' }, 'freeShuttlePickup'],
  ['shuttle-drop-off', { name: '무료 셔틀버스 하차장 · 유료 셔틀버스 승하차장', kind: 'etc' }, 'shuttleDropOff'],
]

// OpenStreetMap subway entrances: exact, so they are drawn on top of the map (the drawing's exit circles
// are only roughly placed).
const EXIT_PINS: readonly Pin[] = [
  { id: `${CODE}-exit-1`, name: '송도달빛축제공원역 1번 출구 (인천 1호선)', kind: 'etc', lat: 37.4066832, lng: 126.6258288 },
  { id: `${CODE}-exit-3`, name: '송도달빛축제공원역 3번 출구 (인천 1호선)', kind: 'etc', lat: 37.4073687, lng: 126.6260568 },
  { id: `${CODE}-exit-4`, name: '송도달빛축제공원역 4번 출구 (인천 1호선)', kind: 'etc', lat: 37.4069213, lng: 126.6263411 },
]

function drawnPins(): Pin[] {
  const map = seriesMapFor(CODE)
  if (!map) throw new Error('Pentaport map metadata is missing')
  return DRAWN_PINS.map(([key, pin, anchorKey]) => {
    const point = map.anchors[anchorKey]
    if (!point) throw new Error(`Pentaport map has no anchor "${anchorKey}"`)
    return { id: `${CODE}-zone-${key}`, ...pin, lat: point[0], lng: point[1] }
  })
}

/**
 * Incheon Pentaport Rock Festival at Songdo Moonlight Festival Park (Incheon). The venue point is the
 * park outline's centroid (OpenStreetMap); the map is the official entrance map laid onto real coordinates.
 */
export const PENTAPORT: FestivalSeries = {
  code: CODE,
  name: '인천펜타포트 락 페스티벌',
  venue: { name: '송도달빛축제공원', lat: 37.406261, lng: 126.63584 },
  pins: () => [...drawnPins(), ...EXIT_PINS],
  sources: [
    // Only the timetable post (2026-07-09) was read here; without logging in the account shows its newest 12 posts.
    { method: '인스타', value: '@pentaportrf', lastScrapedPostDate: '2026-07-09' },
    // Mirrors the Instagram posts; every 2026 notice up to 2026-08-06 was checked (2026-10-20).
    { method: '공홈', value: 'https://www.pentaport.co.kr/Notice', lastScrapedPostDate: '2026-08-06' },
  ],
  // No design of its own yet: the app's ink color and plain dots, stage colors from the 2026 poster.
  theme: {
    accent: null,
    art: null,
    stages: {
      kb: { color: '#f5a50a', icon: 'dot' },
      monster: { color: '#6abf2e', icon: 'dot' },
      stanley: { color: '#55555f', icon: 'dot' },
    },
  },
}
