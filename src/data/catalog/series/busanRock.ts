import busanRockArt from '../../../assets/art/busanrock.webp'
import busanRockMark from '../../../assets/mark/busanrock.webp'
import type { Pin } from '../../schema'
import { BUSAN_ROCK_SERIES as CODE } from '../ids'
import type { FestivalSeries } from './types'

/**
 * Busan International Rock Festival (부산국제록페스티벌): held at Samnak Ecological Park on the Nakdong River every
 * autumn, on five stages in 2026 — SAMROCK, GREEN, RIVER, WAVE and the free HIDDEN stage. No illustrated map yet,
 * so the app shows OpenStreetMap tiles with the park itself (its spot from Wikipedia).
 */
const PINS: readonly Pin[] = [
  {
    id: `${CODE}-zone-venue`,
    name: '삼락생태공원 (대략)',
    kind: 'stage',
    detail: '무대 5곳 · 셔틀버스(카카오 T, k.ride)와 캠핑 안내는 공식 홈페이지에 있어요',
    lat: 35.165725,
    lng: 128.97382,
  },
]

export const BUSAN_ROCK: FestivalSeries = {
  code: CODE,
  name: '부산국제록페스티벌',
  venue: { name: '삼락생태공원', lat: 35.165725, lng: 128.97382 },
  pins: () => [...PINS],
  sources: [
    // Only the profile was looked at (2026-10-28): the daily collection starts it.
    { method: '인스타', value: '@busanrockfest', lastScrapedPostDate: null },
    // The 2026 notices were gone through by title up to the DAY3 post of 2026-10-05 (2026-10-28).
    { method: '공홈', value: 'https://busanrockfestival.com/notice/', lastScrapedPostDate: '2026-10-05' },
  ],
  // From the 2026 site and timetable (2026-10-28): the black wordmark on a circle of the timetable's mint sky
  // (scripts/art/build-busanrock.mjs), a deep teal of that sky for the main color. Stage colors are the timetable's
  // own (yellow, green, pink, cyan, purple), deepened to read on the app's paper. Icons: SAMROCK a bolt, GREEN a leaf,
  // RIVER a wave, WAVE a breath of sound, HIDDEN a star.
  theme: {
    accent: '#13737a',
    art: busanRockArt,
    mark: busanRockMark,
    stages: {
      samrock: { color: '#c9a100', icon: 'bolt' },
      green: { color: '#4fae3a', icon: 'leaf' },
      river: { color: '#e0679a', icon: 'wave' },
      wave: { color: '#1d9fb0', icon: 'breath' },
      hidden: { color: '#8a6fd6', icon: 'star' },
    },
  },
}
