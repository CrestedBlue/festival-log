import type { Festival } from '../schema'
import { BML_2026_ID, BML_2026_KEY as KEY } from './ids'
import { BML } from './series/bml'
import { stageLook } from './series/theme'
import { SELLERS, type TicketSeller } from './tickets'
import { noticeBlock } from './noticeArt'
import type { NoticeBlock } from './noticeBlock'

/**
 * 뷰티풀 민트 라이프 2026 (Beautiful Mint Life 2026, 2026-05-30/31, Oil Tank Culture Park, Seoul).
 * Source: the official Mint Paper site, "BML2026 | 타임테이블 / 맵 / 안내 사항" of 2026-04-30
 * (mintpaper.co.kr/festivals/170/notice/4673): one timetable image a day. 48 acts, 24 a day (the final line-up's 48).
 * The last set of each stage is given a start only ("20:10"): its end is where its block ends on the timetable, the
 * same on both days. The opening speech (개회사) and the programs of 민트문화체육센터 (classes and contests with a start
 * time only) are not sets and are left out.
 * Stage and performance ids are fixed (prefixed with the yearly code) so favorites survive updates.
 * The venue, its map pins and the stage colors and icons belong to the festival, not the year: see series/bml.ts.
 */
export { BML_2026_ID }

/** Admin notices, summarised from the official ticket notice (2026-02-12) and the notice pages of the timetable post. */
export const BML_2026_NOTICES: readonly string[] = [
]

/** The notices as topic blocks on the info tab (the user, 2026-11-26: every festival in this format). The pictures are the shared set. */
export const BML_2026_NOTICE_BLOCKS: readonly NoticeBlock[] = [
  noticeBlock('entry', '입장', [
    '**입장** 우선입장 티켓부스 **10:00** · 티켓부스 **10:10**',
    '인포메이션 부스(현장 판매) **10:40**',
    '무대마다 문 여는 시간은 타임테이블에',
    '모바일 티켓 관람 전날 **20:00** 예매처 앱에서',
    '**캡처·사본 불가** · **본인 신분증 원본**',
    '네이버 예약은 [마이] › [예약]',
    '대리 수령은 **직계 가족 아이디** 예매만(가족관계 서류)',
    '2매면 **동행인과 함께** 티켓부스로',
    '손목밴드를 차야 **입장 줄**을 설 수 있어요',
    '**재발급 불가** · 손목밴드 양도·재판매 **불법**',
    '미취학 아동(2020.1.1 이후 출생) 보호자 동반 **무료**(증빙)',
  ]),
  noticeBlock('stage', '무대', [
    '**무대** Mint Breeze Stage(문화마당): 스탠딩 + 레저 존',
    '레저 존은 앉아서 · **1인용 매트** 권장',
    'Loving Forest Garden(T2 야외): 앉아서 보는 무대',
    'Flood in the Cave(T2 실내): 스탠딩',
    '사람이 많으면 무대 **입장 제한**',
    '**자리 맡기 불가**',
    '마지막 공연 끝나고 **15분** 뒤 남은 물건 폐기',
  ]),
  noticeBlock('food', '음식', [
    '**음식** **재사용 용기**에 담은 것만',
    '물·음료는 **500ml** 이하 페트병만',
    '**병·캔·주류·외부 포장 음식 불가**',
    '스탠딩 존·실내 공연장은 뚜껑 있는 **생수만**',
    '프리 워터존 있어요 · **텀블러** 챙기기',
  ]),
  noticeBlock('rules', '금지', [
    '**금지** 텐트 · 다리 있는 의자 · 장우산',
    '바퀴 달린 물건(**휠체어·유모차는 가능**)',
    '전문 촬영·녹음 장비',
    '큰 가방은 **물품보관소**에',
  ]),
]

/** Official ticket sellers, as the ticket notice names and links them (NOL ticket, YES24, Naver booking). */
export const BML_2026_TICKETS: readonly TicketSeller[] = [SELLERS.nol(26002268), SELLERS.yes24(57200), SELLERS.naver(1597631, 7439479)]

