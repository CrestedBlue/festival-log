import pentaportArt from '../../../assets/art/pentaport.svg'
import { seriesMapFor } from '../../../features/map/festivalMaps'
import { RANK } from '../../../features/map/pinGroups'
import type { Pin } from '../../schema'
import { PENTAPORT_SERIES as CODE } from '../ids'
import type { FestivalSeries } from './types'

// The map is the official site map redrawn in layers (scripts/map/layers/pentaport/). Its pins (layer 3, the official
// legend) are drawn by the app as the map's own icons; stages are named on the map and not listed. Places too alike
// to tell apart are one entry: the security check and the lockers beside it; a gate and its 입장동선. Each list row
// is a broader role (쿨존 with the main cool zone, …) — toilets are not merged with anything. Kinds the app has no
// emoji for are "etc".
interface MarkMeta {
  kind: Pin['kind']
  rank?: number
  name: string
  /** The list row it belongs to; the name when alone. */
  group?: string
  caption?: string
  detail?: string
}
const ENTRANCE = '입장' // ticket booths and gates; first in the list
const MARK_KINDS: Record<string, MarkMeta> = {
  gate1: { kind: 'etc', rank: 0, name: 'GATE 1', group: ENTRANCE, caption: 'GATE 1', detail: '제1 입장동선 · 지하철 이용객이 들어오는 문' },
  gate2: { kind: 'etc', rank: 0, name: 'GATE 2', group: ENTRANCE, caption: 'GATE 2', detail: '제2 입장동선 · 셔틀버스·택시 이용객이 들어오는 문' },
  checkLockers: { kind: 'luggage', name: '물품검색·보관소', detail: 'GATE 1 앞 물품검색존: 물품검색대와 물품보관소' },
  info: { kind: 'info', name: '종합안내소', group: '안내' },
  interpretation: { kind: 'info', name: '통역 안내', group: '안내' },
  barrierFreeZone: { kind: 'etc', rank: RANK.barrierFree, name: '배리어 프리 존', group: '배리어 프리' },
  barrierFreePass: { kind: 'etc', rank: RANK.barrierFree, name: '배리어 프리 패스', group: '배리어 프리' },
  pentaDreamer: { kind: 'etc', name: '펜타 드리머', group: '홍보·벤더 부스' },
  promotionBooth: { kind: 'etc', name: '홍보 부스', group: '홍보·벤더 부스' },
  vendorBooth: { kind: 'etc', name: '벤더 부스', group: '홍보·벤더 부스' },
  fnb: { kind: 'food', name: 'F&B' },
  bar: { kind: 'food', name: '주류' },
  waterBar: { kind: 'water', name: '워터바' },
  kiosk: { kind: 'etc', name: '키오스크' },
  medical: { kind: 'firstaid', name: '의료부스' },
  coolZone: { kind: 'etc', rank: RANK.coolZone, name: '쿨존', group: '쿨존' },
  mainCoolZone: { kind: 'etc', rank: RANK.coolZone, name: '메인쿨존', group: '쿨존' },
  officialMd: { kind: 'shop', name: '공식MD', group: 'MD 부스' },
  artistMd: { kind: 'shop', name: '아티스트MD', group: 'MD 부스' },
  charging: { kind: 'etc', name: '모바일 충전소' },
  toilet: { kind: 'toilet', name: '화장실' },
  accessibleToilet: { kind: 'toilet', rank: RANK.accessibleToilet, name: '장애인 화장실' },
  washStation: { kind: 'etc', rank: RANK.washStation, name: '개수대' },
  nursingRoom: { kind: 'etc', name: '수유실' },
  police: { kind: 'etc', name: '연수 경찰서', group: '경찰·소방' },
  fireStation: { kind: 'etc', name: '송도 소방서', group: '경찰·소방' },
  smoking: { kind: 'smoking', name: '흡연구역' },
}

