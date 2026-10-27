import type { Festival } from '../schema'
import { PENTAPORT_2025_ID, PENTAPORT_2025_KEY as KEY } from './ids'
import { PENTAPORT } from './series/pentaport'
import { stageLook } from './series/theme'

/**
 * 2025 인천펜타포트 락 페스티벌 (2025-08-01 – 08-03, Songdo Moonlight Festival Park, Incheon), its 20th edition.
 * Source: the official timetable posted again on the official site after the line-up changes ("[2025 PENTAPORT]
 * 타임테이블 공개", 2025-07-31; Korean slides, checked against the English ones). 58 acts on three stages (HYUKOH &
 * SUNSET ROLLERCOASTER count as two), plus the opening ceremony in the grid.
 * Stage and performance ids are fixed (prefixed with the yearly code) so favorites survive updates.
 * The venue and its map pins belong to the festival, not the year: see series/pentaport.ts.
 */
export { PENTAPORT_2025_ID }

/** Admin notices, from the official site's 2025 posts (7/14 – 7/30). */
export const PENTAPORT_2025_NOTICES: readonly string[] = [
  '입장 게이트는 사흘 모두 오전 10시에 열려요. 행사는 10:00–22:00, 티켓부스는 10:00–21:00 운영해요.',
  '송도 워터프런트 공사로 티켓부스 자리가 바뀌어 입장할 때 기다릴 수 있어요.',
  '출연 변경: 8월 2일(토) BEABADOOBEE가 건강 문제로 취소되어 그 시간에 글렌체크가, 8월 3일(일) DEAFHEAVEN이 취소되어 그 시간에 이승윤이 무대에 올라요.',
  '8월 1일(금) 21:00–21:10 KB국민카드 STARSHOP 스테이지에서 개막식이 열려요.',
  '인천 지하철 1호선 박촌행 열차가 사흘 동안 새벽 1시(25:00)까지 연장 운행해요. 송도달빛축제공원역 4번 출구에서 걸어서 10분(약 550m)이에요.',
  '폭염 대비: 생수는 개수 제한 없이 가져올 수 있어요. 의료 쿨존·그늘막·워터캐논·살수차와 의료부스를 이용하세요.',
  'KB국민카드 할인은 F&B·맥주·MD·생수를 살 때 적용돼요. 민생회복 소비쿠폰은 행사장 안에서 쓸 수 없어요.',
  'F&B는 "퀸즈스마일" 앱으로 미리 주문할 수 있어요.',
]

// Shortened so they fit the two-line stage header: "KB KOOKMIN CARD STARSHOP STAGE" as "KB국민카드", as in 2026
// ("STARSHOP" is one word too wide for the column and broke mid-word), "INCHEON STAGE" and "INCHEON AIRPORT STAGE"
// without "STAGE". Colors and icons belong to the festival's design (series/pentaport.ts).
const STAGES = {
  kb: 'KB국민카드',
  incheon: 'INCHEON',
  airport: 'INCHEON AIRPORT',
} as const

type StageKey = keyof typeof STAGES
type Row = readonly [stage: StageKey, start: string, end: string, artist: string]

const DAY1: readonly Row[] = [
  ['kb', '12:00', '12:40', '김뜻돌'],
  ['kb', '13:10', '13:50', '리도어'],
  ['kb', '14:20', '15:00', '너드커넥션'],
  ['kb', '15:40', '16:30', '터치드'],
  ['kb', '17:10', '18:10', 'LITTLE SIMZ'],
  ['kb', '19:00', '20:00', '장기하'],
  ['kb', '21:10', '22:30', 'ASIAN KUNG-FU GENERATION'],
  ['incheon', '11:30', '12:00', '드래곤포니'],
  ['incheon', '12:40', '13:10', '더 보울스'],
  ['incheon', '13:50', '14:20', 'QWER'],
  ['incheon', '15:00', '15:40', '當代電影大師 (Modern Cinema Master)'],
  ['incheon', '16:30', '17:10', '봉제인간'],
  ['incheon', '18:10', '19:00', 'Tempalay'],
  ['incheon', '20:00', '21:00', '크라잉넛'],
  ['airport', '12:00', '12:30', '김승주'],
  ['airport', '13:00', '13:30', 'HYANG'],
  ['airport', '14:00', '14:30', '캐치더영'],
  ['airport', '15:10', '15:40', '데이네버체인지'],
  ['airport', '16:10', '16:40', '롤링쿼츠'],
]