// Stage colors and icons belong to the festival's design (series/bml.ts), keyed the same way.
const STAGES = {
  mint: 'Mint Stage',
  breeze: 'Breeze Stage',
  forest: 'Loving Forest Garden',
  cave: 'Flood in the Cave',
} as const

type StageKey = keyof typeof STAGES
type Row = readonly [stage: StageKey, start: string, end: string, artist: string]

const DAY1: readonly Row[] = [
  ['mint', '12:40', '13:25', '너드커넥션'],
  ['mint', '14:20', '15:05', 'Daybreak'],
  ['mint', '16:10', '17:00', '정승환'],
  ['mint', '18:10', '19:00', '터치드'],
  ['mint', '20:10', '21:00', 'LUCY'],
  ['breeze', '12:00', '12:40', 'AxMxP'],
  ['breeze', '13:30', '14:15', '소란'],
  ['breeze', '15:10', '16:00', '페퍼톤스'],
  ['breeze', '17:10', '18:00', '카더가든'],
  ['breeze', '19:10', '20:00', 'N.Flying'],
  ['forest', '12:20', '12:50', '찬민'],
  ['forest', '13:20', '14:00', '이츠'],
  ['forest', '14:30', '15:10', '이오욱 (LOW)'],
  ['forest', '15:40', '16:20', '연정'],
  ['forest', '16:50', '17:30', '김수영'],
  ['forest', '18:10', '19:00', '안예은'],
  ['forest', '19:40', '20:30', '하동균'],
  ['cave', '11:50', '12:20', '유인원'],
  ['cave', '12:50', '13:30', '유령서점'],
  ['cave', '14:00', '14:40', '데카당'],
  ['cave', '15:10', '15:50', '잭킹콩'],
  ['cave', '16:20', '17:00', '87dance'],
  ['cave', '17:30', '18:20', 'Tuesday Beach Club'],
  ['cave', '19:00', '19:50', '다섯'],
]

const DAY2: readonly Row[] = [
  ['mint', '12:00', '12:40', '까치산'],
  ['mint', '13:30', '14:15', '오월오일'],
  ['mint', '15:10', '16:00', '하현상'],
  ['mint', '17:10', '18:00', '로이킴'],
  ['mint', '19:10', '20:00', '원필'],
  ['breeze', '12:40', '13:25', 'Dragon Pony'],
  ['breeze', '14:20', '15:05', '소수빈'],
  ['breeze', '16:10', '17:00', '심규선'],
  ['breeze', '18:10', '19:00', '장기하'],
  ['breeze', '20:10', '21:00', 'AKMU'],
  ['forest', '12:20', '12:50', 'imzoo'],
  ['forest', '13:20', '14:00', 'BAND KIRIN'],
  ['forest', '14:30', '15:10', 'g0nny'],
  ['forest', '15:40', '16:20', '오존'],
  ['forest', '16:50', '17:30', '92914'],
  ['forest', '18:10', '19:00', '알레프'],
  ['forest', '19:40', '20:30', '옥상달빛'],
  ['cave', '11:50', '12:20', '양치기소년단'],
  ['cave', '12:50', '13:30', '오이스터즈'],
  ['cave', '14:00', '14:40', 'KIK'],
  ['cave', '15:10', '15:50', 'LOW HIGH LOW'],
  ['cave', '16:20', '17:00', 'Wah Wah Wah'],
  ['cave', '17:30', '18:20', 'Snake Chicken Soup'],
  ['cave', '19:00', '19:50', 'KARDI'],
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

export function createBml2026(): Festival {
  return {
    id: BML_2026_ID,
    name: '뷰티풀 민트 라이프 2026',
    startDate: '2026-05-30',
    endDate: '2026-05-31',
    venue: BML.venue,
    stages: (Object.keys(STAGES) as StageKey[]).map((key) => ({ id: `${KEY}-${key}`, name: STAGES[key], ...stageLook(BML, key) })),
    performances: [...toPerformances('2026-05-30', 'd1', DAY1), ...toPerformances('2026-05-31', 'd2', DAY2)],
    pins: BML.pins(),
  }
}
