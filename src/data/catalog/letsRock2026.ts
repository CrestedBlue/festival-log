import type { Festival } from '../schema'
import { LETS_ROCK_2026_ID, LETS_ROCK_2026_KEY as KEY } from './ids'
import { LETS_ROCK } from './series/letsRock'
import { stageLook } from './series/theme'
import { SELLERS, type TicketSeller } from './tickets'
import { noticeBlock } from './noticeArt'
import type { NoticeBlock } from './noticeBlock'

/**
 * 2026 렛츠락 페스티벌 (Let's Rock Festival 2026, its 20th, 2026-10-03/04, Nanji Hangang Park, Seoul).
 * Source: the detail image of the NOL ticket page (nol.yanolja.com/ticket/products/26010980, sold there only): its
 * TIME TABLE, one column a day with each set's times, and its notices. One stage, which the timetable does not name:
 * the app calls it 메인 무대. 21 acts — 10 on the first day, 11 on the second — matching the line-up at its top.
 * Stage and performance ids are fixed (prefixed with the yearly code) so favorites survive updates.
 * The venue, its map pins and the stage color and icon belong to the festival, not the year: see series/letsRock.ts.
 */
export { LETS_ROCK_2026_ID }

/** Admin notices, summarised from the NOL ticket page (its notice and the detail image's guides). */
export const LETS_ROCK_2026_NOTICES: readonly string[] = [
]

/** The notices as topic blocks on the info tab (the user, 2026-11-26: every festival in this format). The pictures are the shared set. */
export const LETS_ROCK_2026_NOTICE_BLOCKS: readonly NoticeBlock[] = [
  noticeBlock('entry', '입장', [
    '**입장** 티켓부스 **09:00–20:00**',
    '게이트 **10:00**(선착순) · 첫 공연 **11:20**',
    '배송받은 티켓은 **팔찌 교환 부스**에서 바로',
    '현장 수령은 티켓부스에서 **신분증·예매내역서**',
    '대리 수령은 **직계가족만**(예매자 신분증·가족관계증명서 실물)',
    '팔찌를 차야 **게이트 줄**을 설 수 있어요',
    '팔찌 없으면 **(재)입장 불가**',
    '양일권 팔찌는 이틀 내내 · **재발급 불가**',
  ]),
  noticeBlock('picnic', '피크닉존', [
    '**피크닉존** 돗자리 · 양산 · 단우산',
    '다리 없는 등받이 의자',
    '스탠딩 존엔 **돗자리·의자·우산 불가**',
  ]),
  noticeBlock('lockers', '물품보관소', ['**물품보관소** **09:00**부터 공연 끝까지', '1회 **3,000원** · 다시 맡기면 **2,000원**']),
  noticeBlock('directions', '오는 길', [
    '**오는 길** **무료 셔틀**: DMC역 근처 새누리 어린이 공원 앞',
    '↔ 하늘공원로(하늘공원 입구), 10분 안팎 간격',
    '공연장 가는 첫차 **08:30** · 나오는 막차 **22:00**',
    '내려서 걸어서 **5분**',
    '난지한강공원 주차장은 **매우 좁아요**',
    '버스 9707(난지한강공원) · 8777(중앙잔디광장)',
  ]),
]

/** Official ticket seller: NOL ticket, which sold it alone ("단독판매"). */
export const LETS_ROCK_2026_TICKETS: readonly TicketSeller[] = [SELLERS.nol(26010980)]

// Stage colors and icons belong to the festival's design (series/letsRock.ts), keyed the same way.
const STAGES = {
  main: '메인 무대',
} as const

type StageKey = keyof typeof STAGES
type Row = readonly [stage: StageKey, start: string, end: string, artist: string]

const DAY1: readonly Row[] = [
  ['main', '11:20', '11:50', '바비핀스'],
  ['main', '12:00', '12:30', '앨리스 신드롬'],
  ['main', '12:40', '13:20', '김승주'],
  ['main', '13:30', '14:10', '윤지영'],
  ['main', '14:20', '15:00', '지소쿠리클럽'],
  ['main', '15:10', '15:50', 'PITTA (강형호)'],
  ['main', '16:00', '16:40', '남우현'],
  ['main', '16:50', '17:30', '쏜애플'],
  ['main', '17:50', '18:40', 'NELL'],
  ['main', '19:40', '21:00', 'Nothing But Thieves'],
]

const DAY2: readonly Row[] = [
  ['main', '11:20', '11:50', '취향상점'],
  ['main', '12:00', '12:40', '초록불꽃소년단'],
  ['main', '12:50', '13:30', '아디오스오디오'],
  ['main', '13:40', '14:20', '크랙샷'],
  ['main', '14:30', '15:10', '바이 바이 배드맨'],
  ['main', '15:20', '16:00', '스키조'],
  ['main', '16:10', '16:50', '갤럭시 익스프레스'],
  ['main', '17:00', '17:40', '크라잉넛'],
  ['main', '17:50', '18:30', '노브레인'],
  ['main', '18:50', '19:40', '국카스텐'],
  ['main', '20:00', '21:00', '자우림'],
]

const toPerformances = (day: string, dayKey: string, rows: readonly Row[]) =>
  rows.map(([stage, start, end, artist], index) => ({
    id: `${KEY}-${dayKey}-${stage}-${String(index).padStart(2, '0')}`,
    stageId: `${KEY}-${stage}`,
    day,
    artist,
    start,
    end,
  }))

export function createLetsRock2026(): Festival {
  return {
    id: LETS_ROCK_2026_ID,
    name: '2026 렛츠락 페스티벌',
    startDate: '2026-10-03',
    endDate: '2026-10-04',
    venue: LETS_ROCK.venue,
    stages: (Object.keys(STAGES) as StageKey[]).map((key) => ({ id: `${KEY}-${key}`, name: STAGES[key], ...stageLook(LETS_ROCK, key) })),
    performances: [...toPerformances('2026-10-03', 'd1', DAY1), ...toPerformances('2026-10-04', 'd2', DAY2)],
    pins: LETS_ROCK.pins(),
  }
}
