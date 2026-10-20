import type { Festival, Pin } from '../schema'
import { HERO_ROCK_2026_ID, HERO_ROCK_2026_KEY as KEY } from './ids'

/**
 * 2026 히어로 락 페스티벌 - 인천 (2026-12-18/20, Songdo Convensia, Incheon).
 * Source: Melon Ticket product page (ticket.melon.com/performance/index.htm?prodId=214033).
 * The line-up is out but the timetable is not, so there are no stages or performances yet and the app
 * opens it on the map. Fill them in once the official timetable is out.
 * Coordinates: OpenStreetMap (Songdo Convensia building, Incheon National University station exit 4 —
 * the exit closest to the venue in a straight line, about 640 m).
 */
export { HERO_ROCK_2026_ID }

/** Admin notices, summarised from the Melon Ticket page (2026). */
export const HERO_ROCK_2026_NOTICES: readonly string[] = [
  '모바일 티켓으로만 들어갈 수 있어요. 멜론티켓 앱 › 마이티켓 › 예매내역 › 모바일티켓에서 확인해요.',
  '사흘 모두 오전 10시 30분에 시작해요(관람 시간 690분).',
  '장애인·국가유공자·미성년자 30% 할인으로 샀다면 증빙자료를 챙기세요. 없으면 현장에서 차액을 내요.',
  '관람일 당일이나 취소 마감 시간이 지나면 취소·환불이 안 돼요.',
]

const PINS: readonly Pin[] = [
  { id: `${KEY}-zone-venue`, name: '송도컨벤시아 · 행사장', kind: 'stage', lat: 37.388776, lng: 126.646738 },
  { id: `${KEY}-zone-incheon-univ-exit-4`, name: '인천대입구역 4번 출구 (인천 1호선)', kind: 'etc', lat: 37.3868987, lng: 126.6398836 },
]

export function createHeroRock2026(): Festival {
  return {
    id: HERO_ROCK_2026_ID,
    name: '2026 히어로 락 페스티벌 - 인천',
    startDate: '2026-12-18',
    endDate: '2026-12-20',
    venue: { name: '송도컨벤시아', lat: 37.388776, lng: 126.646738 },
    stages: [],
    performances: [],
    pins: [...PINS],
  }
}
