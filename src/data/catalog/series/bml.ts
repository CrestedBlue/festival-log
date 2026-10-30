import bmlArt from '../../../assets/art/bml.webp'
import bmlMark from '../../../assets/mark/bml.webp'
import type { Pin } from '../../schema'
import { BML_SERIES as CODE } from '../ids'
import type { FestivalSeries } from './types'

/**
 * Beautiful Mint Life (뷰티풀 민트 라이프): Mint Paper's spring festival. Held at Olympic Park until 2025, at the Oil
 * Tank Culture Park (문화비축기지, Mapo) from 2026: Mint Breeze Stage on its 문화마당 (two stages side by side, Mint and
 * Breeze, taking turns), Loving Forest Garden on T2's outdoor stage and Flood in the Cave in T2's indoor hall.
 * No illustrated map yet (the official 2026 map is kept in map-src/bml/), so the app shows OpenStreetMap tiles with the
 * park itself (its spot from Wikipedia); where each stage stands inside it waits for the map to be fitted.
 */
const PINS: readonly Pin[] = [
  {
    id: `${CODE}-zone-venue`,
    name: '문화비축기지 (대략)',
    kind: 'stage',
    detail: '메인 게이트는 월드컵경기장역(6호선) 2번 출구 쪽 · 무대 위치는 공식 맵을 보세요',
    lat: 37.5708,
    lng: 126.8942,
  },
]

export const BML: FestivalSeries = {
  code: CODE,
  name: '뷰티풀 민트 라이프',
  venue: { name: '문화비축기지', lat: 37.5708, lng: 126.8942 },
  pins: () => [...PINS],
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
