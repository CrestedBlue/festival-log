import type { Festival } from '../schema'
import { BUSAN_ROCK_2026_ID, BUSAN_ROCK_2026_KEY as KEY } from './ids'
import { BUSAN_ROCK } from './series/busanRock'
import { stageLook } from './series/theme'
import { SELLERS, type TicketSeller } from './tickets'

/**
 * 2026 부산국제록페스티벌 (2026 Busan International Rock Festival, 2026-10-02 – 10-04, Samnak Ecological Park, Busan).
 * Source: the official site's "[UPDATED TIMETABLE]" (busanrockfestival.com/notice/2026notice_38, 2026-10-02): one image
 * a day, each set with its times. 99 acts, 33 a day, matching the final line-up — except that the line-up change of
 * 10/2 (notice 2026notice_37) made MEGADETH the SAMROCK headliner that night as well as the next: the timetable gives
 * it "21:00 ~ / TBD", kept as 21:00–22:00 where its block ends. The HIDDEN stage's HIDDEN EVENTs (sports day, singing
 * contest, rookie awards) are stage events (ids with "-event-").
 * Korean acts go by the Korean name the timetable prints large.
 * Stage and performance ids are fixed (prefixed with the yearly code) so favorites survive updates.
 * The venue, its map pins and the stage colors and icons belong to the festival, not the year: see series/busanRock.ts.
 */
export { BUSAN_ROCK_2026_ID }

/** Admin notices, summarised from the official site's timetable, line-up change and ticket pages (2026). */
export const BUSAN_ROCK_2026_NOTICES: readonly string[] = [
  '게이트는 사흘 모두 10:00에 열려요. 무대는 SAMROCK·GREEN·RIVER·WAVE·HIDDEN 5곳이고, HIDDEN 스테이지는 무료예요.',
  '10월 2일(금) 삼락 스테이지 헤드라이너가 MEGADETH로 바뀌었어요(최종 라인업 발표 뒤 변동). 정확한 시작 시간은 현장에서 안내되고, MEGADETH는 10/2·10/3 이틀 모두 공연해요.',
  'HIDDEN 스테이지에서는 저녁에 부락 대운동회, 부락 노래자랑, 루키 시상식 같은 HIDDEN EVENT가 열려요.',
  '정규 티켓(1·2·3일권)은 YES24 티켓에서 팔아요. 셔틀버스(카카오 T, k.ride)와 캠핑 안내는 공식 홈페이지에 있어요.',
]

/** Official ticket seller: the YES24 page the official site's TICKET menu links. */
export const BUSAN_ROCK_2026_TICKETS: readonly TicketSeller[] = [SELLERS.yes24Special(58933)]

// Stage colors and icons belong to the festival's design (series/busanRock.ts), keyed the same way.
const STAGES = {
  samrock: 'SAMROCK',
  green: 'GREEN',
  river: 'RIVER',
  wave: 'WAVE',
  hidden: 'HIDDEN',
} as const

type StageKey = keyof typeof STAGES
type Row = readonly [stage: StageKey, start: string, end: string, artist: string]

const DAY1: readonly Row[] = [
  ['samrock', '12:00', '12:30', '다다다'],
  ['samrock', '13:00', '13:30', '정우'],
  ['samrock', '14:00', '14:40', 'KARDI'],
  ['samrock', '15:20', '16:00', '로맨틱펀치'],
  ['samrock', '16:50', '17:40', '브로콜리너마저'],
  ['samrock', '18:30', '19:30', 'CreepHyp'],
  ['samrock', '21:00', '22:00', 'MEGADETH'],
  ['green', '11:30', '12:00', 'Tokai'],
  ['green', '12:30', '13:00', 'hathaw9y'],
  ['green', '13:30', '14:00', 'Redoor'],
  ['green', '14:40', '15:20', 'LUCKLIFE'],
  ['green', '16:00', '16:50', 'Xdinary Heroes'],
  ['green', '17:40', '18:30', '장범준'],
  ['green', '19:30', '20:50', '이승윤'],
  ['river', '11:40', '12:10', 'hrtz.wav'],
  ['river', '12:40', '13:10', 'DYGL'],
  ['river', '13:40', '14:20', '공원'],
  ['river', '14:50', '15:30', '한요한'],
  ['river', '16:00', '16:40', 'Elephant Gym'],
  ['river', '17:10', '18:00', '페퍼톤스'],
  ['river', '18:40', '19:40', 'N.Flying'],
  ['wave', '11:30', '12:00', 'D82'],
  ['wave', '12:30', '13:00', '산보'],
  ['wave', '13:30', '14:00', 'HOA'],
  ['wave', '14:40', '15:20', '밴드기린'],
  ['wave', '16:00', '16:50', '알레프'],
  ['wave', '17:40', '18:30', '강산에'],
  ['wave', '19:30', '20:20', 'J.E.B'],
  ['hidden', '13:20', '13:50', '노아코스트'],
  ['hidden', '14:10', '14:40', '블낫블'],
  ['hidden', '15:00', '15:30', '퓨처피어클럽'],
  ['hidden', '15:50', '16:20', '아스라이'],
  ['hidden', '16:40', '17:10', '나타샤'],
]

