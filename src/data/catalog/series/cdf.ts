import cdfArt from '../../../assets/art/cdf.webp'
import cdfMark from '../../../assets/mark/cdf.webp'
import { CDF_SERIES as CODE } from '../ids'
import { bigMapPins, type Place, type StationPlace } from './bigMapPins'
import type { FestivalSeries } from './types'

/**
 * COUNTDOWN FANTASY (카운트다운 판타지): Mint Paper's band festival on New Year's Eve, from the afternoon of 31 December
 * until dawn on 1 January, indoors at KINTEX in Goyang — halls 7 and 8 of the second exhibition centre (2026-2027).
 * The same building as Wonderlivet, so the app shows that festival's big area map (scripts/map/layers/wonderlivet/).
 * Only what is announced: the venue, and the stations near it with their exits (OpenStreetMap). Which entrance and
 * which exit to take is not out yet. Distances are straight lines from the venue, as on Wonderlivet's map.
 */
const NEAR_STATIONS = '가까운 역'
const VENUE: Place = { id: 'zone-venue', name: '킨텍스 제2전시장 7·8홀', caption: '킨텍스 제2전시장', kind: 'stage', detail: '공지된 행사장 · 입구와 티켓부스 위치는 아직 공지 전이에요' } // named on the map: it shows from further out
const STATIONS: Record<string, StationPlace> = {
  kintex: { id: 'zone-kintex-station', name: '킨텍스역 (GTX-A)', group: NEAR_STATIONS, kind: 'etc', detail: '행사장까지 직선 약 500 m', station: '킨텍스역', line: 'GTX-A' },
  daehwa: { id: 'zone-daehwa-station', name: '대화역 (3호선)', group: NEAR_STATIONS, kind: 'etc', detail: '행사장까지 직선 약 1.3 km', station: '대화역', line: '3호선' },
}

export const CDF: FestivalSeries = {
  code: CODE,
  name: '카운트다운 판타지',
  venue: { name: '킨텍스 제2전시장 7·8홀', lat: 37.664738, lng: 126.74187 },
  pins: () => bigMapPins(CODE, VENUE, STATIONS),
  // Every 2026-2027 post up to the show-times post of 2026-10-21 was read (2026-10-28); the ones before 9/22 are the
  // last edition's. The 10/29 posts (group tickets, sponsor and MD calls; read 2026-10-30) add nothing for visitors.
  sources: [{ method: '인스타', value: '@countdownfantasy', lastScrapedPostDate: '2026-10-30' }],
  // From the 2026-2027 line-up poster (2026-10-28): its logo on the night sky, lifted onto a night-blue circle
  // (scripts/art/build-cdf.mjs), and the poster's neon green darkened for the main color (cream text on it).
  // Stage icons and colors wait for the timetable.
  theme: { accent: '#17762a', art: cdfArt, mark: cdfMark, stages: {} },
}
