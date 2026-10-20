import lineup1 from '../../assets/lineups/herorock2026-1.webp'
import type { Festival, Pin } from '../schema'
import { HERO_ROCK_2026_ID, HERO_ROCK_2026_KEY as KEY } from './ids'
import type { LineupImage } from './lineup'

/**
 * 2026 히어로 락 페스티벌 - 인천 (2026-12-18/20, Songdo Convensia, Incheon).
 * Source: Melon Ticket product page (ticket.melon.com/performance/index.htm?prodId=214033).
 * The line-up is out but the timetable is not, so there are no stages or performances yet: the timetable
 * tab shows the line-up posters instead. Fill them in once the official timetable is out.
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

/** Official line-up posters in the order they were announced (add each new one at the end). */
export const HERO_ROCK_2026_LINEUP: readonly LineupImage[] = [
  {
    src: lineup1,
    label: '1차 라인업',
    alt:
      '2026 히어로 락 페스티벌 인천 1차 라인업 포스터: YB, 부활, 국카스텐, LACUNA COIL, 데이브레이크, 크라잉넛, ' +
      'MARTY FRIEDMAN, 쏜애플, 터치드, 로맨틱펀치, GUMX, QWER, HANABIE., Sable Hills, 브로큰 발렌타인, 카디, ' +
      '극동아시아타이거즈 외. 2026년 12월 18일(금)·19일(토)·20일(일), 송도컨벤시아',
    width: 700,
    height: 880,
  },
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
