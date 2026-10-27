import gmfArt from '../../../assets/art/gmf.svg'
import gmfMark from '../../../assets/mark/gmf.svg'
import { seriesMapFor } from '../../../features/map/festivalMaps'
import type { Pin } from '../../schema'
import { GRAND_MINT_SERIES as CODE } from '../ids'
import type { FestivalSeries } from './types'

/**
 * Grand Mint Festival: held at Olympic Park (Seoul) every year. The venue, the illustrated map and its pins
 * belong here, so a new year only adds its dates, stages, timetable and notices (grandMint<year>.ts).
 */

// The map is the official site map redrawn in layers (scripts/map/layers/gmf/). Its pins (layer 3, the official
// legend) are drawn by the app as the map's own icons, each with the festival zone it stands in; stages and zones
// (Hungry Zone, Art Zone) are named on the map and not listed. Booths that do two things are one entry: the Mint Shop
// (official MD and the slogan display) and Artist & Label with the vinyl.
interface MarkMeta {
  kind: Pin['kind']
  rank?: number
  name: string
  caption?: string
  detail?: string
}
const MARK_KINDS: Record<string, MarkMeta> = {
  wristband: { kind: 'wristband', rank: 0, name: '티켓 부스 (대략)', caption: '티켓 부스', detail: '손목밴드 교환' },
  toilet: { kind: 'toilet', name: '화장실' },
  firstaid: { kind: 'firstaid', name: '의료부스' },
  info: { kind: 'info', name: '인포메이션' },
  luggage: { kind: 'luggage', name: '물품보관소' },
  water: { kind: 'water', name: '프리워터존' },
  fnb: { kind: 'food', name: '푸드존', detail: '식음료 판매' },
  eating: { kind: 'eating', name: '취식존' },
  mintShop: { kind: 'shop', name: '민트샵', detail: '공식 MD · 슬로건 전시' },
  artistVinyl: { kind: 'artist', name: 'Artist & Label · Vinyl', detail: '아티스트·레이블 부스 · 바이닐과 액세서리' },
  radar: { kind: 'radar', name: 'RADAR', detail: '오픈 라디오' },
  photo: { kind: 'photo', name: '포토존' },
  smoking: { kind: 'smoking', name: '흡연구역' },
  sponsor: { kind: 'sponsor', name: '스폰서 존' },
}

// OpenStreetMap subway entrances: exact, drawn with their exit numbers. One list row per station.
const STATIONS = {
  mongchon: { name: '몽촌토성역', lines: '8호선' },
  hanseong: { name: '한성백제역', lines: '9호선' },
  olympicPark: { name: '올림픽공원역', lines: '5·9호선' },
}
const exit = (station: keyof typeof STATIONS, n: number, lat: number, lng: number): Pin => ({
  id: `${CODE}-exit-${station}-${n}`,
  name: `${STATIONS[station].name} ${n}번 출구`,
  group: `${STATIONS[station].name} 출구`,
  detail: STATIONS[station].lines,
  mapIcon: `exit-${n}`,
  kind: 'etc',
  lat,
  lng,
})
const EXIT_PINS: readonly Pin[] = [
  exit('mongchon', 1, 37.517706, 127.113286),
  exit('mongchon', 2, 37.517037, 127.112793),
  exit('mongchon', 3, 37.517032, 127.112358),
  exit('mongchon', 4, 37.517585, 127.112233),
  exit('mongchon', 5, 37.51783, 127.112599),
  exit('hanseong', 1, 37.516363, 127.115082),
  exit('hanseong', 2, 37.516675, 127.116446),
  exit('hanseong', 3, 37.515876, 127.116596),
  exit('hanseong', 4, 37.516072, 127.115962),
  exit('olympicPark', 1, 37.5165, 127.131479),
  exit('olympicPark', 2, 37.516093, 127.131227),
  exit('olympicPark', 3, 37.516172, 127.130716),
  exit('olympicPark', 4, 37.516432, 127.130784),
]

const gmfMap = () => {
  const map = seriesMapFor(CODE)
  if (!map) throw new Error('GMF map metadata is missing')
  return map
}

function markPins(): Pin[] {
  return gmfMap().marks.map((mark) => {
    const meta = MARK_KINDS[mark.kind]
    if (!meta) throw new Error(`GMF map mark ${mark.id} has unknown kind "${mark.kind}"`)
    const detail = [meta.detail, mark.zone].filter(Boolean).join(' · ')
    return {
      id: `${CODE}-pin-${mark.id}`,
      ...meta,
      group: meta.name,
      ...(detail ? { detail } : {}),
      mapIcon: mark.kind,
      lat: mark.lat,
      lng: mark.lng,
      ...(mark.spot ? { spot: mark.spot } : {}),
    }
  })
}

export const GRAND_MINT: FestivalSeries = {
  code: CODE,
  name: '그랜드 민트 페스티벌',
  venue: { name: '올림픽공원', lat: 37.5195, lng: 127.1265 },
  pins: () => [...markPins(), ...EXIT_PINS],
  // 2026 data came from the NOL ticket page. The account's newest 12 posts were read on 2026-10-27 (after the festival:
  // the 10/18 cancellation and refund, lost and found, stage clips).
  sources: [{ method: '인스타', value: '@grandmintfestival', lastScrapedPostDate: '2026-10-20' }],
  // From the design the user drew for the app (2026-10-21): deep green, leaves, a sun and a flower.
  theme: {
    accent: '#0f352f',
    art: gmfArt,
    mark: gmfMark,
    stages: {
      mint: { color: '#2f8f62', icon: 'leaf' },
      sunset: { color: '#e2603f', icon: 'sunset' },
      forest: { color: '#de5579', icon: 'flower' },
      radar: { color: '#c39a2e', icon: 'radar' },
    },
  },
}
