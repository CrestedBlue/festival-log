import sjfArt from '../../../assets/art/sjf.webp'
import sjfMark from '../../../assets/mark/sjf.webp'
import type { Pin } from '../../schema'
import { SJF_SERIES as CODE } from '../ids'
import { olympicParkExitPins } from './olympicPark'
import type { FestivalSeries } from './types'

/**
 * Seoul Jazz Festival (서울재즈페스티벌): held at Olympic Park every spring, on four stages across the park — MAY FOREST
 * (88잔디마당), SPARKLING DOME (KSPO DOME), PINK AVENUE (티켓링크 라이브 아레나) and SPRING GARDEN (88호수수변무대) in 2026.
 * The map is the park's area map drawn for the Grand Mint Festival (festivalMaps.ts), with this festival's stages named.
 * Its pins come from the official 2026 festival map (map-src/sjf/official-map-2026.png, the notice of 2026-05-20): the
 * drawing is not to scale, so each place is set by the stage or building it is drawn beside, on the satellite and
 * OpenStreetMap views (2026-11-04). Booths and gates are approximate; toilets reuse the Grand Mint map's where they match.
 */
type Place = Omit<Pin, 'id' | 'lat' | 'lng'>
const at = (key: string, place: Place, lat: number, lng: number): Pin => ({ id: `${CODE}-${key}`, ...place, lat, lng })

const GATE: Place = { name: '', group: '게이트', kind: 'etc', rank: 0 }
const DOME_GATE: Place = { name: '', group: 'SPARKLING DOME 게이트', kind: 'etc', rank: 0 }
const AVENUE_GATE: Place = { name: '', group: 'PINK AVENUE 게이트', kind: 'etc', rank: 0 }
const TOILET: Place = { name: '화장실', group: '화장실', kind: 'toilet', mapIcon: 'toilet' }
const FIRST_AID: Place = { name: '의무실', group: '의무실', kind: 'firstaid', mapIcon: 'firstaid' }
const FOOD: Place = { name: '푸드존', group: '푸드존', kind: 'food', mapIcon: 'fnb' }
const SPONSOR: Place = { name: '스폰서 부스', group: '스폰서 부스', kind: 'sponsor', mapIcon: 'sponsor' }

