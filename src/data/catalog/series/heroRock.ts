import heroRockArt from '../../../assets/art/herorock.webp'
import { seriesMapFor } from '../../../features/map/festivalMaps'
import type { Pin } from '../../schema'
import { HERO_ROCK_SERIES as CODE } from '../ids'
import type { FestivalSeries } from './types'

// Only what is announced (the user's call, 2026-10-27): the venue — which hall and entrance is not out yet — and the
// subway stations near it, as one list row. Places come from the big area map (scripts/map/layers/herorock/): the
// Convensia building and the middle of each station on its track (OpenStreetMap); their exits for the venue are not
// announced. Distances are straight lines from the venue.
const NEAR_STATIONS = '가까운 역'
const PLACES: Record<string, { id: string } & Omit<Pin, 'id' | 'lat' | 'lng' | 'mapIcon'>> = {
  // named on the map (a caption): it shows from further out than the other icons
  venue: { id: 'zone-venue', name: '송도컨벤시아', caption: '송도컨벤시아', kind: 'stage', detail: '공지된 행사장 · 홀과 입구는 아직 공지 전이에요' },
  'station-incheonUniv': { id: 'zone-incheon-univ-station', name: '인천대입구역 (인천 1호선)', group: NEAR_STATIONS, detail: '행사장까지 직선 약 700 m', kind: 'etc' },
  'station-centralPark': { id: 'zone-central-park-station', name: '센트럴파크역 (인천 1호선)', group: NEAR_STATIONS, detail: '행사장까지 직선 약 1.2 km', kind: 'etc' },
  'station-knowledgeInfo': { id: 'zone-knowledge-info-station', name: '지식정보단지역 (인천 1호선)', group: NEAR_STATIONS, detail: '행사장까지 직선 약 1.2 km', kind: 'etc' },
}

function pins(): Pin[] {
  const map = seriesMapFor(CODE)
  if (!map) throw new Error('Hero Rock map metadata is missing')
  return map.marks.map((mark) => {
    const place = PLACES[mark.kind]
    if (!place) throw new Error(`Hero Rock map mark ${mark.id} has unknown kind "${mark.kind}"`)
    return { ...place, id: `${CODE}-${place.id}`, mapIcon: mark.kind, lat: mark.lat, lng: mark.lng }
  })
}

/** Hero Rock Festival Incheon at Songdo Convensia, on its big area map (no venue map yet). */
export const HERO_ROCK: FestivalSeries = {
  code: CODE,
  name: '히어로 락 페스티벌 - 인천',
  venue: { name: '송도컨벤시아', lat: 37.388776, lng: 126.646738 },
  pins,
  // 2026 data came from Melon Ticket and a poster the user sent: nothing scraped from this account yet.
  sources: [{ method: '인스타', value: '@herorockfestival', lastScrapedPostDate: null }],
  // From its Instagram and the 2026 poster (2026-10-21): bronze gold from the logo and dates, the logo on a black
  // circle as on the profile picture (scripts/art/build-herorock.mjs). Stage icons and colors wait for the timetable.
  theme: { accent: '#7d5a1c', art: heroRockArt, stages: {} },
}
