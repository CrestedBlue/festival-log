import heroRockArt from '../../../assets/art/herorock.webp'
import heroRockMark from '../../../assets/mark/herorock.webp'
import { HERO_ROCK_SERIES as CODE } from '../ids'
import { bigMapPins, type Place, type StationPlace } from './bigMapPins'
import type { FestivalSeries } from './types'

// Only what is announced (the user's call, 2026-10-27): the venue — which hall and entrance is not out yet — and the
// subway stations near it (one list row), with their exits (a row per station). Places come from the big area map
// (scripts/map/layers/herorock/): the Convensia building, the middle of each station on its track and its numbered
// exits (OpenStreetMap). Which exit to take for the venue is not announced. Distances are straight lines from the venue.
const NEAR_STATIONS = '가까운 역'
const VENUE: Place = { id: 'zone-venue', name: '송도컨벤시아', caption: '송도컨벤시아', kind: 'stage', detail: '공지된 행사장 · 홀과 입구는 아직 공지 전이에요' } // named on the map: it shows from further out
const station = (id: string, name: string, distance: string): StationPlace => ({
  id, name: `${name} (인천 1호선)`, group: NEAR_STATIONS, detail: `행사장까지 직선 약 ${distance}`, kind: 'etc', station: name, line: '인천 1호선',
})
const STATIONS: Record<string, StationPlace> = {
  incheonUniv: station('zone-incheon-univ-station', '인천대입구역', '700 m'),
  centralPark: station('zone-central-park-station', '센트럴파크역', '1.2 km'),
  knowledgeInfo: station('zone-knowledge-info-station', '지식정보단지역', '1.2 km'),
}

/** Hero Rock Festival Incheon at Songdo Convensia, on its big area map (no venue map yet). */
export const HERO_ROCK: FestivalSeries = {
  code: CODE,
  name: '히어로 락 페스티벌 - 인천',
  venue: { name: '송도컨벤시아', lat: 37.388776, lng: 126.646738 },
  pins: () => bigMapPins(CODE, VENUE, STATIONS),
  // 2026 data came from Melon Ticket and a poster the user sent: nothing scraped from this account yet.
  sources: [{ method: '인스타', value: '@herorockfestival', lastScrapedPostDate: null }],
  // From its Instagram and the 2026 poster (2026-10-21): bronze gold from the logo and dates, the logo on a black
  // circle as on the profile picture (scripts/art/build-herorock.mjs). Stage icons and colors wait for the timetable.
  theme: { accent: '#7d5a1c', art: heroRockArt, mark: heroRockMark, stages: {} },
}
