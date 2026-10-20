import type { Festival } from '../schema'
import { PENTAPORT_2026_ID, PENTAPORT_2026_KEY as KEY } from './ids'
import { PENTAPORT } from './series/pentaport'

/**
 * 2026 인천펜타포트 락 페스티벌 (2026-07-31 – 08-02, Songdo Moonlight Festival Park, Incheon).
 * Source: the official timetable post on Instagram (@pentaportrf, 2026-07-09; Korean slides, checked against
 * the English ones). 66 acts on three stages, plus the stage events shown in the grid.
 * Stage and performance ids are fixed (prefixed with the yearly code) so favorites survive updates.
 * The venue and its map pins belong to the festival, not the year: see series/pentaport.ts.
 */
export { PENTAPORT_2026_ID }

/** Admin notices, from the timetable post (2026). */
export const PENTAPORT_2026_NOTICES: readonly string[] = [
  '입장은 사흘 모두 오전 10시 30분부터예요.',
  '드리머부스는 매일 10:30–19:30 열리는 상시 프로그램이에요(MONSTER ENERGY STAGE 시간표에 함께 안내).',
  '7월 31일(금) 13:00–16:00 메인 쿨존에서 "펜타포트 × 스포티파이 음모론"이 열려요.',
]

// Shortened so they fit the two-line stage header: "KB KOOKMIN CARD STAGE" as the poster's own "KB국민카드", the others without "STAGE".
const STAGES = {
  kb: { name: 'KB국민카드', color: '#f5a50a' },
  monster: { name: 'MONSTER ENERGY', color: '#6abf2e' },
  stanley: { name: 'STANLEY 1913', color: '#55555f' },
} as const

type StageKey = keyof typeof STAGES
type Row = readonly [stage: StageKey, start: string, end: string, artist: string]

const PENTAROBICS = '스탠리와 함께하는 펜타로빅 with 김혜선'

const DAY1: readonly Row[] = [
  ['kb', '12:00', '12:40', '나상현씨밴드'],
  ['kb', '13:10', '13:50', 'QWER'],
  ['kb', '14:30', '15:10', '브로큰 발렌타인'],
  ['kb', '15:50', '16:30', 'The Poles'],
  ['kb', '17:20', '18:10', '쏜애플'],
  ['kb', '19:00', '20:00', '더 발룬티어스'],
  ['kb', '21:10', '22:30', 'KHRUANGBIN'],
  ['monster', '11:30', '12:00', '심아일랜드'],
  ['monster', '12:40', '13:10', '신인류'],
  ['monster', '13:50', '14:30', 'MONO NO AWARE'],
  ['monster', '15:10', '15:50', '윤마치'],
  ['monster', '16:30', '17:20', '키라라'],
  ['monster', '18:10', '19:00', 'The Lemon Twigs'],
  ['monster', '20:00', '21:00', 'Xdinary Heroes'],
  ['stanley', '11:40', '12:10', '노이'],
  ['stanley', '12:40', '13:10', '포져군단'],
  ['stanley', '13:40', '14:10', '피치트럭하이재커스'],
  ['stanley', '14:40', '15:10', '향우회'],
  ['stanley', '15:40', '16:20', 'SUMIN'],
  ['stanley', '16:50', '17:30', '머드 더 스튜던트'],
  ['stanley', '18:00', '18:40', '더 픽스'],
  ['stanley', '19:20', '20:00', 'Flesh Juicer 血肉果汁機'],
]

const DAY2: readonly Row[] = [
  ['kb', '12:00', '12:40', '잭킹콩'],
  ['kb', '13:10', '13:50', '극동아시아타이거즈'],
  ['kb', '14:30', '15:10', '권진아'],
  ['kb', '15:50', '16:30', 'never young beach'],
  ['kb', '17:10', '18:00', '이승윤'],
  ['kb', '18:50', '20:00', '혁오'],
  ['kb', '21:10', '22:40', 'MASSIVE ATTACK'],
  ['monster', '11:30', '12:00', '하이파이유니콘'],
  ['monster', '12:40', '13:10', '초록불꽃소년단'],
  ['monster', '13:50', '14:30', '세이수미'],
  ['monster', '15:10', '15:50', 'Song Dongye 宋冬野'],
  ['monster', '16:30', '17:10', 'Isyana Sarasvati'],
  ['monster', '18:00', '18:50', '장필순'],
  ['monster', '20:00', '21:00', 'The Jesus and Mary Chain'],
  ['stanley', '11:40', '12:10', '릴리 잇 머신'],
  ['stanley', '12:40', '13:10', '청요일'],
  ['stanley', '13:40', '14:10', '산보'],
  ['stanley', '14:40', '15:10', '우륵과 풍각쟁이들'],
  ['stanley', '15:40', '16:20', 'baan'],
  ['stanley', '17:00', '17:40', 'TURTLE ISLAND'],
  ['stanley', '18:10', '18:50', '할로우 잰'],
  ['stanley', '19:20', '20:00', 'the geeks'],
]

const DAY3: readonly Row[] = [
  ['kb', '12:00', '12:40', '드래곤포니'],
  ['kb', '13:10', '13:50', '봉제인간'],
  ['kb', '14:30', '15:10', 'HANA'],
  ['kb', '15:50', '16:30', '리도어'],
  ['kb', '17:10', '18:00', '터치드'],
  ['kb', '18:50', '20:00', '실리카겔'],
  ['kb', '21:10', '22:40', 'PIXIES'],
  ['monster', '11:30', '12:00', '컨파인드 화이트'],
  ['monster', '12:40', '13:10', '다브다'],
  ['monster', '13:50', '14:30', '백현진'],
  ['monster', '15:10', '15:50', 'betcover!!'],
  ['monster', '16:30', '17:10', '노이즈가든'],
  ['monster', '18:00', '18:50', 'Original Love'],
  ['monster', '20:00', '21:00', '술탄오브더디스코'],
  ['stanley', '11:40', '12:10', 'Eddie and the Bricks'],
  ['stanley', '12:40', '13:10', 'CASUALLY CONNECTED'],
  ['stanley', '13:40', '14:10', '양정훈'],
  ['stanley', '14:50', '15:20', '감귤서리단'],
  ['stanley', '15:50', '16:20', 'Nyteh'],
  ['stanley', '17:00', '17:30', '아시안 스파이스 하우스'],
  ['stanley', '18:00', '18:40', '팻햄스터 & 캉뉴'],
  ['stanley', '19:20', '20:00', '이날치'],
]

/** Stage events shown in the grid (not in the act lists): the opening ceremony and the nightly Pentarobics. */
const EVENTS: Readonly<Record<string, readonly Row[]>> = {
  d1: [
    ['kb', '21:00', '21:10', '개막 행사'],
    ['stanley', '20:30', '21:00', PENTAROBICS],
  ],
  d2: [['stanley', '20:30', '21:00', PENTAROBICS]],
  d3: [['stanley', '20:30', '21:00', PENTAROBICS]],
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

export function createPentaport2026(): Festival {
  return {
    id: PENTAPORT_2026_ID,
    name: '2026 인천펜타포트 락 페스티벌',
    startDate: '2026-07-31',
    endDate: '2026-08-02',
    venue: PENTAPORT.venue,
    stages: (Object.keys(STAGES) as StageKey[]).map((key) => ({ id: `${KEY}-${key}`, ...STAGES[key] })),
    performances: [
      ...toPerformances('2026-07-31', 'd1', DAY1),
      ...toPerformances('2026-08-01', 'd2', DAY2),
      ...toPerformances('2026-08-02', 'd3', DAY3),
    ],
    pins: PENTAPORT.pins(),
  }
}
