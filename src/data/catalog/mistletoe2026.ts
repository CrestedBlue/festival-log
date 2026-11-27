import type { Festival } from '../schema'
import { MISTLETOE_2026_ID, MISTLETOE_2026_KEY as KEY } from './ids'
import { noticeBlock } from './noticeArt'
import type { NoticeBlock } from './noticeBlock'
import { MISTLETOE } from './series/mistletoe'
import { stageLook } from './series/theme'
import { SELLERS, type TicketSeller } from './tickets'

/**
 * 'mistletoe' LIVE GIG (2026-12-05, 201P in Sinchon): two sets, 17:30–18:20 and 18:40–19:30.
 * Source: 201P's ticket page (201p.me/39/?idx=399) and its poster ("BY ROOKIES"). Set 2 is S2omeday (the user,
 * 2026-11-27); set 1's act is not named yet, so its slot is called "1부".
 */
export { MISTLETOE_2026_ID }

export const MISTLETOE_2026_NOTICES: readonly string[] = []

export const MISTLETOE_2026_NOTICE_BLOCKS: readonly NoticeBlock[] = [
  noticeBlock('entry', '입장', [
    '**입장** 공연 시작 **10분 전**부터',
    '티켓은 **12/4(금) 18:00** 문자 발송',
    '12/4 18:00 이후 구매는 **구매 내역 캡처**로 입장',
  ]),
  noticeBlock('booking', '예매', [
    '**예매** 201P 홈페이지 · **5,000원**',
    '비회원 구매 가능 · 구매 시 **연락처** 입력 필수',
    '공연 시작 전 **전액 환불** · 시작 후 **환불 불가**',
    '티켓 문의는 홈페이지 카톡 상담',
  ]),
  noticeBlock('directions', '오는 길', ['**오는 길** 신촌역에서 걸어서 **5분** · 창천동 52-56 지하 1층', '**주차 어려움** · 대중교통 권장']),
]

export const MISTLETOE_2026_TICKETS: readonly TicketSeller[] = [SELLERS.p201(399)]

const DAY = '2026-12-05'
const SETS: readonly [start: string, end: string, artist: string][] = [
  ['17:30', '18:20', '1부'],
  ['18:40', '19:30', 'S2omeday'],
]

export function createMistletoe2026(): Festival {
  return {
    id: MISTLETOE_2026_ID,
    name: 'mistletoe LIVE GIG',
    startDate: DAY,
    endDate: DAY,
    venue: MISTLETOE.venue,
    stages: [{ id: `${KEY}-club`, name: '201P', ...stageLook(MISTLETOE, 'club') }],
    performances: SETS.map(([start, end, artist], index) => ({
      id: `${KEY}-d1-club-${String(index).padStart(2, '0')}`,
      stageId: `${KEY}-club`,
      day: DAY,
      artist,
      start,
      end,
    })),
    pins: MISTLETOE.pins(),
  }
}
