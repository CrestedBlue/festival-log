import bmlArt from '../../../assets/art/bml.webp'
import bmlMark from '../../../assets/mark/bml.webp'
import type { Pin } from '../../schema'
import { BML_SERIES as CODE } from '../ids'
import { stationPins, type StationPlace } from './bigMapPins'
import type { FestivalSeries } from './types'

/**
 * Beautiful Mint Life (뷰티풀 민트 라이프): Mint Paper's spring festival. Held at Olympic Park until 2025, at the Oil
 * Tank Culture Park (문화비축기지, Mapo) from 2026: Mint Breeze Stage on its 문화마당 (two stages side by side, Mint and
 * Breeze, taking turns), Loving Forest Garden on T2's outdoor stage and Flood in the Cave in T2's indoor hall.
 * The map (scripts/map/layers/bml/) draws the official map's zones on the real park and names the stages with their
 * icons, so the stages are not listed as pins. The pins come from the official 2026 festival map
 * (map-src/bml/official-map-2026.jpg): it is drawn north up but not to scale, so each place is set by the tank, the
 * plaza edge or the road it is drawn beside, on the satellite and OpenStreetMap views (2026-11-04). The ticket booth
 * stands in the 난지천공원 car park across 월드컵로, the main gate toward 월드컵경기장역 (line 6) exit 2.
 */
type Place = Omit<Pin, 'id' | 'lat' | 'lng'>
const at = (key: string, place: Place, lat: number, lng: number): Pin => ({ id: `${CODE}-${key}`, ...place, lat, lng })

const TOILET: Place = { name: '화장실', group: '화장실', kind: 'toilet' }
const FIRST_AID: Place = { name: '의료부스', group: '의료부스', kind: 'firstaid' }
const FOOD: Place = { name: '식음료 판매', group: '식음료 판매', kind: 'food' }
const EATING: Place = { name: '취식존', group: '취식존', kind: 'eating' }
const SMOKING: Place = { name: '흡연구역', group: '흡연구역', kind: 'smoking' }
const SPONSOR: Place = { name: '스폰서 존', group: '스폰서 존', kind: 'sponsor' }

