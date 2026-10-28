import letsRockArt from '../../../assets/art/letsrock.webp'
import letsRockMark from '../../../assets/mark/letsrock.webp'
import type { Pin } from '../../schema'
import { LETS_ROCK_SERIES as CODE } from '../ids'
import type { FestivalSeries } from './types'

/**
 * Let's Rock Festival (렛츠락 페스티벌): an autumn band festival at Nanji Hangang Park (Mapo), one stage on the lawn
 * with standing and picnic zones in front of it. No illustrated map yet (the official 2026 site map is kept in
 * map-src/letsrock/), so the app shows OpenStreetMap tiles with the park itself (its spot from Wikipedia).
 */
const PINS: readonly Pin[] = [
  {
    id: `${CODE}-zone-venue`,
    name: '난지한강공원 (대략)',
    kind: 'stage',
    detail: '셔틀버스는 하늘공원로(하늘공원 입구)에 내려 걸어서 5분 · 무대 위치는 공식 사이트맵을 보세요',
    lat: 37.566213,
    lng: 126.8763,
  },
]

export const LETS_ROCK: FestivalSeries = {
  code: CODE,
  name: '렛츠락 페스티벌',
  venue: { name: '난지한강공원', lat: 37.566213, lng: 126.8763 },
  pins: () => [...PINS],
  // 2026 data came from the NOL ticket page (its detail image). Only the profile's newest 12 posts were looked at
  // (2026-10-28: after the festival, 10/04 to 10/08 — clips and thank-you posts).
  sources: [{ method: '인스타', value: '@letsrockfe', lastScrapedPostDate: '2026-10-08' }],
  // From the 2026 poster (2026-10-28): its logo on a circle of the poster's green (scripts/art/build-letsrock.mjs),
  // the timetable's blue for the main color. One stage, in the timetable's blue with the poster's star burst.
  theme: {
    accent: '#0d6aa0',
    art: letsRockArt,
    mark: letsRockMark,
    stages: {
      main: { color: '#0b7cbf', icon: 'star' },
    },
  },
}
