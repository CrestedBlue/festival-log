import heroRockArt from '../../../assets/art/herorock.webp'
import type { Pin } from '../../schema'
import { HERO_ROCK_SERIES as CODE } from '../ids'
import type { FestivalSeries } from './types'

// Only what is announced (the user's call, 2026-10-27): the venue — which hall and entrance is not out yet — and the
// subway stations near it, as one list row. Coordinates: the Convensia building (OpenStreetMap); the stations where
// Wikipedia puts them (their exits for the venue are not announced).
const NEAR_STATIONS = '가까운 역'
const PINS: readonly Pin[] = [
  { id: `${CODE}-zone-venue`, name: '송도컨벤시아', kind: 'stage', detail: '공지된 행사장 · 홀과 입구는 아직 공지 전이에요', lat: 37.388776, lng: 126.646738 },
  { id: `${CODE}-zone-incheon-univ-station`, name: '인천대입구역 (인천 1호선)', group: NEAR_STATIONS, detail: '행사장까지 직선 약 700 m', kind: 'etc', lat: 37.386, lng: 126.639528 },
  { id: `${CODE}-zone-central-park-station`, name: '센트럴파크역 (인천 1호선)', group: NEAR_STATIONS, detail: '행사장까지 직선 약 1.2 km', kind: 'etc', lat: 37.393389, lng: 126.634556 },
]

/**
 * Hero Rock Festival Incheon at Songdo Convensia. No illustrated map yet, so the app shows it on OpenStreetMap tiles.
 */
export const HERO_ROCK: FestivalSeries = {
  code: CODE,
  name: '히어로 락 페스티벌 - 인천',
  venue: { name: '송도컨벤시아', lat: 37.388776, lng: 126.646738 },
  pins: () => [...PINS],
  // 2026 data came from Melon Ticket and a poster the user sent: nothing scraped from this account yet.
  sources: [{ method: '인스타', value: '@herorockfestival', lastScrapedPostDate: null }],
  // From its Instagram and the 2026 poster (2026-10-21): bronze gold from the logo and dates, the logo on a black
  // circle as on the profile picture (scripts/art/build-herorock.mjs). Stage icons and colors wait for the timetable.
  theme: { accent: '#7d5a1c', art: heroRockArt, stages: {} },
}
