import letsRockArt from '../../../assets/art/letsrock.webp'
import letsRockMark from '../../../assets/mark/letsrock.webp'
import { LETS_ROCK_SERIES as CODE } from '../ids'
import type { FestivalSeries } from './types'

/**
 * Let's Rock Festival (렛츠락 페스티벌): an autumn band festival at Nanji Hangang Park (Mapo), one stage on the lawn
 * with standing and picnic zones in front of it. No illustrated map yet, so the app shows OpenStreetMap tiles. The
 * official 2026 site map (map-src/letsrock/, and a guide of the 2026 edition) draws one big oval lawn crossed by paths:
 * the oval of 젊음의광장 next to the 중앙잔디광장 bus stop (OpenStreetMap, satellite view; 2026-11-04). The drawing gives
 * no direction, so its stage and booths are not placed: the map draws the lawn and writes the stage's name on it.
 */

export const LETS_ROCK: FestivalSeries = {
  code: CODE,
  name: '렛츠락 페스티벌',
  venue: { name: '난지한강공원', lat: 37.5661, lng: 126.8774 },
  // its map (scripts/map/layers/letsrock/) draws 젊음의광장 and names the stage on it; nothing else is placed
  pins: () => [],
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