const DAY2: readonly Row[] = [
  ['kb', '12:00', '12:40', 'KARDI'],
  ['kb', '13:10', '13:50', '갤럭시 익스프레스'],
  ['kb', '14:30', '15:10', 'Omoinotake'],
  ['kb', '15:50', '16:30', 'ADOY'],
  ['kb', '17:10', '18:00', '글렌체크'],
  ['kb', '18:50', '20:00', 'HYUKOH & SUNSET ROLLERCOASTER'],
  ['kb', '21:00', '22:30', 'Pulp'],
  ['incheon', '11:30', '12:00', '다양성'],
  ['incheon', '12:40', '13:10', 'BABO'],
  ['incheon', '13:50', '14:30', '소음발광'],
  ['incheon', '15:10', '15:50', '단편선 순간들'],
  ['incheon', '16:30', '17:10', '바이 바이 배드맨'],
  ['incheon', '18:00', '18:50', 'kanekoayano'],
  ['incheon', '20:00', '21:00', '메써드'],
  ['airport', '11:30', '12:00', 'creespy'],
  ['airport', '12:30', '13:00', '비공정'],
  ['airport', '13:30', '14:10', '오마르와 동방전력'],
  ['airport', '14:50', '15:30', '서울전자음악단'],
  ['airport', '16:10', '16:50', '로다운 30'],
]

const DAY3: readonly Row[] = [
  ['kb', '12:00', '12:40', '윤마치'],
  ['kb', '13:10', '13:50', '한로로'],
  ['kb', '14:30', '15:10', 'AUDREY NUNA'],
  ['kb', '15:50', '16:40', 'Balming Tiger (Band Set)'],
  ['kb', '17:20', '18:10', '이승윤'],
  ['kb', '19:00', '20:00', '자우림'],
  ['kb', '21:00', '22:20', 'BECK'],
  ['incheon', '11:30', '12:00', '극동아시아타이거즈'],
  ['incheon', '12:40', '13:10', '송소희'],
  ['incheon', '13:50', '14:30', 'Brandy Senki'],
  ['incheon', '15:10', '15:50', 'LUCY'],
  ['incheon', '16:40', '17:20', 'Touché Amoré'],
  ['incheon', '18:10', '19:00', '김민규 (델리스파이스, 스위트피)'],
  ['incheon', '20:00', '21:00', '3호선 버터플라이'],
  ['airport', '12:00', '12:30', '심아일랜드'],
  ['airport', '13:00', '13:30', '컨파인드 화이트'],
  ['airport', '14:00', '14:30', '데카당'],
  ['airport', '15:00', '15:40', 'Milledenials'],
  ['airport', '16:10', '16:40', '밀레나'],
]

/** Stage events shown in the grid (not in the act lists): the opening ceremony. */
const EVENTS: Readonly<Record<string, readonly Row[]>> = {
  d1: [['kb', '21:00', '21:10', '개막식']],
}

const toPerformances = (day: string, dayKey: string, rows: readonly Row[]) => [
  ...rows.map(([stage, start, end, artist], index) => ({
    id: `${KEY}-${dayKey}-${stage}-${String(index).padStart(2, '0')}`,
    stageId: `${KEY}-${stage}`,
    day,
    artist,
    start,
    end,
  })),
  ...(EVENTS[dayKey] ?? []).map(([stage, start, end, artist], index) => ({
    id: `${KEY}-${dayKey}-event-${index}`,
    stageId: `${KEY}-${stage}`,
    day,
    artist,
    start,
    end,
  })),
]

export function createPentaport2025(): Festival {
  return {
    id: PENTAPORT_2025_ID,
    name: '2025 인천펜타포트 락 페스티벌',
    startDate: '2025-08-01',
    endDate: '2025-08-03',
    venue: PENTAPORT.venue,
    stages: (Object.keys(STAGES) as StageKey[]).map((key) => ({ id: `${KEY}-${key}`, name: STAGES[key], ...stageLook(PENTAPORT, key) })),
    performances: [
      ...toPerformances('2025-08-01', 'd1', DAY1),
      ...toPerformances('2025-08-02', 'd2', DAY2),
      ...toPerformances('2025-08-03', 'd3', DAY3),
    ],
    pins: PENTAPORT.pins(),
  }
}