const PINS: readonly Pin[] = [
  at('ticket', { name: '티켓 부스', kind: 'wristband', rank: 0, mapIcon: 'wristband', detail: '티켓 수령(A) · 바로 옆에 성인인증(B)' }, 37.518, 127.127),
  at('gate-1', { ...GATE, name: 'GATE 1 (MAY FOREST)', detail: 'MAY FOREST(88잔디마당) 남동쪽' }, 37.5186, 127.126),
  at('gate-2', { ...GATE, name: 'GATE 2', detail: 'MAY FOREST 동쪽 · SPARKLING DOME 가는 길' }, 37.52, 127.1262),
  at('gate-3', { ...GATE, name: 'GATE 3', detail: 'MAY FOREST 남쪽' }, 37.5183, 127.1245),
  at('gate-garden', { ...GATE, name: 'GATE 1 (SPRING GARDEN)', detail: 'SPRING GARDEN(88호수수변무대) 남동쪽' }, 37.5208, 127.1258),
  at('gate-east', { ...GATE, name: 'EAST GATE 1 (동문)', detail: '올림픽공원역 쪽 (대략)' }, 37.5177, 127.1285),
  at('gate-dome-1', { ...DOME_GATE, name: '2-1 GATE', detail: 'SPARKLING DOME 남쪽' }, 37.5187, 127.1269),
  at('gate-dome-2', { ...DOME_GATE, name: '2-2 GATE', detail: 'SPARKLING DOME 서쪽' }, 37.5194, 127.1265),
  at('gate-dome-3', { ...DOME_GATE, name: '2-3 GATE', detail: 'SPARKLING DOME 북쪽' }, 37.52, 127.1269),
  at('gate-avenue-2', { ...AVENUE_GATE, name: '2-2 GATE', detail: 'PINK AVENUE 서쪽' }, 37.5178, 127.1258),
  at('gate-avenue-3', { ...AVENUE_GATE, name: '2-3 GATE', detail: 'PINK AVENUE 북동쪽' }, 37.518, 127.1266),
  at('gate-avenue-4', { ...AVENUE_GATE, name: '2-4 GATE', detail: 'PINK AVENUE 동쪽' }, 37.5174, 127.1269),
  at('toilet-garden', { ...TOILET, detail: 'SPRING GARDEN' }, 37.520648, 127.125211),
  at('toilet-gate-2', { ...TOILET, detail: 'GATE 2 옆' }, 37.520193, 127.125953),
  at('toilet-gate-3', { ...TOILET, detail: 'GATE 3 밖 (대략)' }, 37.5181, 127.1243),
  at('toilet-dome', { ...TOILET, detail: 'SPARKLING DOME(KSPO DOME) 안' }, 37.5193, 127.1268),
  at('toilet-avenue', { ...TOILET, detail: 'PINK AVENUE(티켓링크 라이브 아레나) 안' }, 37.5175, 127.1266),
  at('firstaid-forest', { ...FIRST_AID, detail: 'MAY FOREST, GATE 1 옆' }, 37.5188, 127.1256),
  at('firstaid-dome', { ...FIRST_AID, detail: 'SPARKLING DOME 안' }, 37.5195, 127.1266),
  at('firstaid-avenue', { ...FIRST_AID, detail: 'PINK AVENUE 안' }, 37.5178, 127.1265),
  at('md', { name: 'MD 부스', kind: 'shop', mapIcon: 'mintShop', detail: '오피셜 MD · 아티스트 MD · SJF X 폼폼푸린' }, 37.5187, 127.1264),
  at('info', { name: '인포메이션', kind: 'info', mapIcon: 'info', detail: '안내 · 현장 판매 · SJF VILLAGE' }, 37.5183, 127.1279),
  at('lockers', { name: '물품보관소', kind: 'luggage', mapIcon: 'luggage', detail: 'PINK AVENUE 동쪽 (대략)' }, 37.517, 127.1276),
  at('food-forest', { ...FOOD, detail: 'MAY FOREST 서쪽 (1–8번 부스)' }, 37.5191, 127.1241),
  at('food-north', { ...FOOD, detail: 'SPRING GARDEN과 SPARKLING DOME 사이 (24–37번 부스)' }, 37.5203, 127.1266),
  at('sponsor-forest', { ...SPONSOR, detail: 'MAY FOREST 남쪽' }, 37.5185, 127.1253),
  at('sponsor-dome', { ...SPONSOR, detail: 'MAY FOREST와 SPARKLING DOME 사이' }, 37.5191, 127.1263),
  at('smoking', { name: '흡연구역', kind: 'smoking', mapIcon: 'smoking', detail: 'PINK AVENUE 남쪽' }, 37.5166, 127.1263),
]

export const SJF: FestivalSeries = {
  code: CODE,
  name: '서울재즈페스티벌',
  venue: { name: '올림픽공원', lat: 37.5195, lng: 127.1265 },
  pins: () => [...PINS, ...olympicParkExitPins(CODE)],
  sources: [
    // The newest 12 posts were read on 2026-10-31: after the festival only "SJF at the theater" concerts (not the festival).
    { method: '인스타', value: '@seouljazzfestival', lastScrapedPostDate: '2026-10-26' },
    // Every 2026 notice was gone through by title up to the KFAI ranking post of 2026-08-14 (2026-10-28).
    { method: '공홈', value: 'https://www.seouljazz.co.kr/bbs/board.php?bo_table=notice', lastScrapedPostDate: '2026-08-14' },
  ],
  // From the 2026 site and timetable (2026-10-28): the pink wordmark stacked on a circle of the timetable's warm grey
  // (scripts/art/build-sjf.mjs), the pink darkened for the main color (cream text on it). Stage colors from the
  // timetable's blocks — MAY FOREST pink, PINK AVENUE the dark grey — and, for the two drawn white, a night blue for
  // the dome and a spring green for the garden. Icons: a leaf, a star (sparkling), a dot, a flower.
  theme: {
    accent: '#b8345a',
    art: sjfArt,
    mark: sjfMark,
    stages: {
      forest: { color: '#e2557a', icon: 'leaf' },
      dome: { color: '#4f5a7a', icon: 'star' },
      avenue: { color: '#6e6e64', icon: 'dot' },
      garden: { color: '#4f9a62', icon: 'flower' },
    },
  },
}
