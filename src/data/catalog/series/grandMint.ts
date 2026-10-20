import { seriesMapFor } from '../../../features/map/festivalMaps'
import type { Pin } from '../../schema'
import { GRAND_MINT_SERIES as CODE } from '../ids'
import type { FestivalSeries } from './types'

/**
 * Grand Mint Festival: held at Olympic Park (Seoul) every year. The venue, the illustrated map and its pins
 * belong here, so a new year only adds its dates, stages, timetable and notices (grandMint<year>.ts).
 */

// Pins sit on the bundled festival map (scripts/map/build-gmf.mjs). Zone pins mark places the map
// already labels (listed, not drawn); mark pins are the official map's icons (toilets, info, …) moved onto
// the redrawn zones. Exits are OSM subway entrances.
const gmfMap = () => {
  const map = seriesMapFor(CODE)
  if (!map) throw new Error('GMF map metadata is missing')
  return map
}

const anchor = (key: string): { lat: number; lng: number } => {
  const point = gmfMap().anchors[key]
  if (!point) throw new Error(`GMF map has no anchor "${key}"`)
  return { lat: point[0], lng: point[1] }
}

const ZONE_PINS: ReadonlyArray<readonly [key: string, pin: Omit<Pin, 'id' | 'lat' | 'lng'>, anchorKey: string]> = [
  ['mint-breeze', { name: 'Mint Breeze · 88잔디마당', kind: 'stage' }, 'mintBreezeStage'],
  ['club-midnight', { name: 'Club Midnight Sunset · KSPO DOME', kind: 'stage' }, 'clubMidnightStage'],
  ['loving-forest', { name: 'Loving Forest Garden · 88호수 수변무대', kind: 'stage' }, 'lovingForestStage'],
  ['hungry-east', { name: 'Hungry Zone · 체조경기장–수영장 사이', kind: 'food' }, 'hungryZoneEast'],
  ['hungry-lawn', { name: 'Hungry Zone · 88잔디마당 안', kind: 'food' }, 'hungryZoneLawn'],
  ['art-zone', { name: 'Art Zone · 한얼광장', kind: 'etc' }, 'artZone'],
  ['olympic-park-exit-3', { name: '올림픽공원역 3번 출구 (5·9호선)', kind: 'etc' }, 'olympicParkExit3'],
  ['mongchon-exit-1', { name: '몽촌토성역 1번 출구 (8호선)', kind: 'etc' }, 'mongchonExit1'],
]

// Official legend names; "fnb" (food & beverage stalls) is the app's "food" kind.
const MARK_KINDS: Record<string, { kind: Pin['kind']; name: string }> = {
  toilet: { kind: 'toilet', name: '화장실' },
  info: { kind: 'info', name: '인포메이션' },
  firstaid: { kind: 'firstaid', name: '의료부스' },
  wristband: { kind: 'wristband', name: '손목밴드 교환' },
  luggage: { kind: 'luggage', name: '물품보관소' },
  water: { kind: 'water', name: '프리워터존' },
  eating: { kind: 'eating', name: '취식존' },
  fnb: { kind: 'food', name: '푸드존 (식음료 판매)' },
  shop: { kind: 'shop', name: '민트샵 (공식 MD)' },
  slogan: { kind: 'slogan', name: '슬로건 전시' },
  radar: { kind: 'radar', name: 'RADAR (오픈 라디오)' },
  photo: { kind: 'photo', name: '포토존' },
  smoking: { kind: 'smoking', name: '흡연구역' },
  sponsor: { kind: 'sponsor', name: '스폰서 존' },
  artist: { kind: 'artist', name: 'Artist & Label' },
  vinyl: { kind: 'vinyl', name: 'Vinyl & Accessory' },
}
// Places with no official position of their own beyond the official map's layout.
const ESTIMATED_ZONES = new Set(['티켓 부스'])

function markPins(): Pin[] {
  return gmfMap().marks.map((mark) => {
    const meta = MARK_KINDS[mark.kind]
    if (!meta) throw new Error(`GMF map mark ${mark.id} has unknown kind "${mark.kind}"`)
    const where = ESTIMATED_ZONES.has(mark.zone) ? `${mark.zone} (대략)` : mark.zone
    return { id: `${CODE}-mark-${mark.id}`, name: `${meta.name} · ${where}`, kind: meta.kind, lat: mark.lat, lng: mark.lng }
  })
}

function zonePins(): Pin[] {
  return ZONE_PINS.map(([key, pin, anchorKey]) => ({ id: `${CODE}-zone-${key}`, ...pin, ...anchor(anchorKey) }))
}

export const GRAND_MINT: FestivalSeries = {
  code: CODE,
  name: '그랜드 민트 페스티벌',
  venue: { name: '올림픽공원', lat: 37.5195, lng: 127.1265 },
  pins: () => [...zonePins(), ...markPins()],
  // 2026 data came from the NOL ticket page, not from this account: nothing scraped from it yet.
  sources: [{ method: '인스타', value: '@grandmintfestival', lastScrapedPostDate: null }],
}
