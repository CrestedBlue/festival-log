import pentaportArt from '../../../assets/art/pentaport.svg'
import { seriesMapFor } from '../../../features/map/festivalMaps'
import type { Pin } from '../../schema'
import { PENTAPORT_SERIES as CODE } from '../ids'
import type { FestivalSeries } from './types'

// The map is the official site map redrawn in layers (scripts/map/layers/pentaport/): its stages, gates and the
// security check are drawn and labelled there, so they are listed but not drawn again (anchors = their real places).
const LABELLED_PINS: ReadonlyArray<readonly [key: string, pin: Omit<Pin, 'id' | 'lat' | 'lng'>, anchorKey: string]> = [
  ['kb-stage', { name: 'KB국민카드 STAGE', kind: 'stage' }, 'kbStage'],
  ['monster-stage', { name: 'MONSTER ENERGY STAGE', kind: 'stage' }, 'monsterStage'],
  ['stanley-stage', { name: 'STANLEY 1913 STAGE', kind: 'stage' }, 'stanleyStage'],
  ['gate-1', { name: 'GATE 1', kind: 'etc' }, 'gate1'],
  ['gate-2', { name: 'GATE 2', kind: 'etc' }, 'gate2'],
  ['security-check', { name: '물품검색존', kind: 'etc' }, 'securityCheck'],
]

// The map's pins (layer 3, the official legend) are drawn there too; listed with the official names. Kinds the app
// has no icon for are "etc".
const MARK_KINDS: Record<string, { kind: Pin['kind']; name: string }> = {
  info: { kind: 'info', name: '종합안내소' },
  barrierFreePass: { kind: 'etc', name: '배리어 프리 패스' },
  securityCheck: { kind: 'etc', name: '물품검색대' },
  lockers: { kind: 'luggage', name: '물품보관소' },
  pentaDreamer: { kind: 'etc', name: '펜타 드리머' },
  promotionBooth: { kind: 'etc', name: '홍보 부스' },
  vendorBooth: { kind: 'etc', name: '벤더 부스' },
  fnb: { kind: 'food', name: 'F&B' },
  bar: { kind: 'food', name: '주류' },
  waterBar: { kind: 'water', name: '워터바' },
  kiosk: { kind: 'etc', name: '키오스크' },
  medical: { kind: 'firstaid', name: '의료부스' },
  coolZone: { kind: 'etc', name: '쿨존' },
  mainCoolZone: { kind: 'etc', name: '메인쿨존' },
  officialMd: { kind: 'shop', name: '공식MD' },
  artistMd: { kind: 'shop', name: '아티스트MD' },
  charging: { kind: 'etc', name: '모바일 충전소' },
  toilet: { kind: 'toilet', name: '화장실' },
  accessibleToilet: { kind: 'toilet', name: '장애인 화장실' },
  washStation: { kind: 'etc', name: '개수대' },
  nursingRoom: { kind: 'etc', name: '수유실' },
  barrierFreeZone: { kind: 'etc', name: '배리어 프리 존' },
  police: { kind: 'etc', name: '연수 경찰서' },
  fireStation: { kind: 'etc', name: '송도 소방서' },
  interpretation: { kind: 'info', name: '통역 안내' },
  smoking: { kind: 'smoking', name: '흡연구역' },
}

// Places outside the redrawn venue map, read off the official entrance map ("입장 동선 안내", 2026-07-14) laid onto
// real coordinates: drawn as pins. Roughly placed, so marked (대략).
const ENTRANCE_PINS: readonly Pin[] = [
  { id: `${CODE}-place-ticket-booth-1`, name: '제1 티켓부스 (지하철 이용객, 대략)', kind: 'wristband', lat: 37.406334, lng: 126.627492 },
  { id: `${CODE}-place-ticket-booth-2`, name: '제2 티켓부스 (셔틀버스·택시 이용객, 대략)', kind: 'wristband', lat: 37.403316, lng: 126.633174 },
  { id: `${CODE}-place-free-shuttle-pickup`, name: '무료 셔틀버스 승차장 (대략)', kind: 'etc', lat: 37.401604, lng: 126.631595 },
  { id: `${CODE}-place-shuttle-drop-off`, name: '무료 셔틀버스 하차장 · 유료 셔틀버스 승하차장 (대략)', kind: 'etc', lat: 37.40193, lng: 126.632502 },
]

// OpenStreetMap subway entrances: exact, drawn as pins (the map's ground has no station).
const EXIT_PINS: readonly Pin[] = [
  { id: `${CODE}-exit-1`, name: '송도달빛축제공원역 1번 출구 (인천 1호선)', kind: 'etc', lat: 37.4066832, lng: 126.6258288 },
  { id: `${CODE}-exit-3`, name: '송도달빛축제공원역 3번 출구 (인천 1호선)', kind: 'etc', lat: 37.4073687, lng: 126.6260568 },
  { id: `${CODE}-exit-4`, name: '송도달빛축제공원역 4번 출구 (인천 1호선)', kind: 'etc', lat: 37.4069213, lng: 126.6263411 },
]

const pentaportMap = () => {
  const map = seriesMapFor(CODE)
  if (!map) throw new Error('Pentaport map metadata is missing')
  return map
}

function labelledPins(): Pin[] {
  return LABELLED_PINS.map(([key, pin, anchorKey]) => {
    const point = pentaportMap().anchors[anchorKey]
    if (!point) throw new Error(`Pentaport map has no anchor "${anchorKey}"`)
    return { id: `${CODE}-zone-${key}`, ...pin, lat: point[0], lng: point[1] }
  })
}

// Gate pins are left out: the gates are already listed by name.
function markPins(): Pin[] {
  return pentaportMap().marks.filter((mark) => mark.kind !== 'gate').map((mark) => {
    const meta = MARK_KINDS[mark.kind]
    if (!meta) throw new Error(`Pentaport map mark ${mark.id} has unknown kind "${mark.kind}"`)
    return { id: `${CODE}-zone-pin-${mark.id}`, name: meta.name, kind: meta.kind, lat: mark.lat, lng: mark.lng }
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
  pins: () => [...labelledPins(), ...markPins(), ...ENTRANCE_PINS, ...EXIT_PINS],
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
