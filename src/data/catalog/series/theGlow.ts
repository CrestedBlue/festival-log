import theGlowArt from '../../../assets/art/theglow.webp'
import theGlowMark from '../../../assets/mark/theglow.webp'
import { THE_GLOW_SERIES as CODE } from '../ids'
import { bigMapPins, type Place, type StationPlace } from './bigMapPins'
import type { FestivalSeries } from './types'

/**
 * THE GLOW (더 글로우): Wanderloch's indoor band festival every March at KINTEX in Goyang — in 2026, its third, halls 7,
 * 8, 9 and 10A of the second exhibition centre, on three stages (STAGE 37 in hall 7, STAGE 126 in hall 9, STAGE X in
 * hall 10A). The same building as Wonderlivet (also Wanderloch's), so the app shows that festival's big area map
 * (scripts/map/layers/wonderlivet/) with the venue and the stations of the official directions (theglowseoul.com/map)
 * on their tracks and their numbered exits (OpenStreetMap). The official festival map draws the halls inside; it is
 * kept (map-src/theglow/official-map-2026.jpg) to draw with the user.
 */
const VENUE: Place = { id: 'zone-venue', name: '킨텍스 제2전시장 7·8·9·10A홀 · 공연장', caption: '킨텍스 제2전시장', kind: 'stage', detail: '손목밴드 부스에서 손목밴드를 차고 들어가요' } // named on the map: it shows from further out
const STATIONS: Record<string, StationPlace> = {
  kintex: { id: 'zone-kintex-station', name: '킨텍스역 (GTX-A)', kind: 'etc', detail: '4·5번 출구로 나와요 · 행사장까지 직선 약 500 m', station: '킨텍스역', line: 'GTX-A' },
  daehwa: { id: 'zone-daehwa-station', name: '대화역 (3호선)', kind: 'etc', detail: '2번 출구로 나와 버스나 걸어서 · 직선 약 1.3 km', station: '대화역', line: '3호선' },
}

export const THE_GLOW: FestivalSeries = {
  code: CODE,
  name: '더 글로우',
  venue: { name: '킨텍스 제2전시장 7·8·9·10A홀', lat: 37.664738, lng: 126.74187 },
  pins: () => bigMapPins(CODE, VENUE, STATIONS),
  sources: [
    // The profile and its 12 newest posts (to 2026-05-21, photos and the after-movie) were read on 2026-11-08: the
    // 2026 edition is over ("SEE YOU at THE GLOW 2027!"), no 2027 dates yet.
    { method: '인스타', value: '@theglowseoul', lastScrapedPostDate: '2026-05-21' },
    // The official site's notices (2026 announcement, tickets, line-up, both days' set lists), its timetable, map
    // and FAQ were read in full on 2026-11-08; the newest notice is the day-2 set list (2026-03-22).
    { method: '공홈', value: 'https://theglowseoul.com/notice', lastScrapedPostDate: '2026-03-22' },
  ],
  // From the official site and the 2026 posters (2026-11-08): the logo in white on a black circle with the cyan and
  // red fringes the posters draw (scripts/art/build-theglow.mjs); the logo's red deepened for the main color (cream
  // text on it). Stages: hall 7's STAGE 37 in the site's cyan, hall 9's STAGE 126 in its red, STAGE X in black; icons
  // after the official map's hall marks (an orbit for 37, sparkles for 126, a bolt for X) — waiting for the user's
  // look (TODO, 디자인).
  theme: {
    accent: '#b8141b',
    art: theGlowArt,
    mark: theGlowMark,
    stages: {
      stage37: { color: '#0597a3', icon: 'radar' },
      stage126: { color: '#e3191f', icon: 'star' },
      stageX: { color: '#2a2a31', icon: 'bolt' },
    },
  },
}