const DAY2: readonly Row[] = [
  ['samrock', '12:00', '12:30', 'Wah Wah Wah'],
  ['samrock', '13:00', '13:30', '신인류'],
  ['samrock', '14:00', '14:40', 'SPACEY JANE'],
  ['samrock', '15:20', '16:00', 'WOODZ'],
  ['samrock', '16:50', '17:40', '터치드'],
  ['samrock', '18:30', '19:30', '잔나비'],
  ['samrock', '20:40', '22:00', 'MEGADETH'],
  ['green', '11:30', '12:00', '프랭클리'],
  ['green', '12:30', '13:00', '캔트비블루'],
  ['green', '13:30', '14:00', '스카웨이커스'],
  ['green', '14:40', '15:20', '브로큰 발렌타인'],
  ['green', '16:00', '16:50', 'ADOY'],
  ['green', '17:40', '18:30', 'IDIOTAPE'],
  ['green', '19:30', '20:30', 'Suchmos'],
  ['river', '11:40', '12:10', '야자수'],
  ['river', '12:40', '13:10', '이츠'],
  ['river', '13:40', '14:20', '고고학'],
  ['river', '14:50', '15:30', '오월오일'],
  ['river', '16:00', '16:40', '윤마치'],
  ['river', '17:10', '18:00', '권진아'],
  ['river', '18:40', '19:40', 'Henry Moodie'],
  ['wave', '11:30', '12:00', '단감자'],
  ['wave', '12:30', '13:00', 'Chivan'],
  ['wave', '13:30', '14:00', 'AxMxP'],
  ['wave', '14:40', '15:20', 'GOODMOOD'],
  ['wave', '16:00', '16:50', 'Wendy Wander'],
  ['wave', '17:40', '18:30', '세이수미'],
  ['wave', '19:30', '20:20', 'HYPNOSIS THERAPY'],
  ['hidden', '13:20', '13:50', '베이루트택시'],
  ['hidden', '14:10', '14:40', '최춘목밴드'],
  ['hidden', '15:00', '15:30', '천둥오리'],
  ['hidden', '15:50', '16:20', 'To More Raw'],
  ['hidden', '16:40', '17:10', 'Eddie and the Bricks'],
]

const DAY3: readonly Row[] = [
  ['samrock', '12:00', '12:30', '양치기소년단'],
  ['samrock', '13:00', '13:30', '극동아시아타이거즈'],
  ['samrock', '14:00', '14:40', '너드커넥션'],
  ['samrock', '15:20', '16:00', 'HANABIE.'],
  ['samrock', '16:50', '17:40', '한로로'],
  ['samrock', '18:40', '19:40', 'Hitsujibungaku'],
  ['samrock', '20:50', '22:00', 'THE LIBERTINES'],
  ['green', '11:30', '12:00', '심아일랜드'],
  ['green', '12:30', '13:00', '레이지본'],
  ['green', '13:30', '14:00', 'Dragon Pony'],
  ['green', '14:40', '15:20', 'AiNA THE END'],
  ['green', '16:00', '16:50', 'LUCY'],
  ['green', '17:40', '18:40', 'CNBLUE'],
  ['green', '19:40', '20:40', '송골매'],
  ['river', '11:40', '12:10', '희규'],
  ['river', '12:40', '13:10', 'OYSTERS'],
  ['river', '13:40', '14:20', 'Ardhito Pramono'],
  ['river', '14:50', '15:30', '까치산'],
  ['river', '16:00', '16:40', '김뜻돌'],
  ['river', '17:10', '18:00', '김성규'],
  ['river', '18:40', '19:40', '카더가든'],
  ['wave', '11:30', '12:00', '정수민'],
  ['wave', '12:30', '13:00', 'BØJEONG'],
  ['wave', '13:30', '14:00', 'KIK'],
  ['wave', '14:40', '15:20', 'Tuesday Beach Club'],
  ['wave', '16:00', '16:50', '놀이도감'],
  ['wave', '17:40', '18:30', '데이먼스 이어'],
  ['wave', '19:40', '20:30', '타이거디스코'],
  ['hidden', '13:20', '13:50', '김푸름'],
  ['hidden', '14:10', '14:40', '시인을 위하여'],
  ['hidden', '15:00', '15:30', '데이네버체인지'],
  ['hidden', '15:50', '16:20', '포져군단'],
  ['hidden', '16:40', '17:10', '아사달'],
]

/** The HIDDEN EVENTs on the HIDDEN stage, shown in the grid (not in the act lists). */
const SPORTS_DAY: Row = ['hidden', '17:40', '18:20', '부락 대운동회 (BU-ROCK SPORTS DAY)']
const SINGING_CONTEST: Row = ['hidden', '18:30', '19:20', '부락 노래자랑 (BU-ROCK SINGING CONTEST)']
const EVENTS: Readonly<Record<string, readonly Row[]>> = {
  d1: [SPORTS_DAY, SINGING_CONTEST],
  d2: [SPORTS_DAY, SINGING_CONTEST],
  d3: [['hidden', '17:40', '18:20', 'Rookies on the BU-ROCK Awards'], SINGING_CONTEST],
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

export function createBusanRock2026(): Festival {
  return {
    id: BUSAN_ROCK_2026_ID,
    name: '2026 부산국제록페스티벌',
    startDate: '2026-10-02',
    endDate: '2026-10-04',
    venue: BUSAN_ROCK.venue,
    stages: (Object.keys(STAGES) as StageKey[]).map((key) => ({ id: `${KEY}-${key}`, name: STAGES[key], ...stageLook(BUSAN_ROCK, key) })),
    performances: [
      ...toPerformances('2026-10-02', 'd1', DAY1),
      ...toPerformances('2026-10-03', 'd2', DAY2),
      ...toPerformances('2026-10-04', 'd3', DAY3),
    ],
    pins: BUSAN_ROCK.pins(),
  }
}
