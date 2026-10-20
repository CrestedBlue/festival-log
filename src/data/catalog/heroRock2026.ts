import type { Festival, Pin } from '../schema'
import { HERO_ROCK_2026_ID, HERO_ROCK_2026_KEY as KEY } from './ids'

/**
 * 2026 히어로 락페스티벌 at Songdo Convensia, Incheon. Nothing is announced yet (dates, line-up, timetable),
 * so only the venue is set; the app opens it on the map. Fill in dates, stages and performances (and drop
 * datesTbd) once the official timetable is out.
 * Coordinates: OpenStreetMap (Songdo Convensia building, Incheon National University station exit 4 —
 * the exit closest to the venue in a straight line, about 640 m).
 */
export { HERO_ROCK_2026_ID }

// Placeholder inside 2026 so the festival sorts under that year (last); not shown while datesTbd is set.
const PLACEHOLDER_DAY = '2026-12-31'

const PINS: readonly Pin[] = [
  { id: `${KEY}-zone-venue`, name: '송도컨벤시아 · 행사장', kind: 'stage', lat: 37.388776, lng: 126.646738 },
  { id: `${KEY}-zone-incheon-univ-exit-4`, name: '인천대입구역 4번 출구 (인천 1호선)', kind: 'etc', lat: 37.3868987, lng: 126.6398836 },
]

export function createHeroRock2026(): Festival {
  return {
    id: HERO_ROCK_2026_ID,
    name: '2026 히어로 락페스티벌',
    startDate: PLACEHOLDER_DAY,
    endDate: PLACEHOLDER_DAY,
    datesTbd: true,
    venue: { name: '송도컨벤시아', lat: 37.388776, lng: 126.646738 },
    stages: [],
    performances: [],
    pins: [...PINS],
  }
}
