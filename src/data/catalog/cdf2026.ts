import lineup1 from '../../assets/lineups/cdf2026-1.webp'
import type { Festival } from '../schema'
import { CDF_2026_ID } from './ids'
import type { LineupImage } from './lineup'
import { CDF } from './series/cdf'
import { SELLERS, type TicketSeller } from './tickets'

/**
 * 카운트다운 판타지 2026-2027 (COUNTDOWN FANTASY 2026-2027, 2026-12-31 13:30 – 2027-01-01 05:00, KINTEX halls 7–8).
 * Source: the official Instagram (@countdownfantasy): the first line-up post (2026-10-06), the ticket posts
 * (10-12, 10-13) and the show-times post (10-21); the notices on the NOL ticket page (nol.yanolja.com/ticket/products/26014568).
 * One day on the official posts ("12월 31일 단 하루") though it runs past midnight, so it starts and ends on 12-31.
 * The line-up is out but the timetable is not, so there are no stages or performances yet (three stages are announced).
 * The venue and its map pins belong to the festival, not the year: see series/cdf.ts.
 */
export { CDF_2026_ID }

/** Admin notices, summarised from the official Instagram posts and the NOL ticket page (2026). */
export const CDF_2026_NOTICES: readonly string[] = [
  '12월 31일(목) 하루, 13:30부터 다음 날 1월 1일 새벽 5:00까지 이어져요. 무대는 3개예요.',
  '티켓부스 여는 시간과 공연 시간은 나중에 나오는 타임테이블에서 안내돼요. 2차 라인업은 11월 3일(화)에 발표돼요.',
  '1일권 121,000원이고 1인 2매까지예요. 예매는 12월 30일(수) 오후 5시에 마감돼요.',
  '모바일 티켓은 관람 전날 예매처 앱에서 발급돼요. 캡처본·사본은 안 되고, 예매자 본인 신분증 원본을 꼭 챙기세요.',
  '밤샘 대기를 막으려고 우선입장권을 NOL에서만 따로 팔 예정이에요. NOL에서 공연 티켓을 산 사람만 1인 1매 살 수 있고, ' +
    '우선입장은 따로 마련된 티켓부스로 들어가서 일행과 같이 들어갈 수 없어요. 우선입장권을 살 거라면 공연 티켓은 NOL에서 1매만 사세요.',
  '손목밴드 돌려쓰기를 포함한 양도·재판매는 불법이에요. 적발되면 바로 퇴장돼요.',
  '큰 가방이나 짐이 많으면 입장이 제한돼요. 꼭 필요한 것만 작은 가방에 챙기세요.',
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