// Places outside the redrawn venue map, read off the official entrance map ("입장 동선 안내", 2026-07-14) laid onto
// real coordinates. Roughly placed, so marked (대략).
const ENTRANCE_PINS: readonly Pin[] = [
  { id: `${CODE}-place-ticket-booth-1`, rank: 0, name: '제1 티켓부스 (대략)', group: ENTRANCE, caption: '제1 티켓부스', detail: '지하철 이용객 · 손목밴드로 바꾼 뒤 제1 입장동선으로 GATE 1', mapIcon: 'ticket', kind: 'wristband', lat: 37.406334, lng: 126.627492 },
  { id: `${CODE}-place-ticket-booth-2`, rank: 0, name: '제2 티켓부스 (대략)', group: ENTRANCE, caption: '제2 티켓부스', detail: '셔틀버스·택시 이용객 · 손목밴드로 바꾼 뒤 제2 입장동선으로 GATE 2', mapIcon: 'ticket', kind: 'wristband', lat: 37.403316, lng: 126.633174 },
  { id: `${CODE}-place-free-shuttle-pickup`, name: '무료 셔틀버스 승차장 (대략)', group: '셔틀버스', caption: '무료 셔틀 승차', detail: '공연이 끝나고 무료 셔틀버스를 타는 곳', mapIcon: 'shuttle', kind: 'etc', lat: 37.401604, lng: 126.631595 },
  { id: `${CODE}-place-shuttle-drop-off`, name: '셔틀버스 하차장 (대략)', group: '셔틀버스', caption: '셔틀 하차 · 유료 셔틀', detail: '무료 셔틀버스 하차장 · 유료 셔틀버스 승하차장', mapIcon: 'shuttle', kind: 'etc', lat: 37.40193, lng: 126.632502 },
]

// OpenStreetMap subway entrances: exact, drawn with their exit numbers. Listed as one row.
const exit = (n: number, lat: number, lng: number): Pin => ({
  id: `${CODE}-exit-${n}`,
  name: `송도달빛축제공원역 ${n}번 출구`,
  group: '송도달빛축제공원역 출구',
  detail: '인천 1호선',
  mapIcon: `exit-${n}`,
  kind: 'etc',
  lat,
  lng,
})
const EXIT_PINS: readonly Pin[] = [
  exit(1, 37.4066832, 126.6258288),
  exit(2, 37.4071714, 126.6255227),
  exit(3, 37.4073687, 126.6260568),
  exit(4, 37.4069213, 126.6263411),
]

const pentaportMap = () => {
  const map = seriesMapFor(CODE)
  if (!map) throw new Error('Pentaport map metadata is missing')
  return map
}

function markPins(): Pin[] {
  return pentaportMap().marks.map((mark) => {
    const meta = MARK_KINDS[mark.kind]
    if (!meta) throw new Error(`Pentaport map mark ${mark.id} has unknown kind "${mark.kind}"`)
    const { group = meta.name, ...rest } = meta
    return { id: `${CODE}-pin-${mark.id}`, ...rest, group, mapIcon: mark.kind, lat: mark.lat, lng: mark.lng, ...(mark.spot ? { spot: mark.spot } : {}) }
  })
}

/**
 * Incheon Pentaport Rock Festival at Songdo Moonlight Festival Park (Incheon). The venue point is the
 * park outline's centroid (OpenStreetMap); the map is the official site map redrawn in layers on real coordinates.
 */
export const PENTAPORT: FestivalSeries = {
  code: CODE,
  name: '인천펜타포트 락 페스티벌',
  venue: { name: '송도달빛축제공원', lat: 37.406261, lng: 126.63584 },
  pins: () => [...markPins(), ...ENTRANCE_PINS, ...EXIT_PINS],
  sources: [
    // Only the timetable post (2026-07-09) was read here; without logging in the account shows its newest 12 posts.
    { method: '인스타', value: '@pentaportrf', lastScrapedPostDate: '2026-07-09' },
    // Mirrors the Instagram posts; every 2026 notice up to 2026-08-06 was checked (2026-10-20).
    { method: '공홈', value: 'https://www.pentaport.co.kr/Notice', lastScrapedPostDate: '2026-08-06' },
  ],
  // The user's pick from the second mockup (2026-10-21): deep purple from the 2026 official guide art, the red
  // star logo alone as the title picture, a star for KB (yellow), a bolt for Monster Energy (green), a tumbler
  // for Stanley (dark green).
  theme: {
    accent: '#432a73',
    art: pentaportArt,
    stages: {
      kb: { color: '#e09a00', icon: 'star' },
      monster: { color: '#4f9a1f', icon: 'bolt' },
      stanley: { color: '#3f6b52', icon: 'cup' },
    },
  },
}
