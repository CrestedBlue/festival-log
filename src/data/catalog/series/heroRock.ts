import heroRockArt from '../../../assets/art/herorock.webp'
import type { Pin } from '../../schema'
import { HERO_ROCK_SERIES as CODE } from '../ids'
import type { FestivalSeries } from './types'

const PINS: readonly Pin[] = [
  { id: `${CODE}-zone-venue`, name: '송도컨벤시아 · 행사장', kind: 'stage', lat: 37.388776, lng: 126.646738 },
  { id: `${CODE}-zone-incheon-univ-exit-4`, name: '인천대입구역 4번 출구 (인천 1호선)', kind: 'etc', lat: 37.3868987, lng: 126.6398836 },
]

/**
 * Hero Rock Festival Incheon at Songdo Convensia. Coordinates: OpenStreetMap (the Convensia building, and
 * Incheon National University station exit 4 — the exit closest to the venue in a straight line, ~640 m).
 * No illustrated map yet, so the app shows it on OpenStreetMap tiles.
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
