import jumfArt from '../../../assets/art/jumf.webp'
import type { Pin } from '../../schema'
import { JUMF_SERIES as CODE } from '../ids'
import type { FestivalSeries } from './types'

/**
 * JUMF (전주얼티밋뮤직페스티벌): MARU and NEOUL, the two outdoor main stages side by side on Jeonju University's
 * artificial-turf fields A and B, and SOOM indoors in the gym (also a cool zone), per the official 2026 site maps.
 * Coordinates: OpenStreetMap ("A구장"/"B구장", "체육관", "교수연수동"). The campus site map is drawn with east at the
 * bottom (the main gate); turned that way, its indoor gym is OSM's "체육관" right west of the main stadium.
 * No illustrated map yet (the official ones are kept in map-src/jumf/), so the app shows OpenStreetMap tiles.
 */
const PINS: readonly Pin[] = [
  { id: `${CODE}-zone-main-stage`, name: '마루·너울 스테이지 · 인조잔디구장 A·B', kind: 'stage', lat: 35.81149, lng: 127.08738 },
  { id: `${CODE}-zone-soom-stage`, name: '숨 스테이지 · 실내체육관 (쿨존)', kind: 'stage', lat: 35.812305, lng: 127.091777 },
  { id: `${CODE}-zone-shuttle`, name: '셔틀버스 승하차 · 교수연구동 주차장 (대략)', kind: 'etc', lat: 35.81206, lng: 127.090161 },
]

export const JUMF: FestivalSeries = {
  code: CODE,
  name: '전주얼티밋뮤직페스티벌',
  venue: { name: '전주대학교 인조잔디구장', lat: 35.81149, lng: 127.08738 },
  pins: () => [...PINS],
  sources: [
    // Only the profile was looked at: without logging in it shows the newest posts, none of them read yet.
    { method: '인스타', value: '@jumfesta', lastScrapedPostDate: null },
    // Every 2026 notice was gone through by title up to the lost-and-found post of 2026-08-19 (2026-10-22).
    { method: '공홈', value: 'https://www.jumf.co.kr/24', lastScrapedPostDate: '2026-08-19' },
  ],
  // From its Instagram and the 2026 timetable (2026-10-22): the logo on a blue guitar pick as on the profile
  // (scripts/art/build-jumf.mjs), a deeper blue as the main color, and each stage's own color from the timetable.
  // Icons follow the stage names: 마루 (a hanok's wooden floor), 너울 (a big swell), 숨 (breath).
  theme: {
    accent: '#0a5cc2',
    art: jumfArt,
    stages: {
      maru: { color: '#d650bd', icon: 'roof' },
      neoul: { color: '#9251d6', icon: 'wave' },
      soom: { color: '#007396', icon: 'breath' },
    },
  },
}
