import wonderlivetArt from '../../../assets/art/wonderlivet.svg'
import type { Pin } from '../../schema'
import { WONDERLIVET_SERIES as CODE } from '../ids'
import type { FestivalSeries } from './types'

/**
 * WONDERLIVET (원더리벳): a J-pop and "iconic artist" festival indoors at KINTEX in Goyang, halls 7–10 of the second
 * exhibition centre (2026). Its two stages take turns all day. Coordinates: OpenStreetMap (the second exhibition
 * centre); the stations the official directions name are pinned at the station, their exits not being mapped yet
 * (킨텍스역: Wikipedia). No festival map yet ("to be published"), so the app shows OpenStreetMap tiles.
 */
const PINS: readonly Pin[] = [
  { id: `${CODE}-zone-venue`, name: '킨텍스 제2전시장 7–10홀 · 공연장', kind: 'stage', detail: '손목밴드 부스에서 밴드를 차고 들어가요', lat: 37.664738, lng: 126.74187 },
  { id: `${CODE}-zone-kintex-station`, name: '킨텍스역 (GTX-A) (대략)', kind: 'etc', detail: '4·5번 출구로 나와요', lat: 37.665, lng: 126.74806 },
  { id: `${CODE}-zone-daehwa-station`, name: '대화역 (3호선) (대략)', kind: 'etc', detail: '2번 출구로 나와 킨텍스 방면 버스나 걸어서', lat: 37.676204, lng: 126.747074 },
]

export const WONDERLIVET: FestivalSeries = {
  code: CODE,
  name: '원더리벳',
  venue: { name: '킨텍스 제2전시장 7–10홀', lat: 37.664738, lng: 126.74187 },
  pins: () => [...PINS],
  sources: [
    // The timetable (2026-09-29) and full line-up (08-27) posts were read; the newer ones are artist videos. The
    // official site (wonderli.vet: FAQ, directions) is one page with no dated posts, read in full on 2026-10-27.
    { method: '인스타', value: '@wonderlivet', lastScrapedPostDate: '2026-09-29' },
  ],
  // From its Instagram and the 2026 timetable (2026-10-27): the pixel robot on a black circle as on the profile, the
  // timetable's orange darkened for the main color (cream text on it). The timetable draws WONDER STAGE in solid
  // orange and LIVET STAGE in black with an orange edge: so a bright and a deep orange. Icons: a star (wonder) and the
  // radar of the key visual ("BIAS DETECTED") — waiting for the user's look (TODO, 디자인).
  theme: {
    accent: '#a84300',
    art: wonderlivetArt,
    stages: {
      wonder: { color: '#ff6800', icon: 'star' },
      livet: { color: '#9c3d00', icon: 'radar' },
    },
  },
}
