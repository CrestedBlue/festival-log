import sjfArt from '../../../assets/art/sjf.webp'
import sjfMark from '../../../assets/mark/sjf.webp'
import type { Pin } from '../../schema'
import { SJF_SERIES as CODE } from '../ids'
import type { FestivalSeries } from './types'

/**
 * Seoul Jazz Festival (서울재즈페스티벌): held at Olympic Park every spring, on four stages across the park — MAY FOREST
 * (88잔디마당), SPARKLING DOME (KSPO DOME), PINK AVENUE (티켓링크 라이브 아레나) and SPRING GARDEN (88호수수변무대) in 2026.
 * No illustrated map yet (the official 2026 festival map is kept in map-src/sjf/), so the app shows OpenStreetMap
 * tiles with the park itself, at the same spot as the Grand Mint Festival's; the stages wait for the map to be fitted.
 */
const PINS: readonly Pin[] = [
  {
    id: `${CODE}-zone-venue`,
    name: '올림픽공원 (대략)',
    kind: 'stage',
    detail: '무대 4곳이 공원 곳곳에 있어요 · 위치는 공식 페스티벌 맵을 보세요',
    lat: 37.5195,
    lng: 127.1265,
  },
]

export const SJF: FestivalSeries = {
  code: CODE,
  name: '서울재즈페스티벌',
  venue: { name: '올림픽공원', lat: 37.5195, lng: 127.1265 },
  pins: () => [...PINS],
  sources: [
    // Only the profile was looked at (2026-10-28): the daily collection starts it.
    { method: '인스타', value: '@seouljazzfestival', lastScrapedPostDate: null },
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