const PINS: readonly Pin[] = [
  at('ticket', { name: '티켓 & 손목밴드 · 난지천공원 주차장 (대략)', kind: 'wristband', rank: 0, detail: '메인 게이트에서 월드컵로 건너 남서쪽' }, 37.5689, 126.8913),
  at('gate-main', { name: '메인 게이트', group: '게이트', kind: 'etc', mapIcon: 'gate', rank: 0, detail: '문화마당 남쪽 · 월드컵경기장역(6호선) 2번 출구 쪽' }, 37.5699, 126.8943),
  at('gate-sub', { name: '서브 게이트 (대략)', group: '게이트', kind: 'etc', mapIcon: 'gate', rank: 0, detail: '월드컵 지하차도 쪽' }, 37.57, 126.8954),
  at('info', { name: '인포메이션', kind: 'info', detail: '메인 게이트 동쪽 · 현장 판매' }, 37.5699, 126.8948),
  at('luggage', { name: '물품보관소', kind: 'luggage' }, 37.57, 126.895),
  at('charger', { name: '보조배터리 대여', kind: 'etc', mapIcon: 'charging' }, 37.5701, 126.8951),
  at('water', { name: '프리워터존', kind: 'water', detail: '텀블러를 챙기세요' }, 37.5702, 126.8951),
  at('rest', { name: '휴식존', kind: 'eating' }, 37.5707, 126.8951),
  at('photo', { name: '포토존', kind: 'photo' }, 37.571, 126.895),
  at('md', { name: '민트샵', kind: 'shop', detail: '공식 MD' }, 37.5711, 126.8931),
  at('mint-center', { name: '민트문화체육센터', kind: 'sponsor', detail: 'T6 옆 부스' }, 37.5714, 126.893),
  at('flea', { name: '플리마켓', kind: 'etc', mapIcon: 'vendorBooth', detail: 'T1' }, 37.5715, 126.8922),
  at('toilet-t2', { ...TOILET, detail: 'T2 앞' }, 37.5719, 126.8924),
  at('toilet-t1', { ...TOILET, detail: 'T1 옆' }, 37.5716, 126.8923),
  at('toilet-stage', { ...TOILET, detail: 'Mint Breeze Stage 오른쪽' }, 37.5712, 126.895),
  at('toilet-gate', { ...TOILET, detail: '메인 게이트 왼쪽' }, 37.57, 126.8939),
  at('toilet-parking', { ...TOILET, detail: '난지천공원 주차장 (대략)' }, 37.5686, 126.8912),
  at('firstaid-plaza', { ...FIRST_AID, detail: '문화마당 레저 존 아래' }, 37.5702, 126.8942),
  at('firstaid-t2', { ...FIRST_AID, detail: 'T2 가는 길' }, 37.5717, 126.8929),
  at('food-west', { ...FOOD, detail: 'T6 북쪽' }, 37.5716, 126.893),
  at('food-beer', { ...FOOD, detail: '문화마당 서쪽 (맥주)' }, 37.5708, 126.8935),
  at('food-east', { ...FOOD, detail: '문화마당 동쪽' }, 37.5704, 126.8953),
  at('eating-west', { ...EATING, detail: 'T2 가는 길' }, 37.5718, 126.8927),
  at('eating-east', { ...EATING, detail: '문화마당 동쪽' }, 37.5705, 126.8951),
  at('smoking-west', { ...SMOKING, detail: 'T1과 T6 사이' }, 37.5715, 126.8926),
  at('smoking-east', { ...SMOKING, detail: '문화마당 동쪽 끝' }, 37.5706, 126.8955),
  at('sponsor-north', { ...SPONSOR, detail: '문화마당 서쪽' }, 37.5709, 126.8936),
  at('sponsor-south', { ...SPONSOR, detail: '문화마당 서쪽' }, 37.5706, 126.8935),
]

const STATIONS: Record<string, StationPlace> = {
  worldCupStadium: { id: 'zone-world-cup-stadium-station', name: '월드컵경기장역 (6호선)', group: '가까운 역', detail: '2번 출구에서 메인 게이트까지 걸어서 약 5분', kind: 'etc', station: '월드컵경기장역', line: '6호선' },
}

export const BML: FestivalSeries = {
  code: CODE,
  name: '뷰티풀 민트 라이프',
  venue: { name: '문화비축기지', lat: 37.5708, lng: 126.8942 },
  pins: () => [...PINS, ...stationPins(CODE, STATIONS)],
  // 2026 data came from the Mint Paper site (mintpaper.co.kr/festivals/170: the notices of 2026-02-12 to 06-04). The
  // newest 12 Instagram posts were read on 2026-10-29: 2026 highlight clips and a Chuseok greeting (09/23), nothing to add.
  sources: [{ method: '인스타', value: '@beautifulmintlife_', lastScrapedPostDate: '2026-09-25' }],
  // From the 2026 timetable and notice pages (2026-10-28): its name in green serif with the butterfly on a pale mint
  // circle (scripts/art/build-bml.mjs), the timetable's green darkened for the main color. Stage colors from the
  // official map's legend (Mint Breeze green, Loving Forest pink, Flood blue), Breeze a teal beside Mint's green.
  // Icons: Mint a leaf, Breeze a breath of wind, the forest garden a flower, the cave flooded with a wave.
  theme: {
    accent: '#23784f',
    art: bmlArt,
    mark: bmlMark,
    stages: {
      mint: { color: '#23966a', icon: 'leaf' },
      breeze: { color: '#2d9bb0', icon: 'breath' },
      forest: { color: '#e0607f', icon: 'flower' },
      cave: { color: '#3f7fd9', icon: 'wave' },
    },
  },
}
