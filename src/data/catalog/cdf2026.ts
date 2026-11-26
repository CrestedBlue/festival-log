import lineup1 from '../../assets/lineups/cdf2026-1.webp'
import lineup2 from '../../assets/lineups/cdf2026-2.webp'
import type { Festival } from '../schema'
import { CDF_2026_ID } from './ids'
import type { LineupImage } from './lineup'
import { CDF } from './series/cdf'
import { SELLERS, type TicketSeller } from './tickets'
import { noticeBlock } from './noticeArt'
import type { NoticeBlock } from './noticeBlock'

/**
 * 카운트다운 판타지 2026-2027 (COUNTDOWN FANTASY 2026-2027, 2026-12-31 13:30 – 2027-01-01 05:00, KINTEX halls 6–9).
 * Source: the official Instagram (@countdownfantasy): the first line-up post (2026-10-06), the second (2026-11-03), the ticket posts
 * (10-12, 10-13), the show-times post (10-21) and the priority-entry ticket post (11-26); the notices on the NOL ticket page (nol.yanolja.com/ticket/products/26014568).
 * One day on the official posts ("12월 31일 단 하루") though it runs past midnight, so it starts and ends on 12-31.
 * The line-up is out but the timetable is not, so there are no stages or performances yet (three stages are announced).
 * The venue and its map pins belong to the festival, not the year: see series/cdf.ts.
 */
export { CDF_2026_ID }

/** Admin notices, summarised from the official Instagram posts and the NOL ticket page (2026). */
export const CDF_2026_NOTICES: readonly string[] = [
  '12월 31일(목) 하루, 13:30부터 다음 날 1월 1일 새벽 5:00까지 이어져요. 무대는 3개예요.',
  '최종 라인업은 12월 1일(화)에 발표돼요.',
]

/** The notices as topic blocks on the info tab (the user, 2026-11-26: every festival in this format). The pictures are the shared set. */
export const CDF_2026_NOTICE_BLOCKS: readonly NoticeBlock[] = [
  noticeBlock('entry', '입장', [
    '**입장** 티켓부스·공연 시간은 타임테이블과 함께 안내',
    '모바일 티켓 관람 전날 예매처 앱에서',
    '**캡처·사본 불가** · **본인 신분증 원본**',
    '우선입장은 **별도 티켓부스** · **일행 동반입장 불가**',
    '손목밴드 양도·재판매 **불법**, 적발 시 **즉시 퇴장**',
    '큰 가방·짐이 많으면 **입장 제한** · 작은 가방만',
  ]),
  noticeBlock('booking', '예매', [
    '**예매** 1일권 **121,000원** · 1인 **2매**까지',
    '예매 마감 **12/30(수) 17:00**',
    '우선입장권은 **NOL에서만** · 1인 **1매**',
    'NOL 공연 티켓 구매자만 구매 가능',
    '우선입장권 살 거면 공연 티켓은 NOL에서 **1매만**',
    '우선입장권 오픈 **12/2(수) 18:00** · **22,000원**',
    '우선입장권 2종 **VIVID PLANET 27**(8홀) · **STATION STARDUST**(9홀)',
  ]),
]

/** Official ticket sellers, in the order the official posts and Mint Paper's link page (linktr.ee/mintpaper) list them. */
export const CDF_2026_TICKETS: readonly TicketSeller[] = [SELLERS.nol(26014568), SELLERS.yes24(60590), SELLERS.naver(1754451, 8124828), SELLERS.twoTm(10888)]

/** Official line-up posters in the order they were announced (add each new one at the end). */
export const CDF_2026_LINEUP: readonly LineupImage[] = [
  {
    src: lineup1,
    label: '1차 라인업',
    alt:
      '카운트다운 판타지 2026-2027 1차 라인업 포스터: 극동아시아타이거즈, LOW HIGH LOW, THE SOLUTIONS, 실리카겔, AxMxP, ' +
      'FTISLAND, OYSTERS, ONEWE, IDIOTAPE, KARDI, 포져군단, 혁오 외. 2026년 12월 31일, 킨텍스 7·8홀',
    width: 700,
    height: 875,
  },
  {
    src: lineup2,
    label: '2차 라인업',
    alt:
      '카운트다운 판타지 2026-2027 2차 라인업 포스터: 극동아시아타이거즈, 까치산, Dragon Pony, Lacuna, LOW HIGH LOW, Redoor, ' +
      'THE SOLUTIONS, 실리카겔, CNBLUE, AxMxP, FTISLAND, OYSTERS, ONEWE, IDIOTAPE, 지소쿠리클럽, KARDI, 캔트비블루, 터치드, ' +
      '포져군단, 혁오 외. 2026년 12월 31일, 킨텍스 7·8홀. 최종 라인업은 12월 1일 발표',
    width: 700,
    height: 875,
  },
]

export function createCdf2026(): Festival {
  return {
    id: CDF_2026_ID,
    name: '카운트다운 판타지 2026-2027',
    startDate: '2026-12-31',
    endDate: '2026-12-31',
    venue: CDF.venue,
    stages: [],
    performances: [],
    pins: CDF.pins(),
  }
}
