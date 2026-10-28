import type { Festival } from '../schema'
import { GRAND_MINT_2026_ID, GRAND_MINT_2026_KEY as KEY } from './ids'
import { GRAND_MINT } from './series/grandMint'
import { stageLook } from './series/theme'
import { SELLERS, type TicketSeller } from './tickets'

/**
 * Grand Mint Festival 2026 (2026-10-17/18, Olympic Park, Seoul).
 * Source: official timetable image on the NOL ticket page (nol.yanolja.com/ticket/products/26010721).
 * Headliner sets the timetable leaves open-ended ("20:40 -") use the end time the poster's block suggests.
 * Stage and performance ids are fixed (prefixed with the yearly code) so favorites survive updates.
 * The venue and its map pins belong to the festival, not the year: see series/grandMint.ts.
 */
export { GRAND_MINT_2026_ID }

/**
 * Admin notices, summarised from the NOL ticket page's notices (2026), then the after-festival posts on Instagram
 * (@grandmintfestival: the 10/18 refund post instagram.com/p/Dep0HZQgUC-, the 10/20 lost-and-found post
 * instagram.com/p/Detcyb-h33E).
 */
export const GRAND_MINT_2026_NOTICES: readonly string[] = [
  '모바일 티켓은 관람 전날 NOL 앱에서 발급돼요. 캡처본·사본은 안 되고, 예매자 본인 신분증 원본을 꼭 챙기세요.',
  '티켓 부스는 우선입장 10:50, 일반 11:00에 열려요(이틀 모두).',
  '손목밴드 돌려쓰기를 포함한 양도·재판매는 불법이에요. 적발되면 바로 퇴장돼요.',
  '캠핑형이 아닌 도심형 페스티벌이라, 꼭 필요한 물건만 담은 작은 가방만 들고 들어갈 수 있어요.',
  '우선입장권은 1인 1매이고 별도 부스에서 입장해요. 일행과 같이 들어갈 수 없어요.',
  '10월 18일(일) 공연이 취소됐어요. 그날 유효한 티켓(우선입장권 포함)은 관람 여부와 관계없이 전액 환불돼요. ' +
    '결제 수단별 환불 절차는 공식 인스타의 10/18 환불 안내 카드뉴스를 보세요.',
  '현장 분실물 목록은 민트페이퍼 홈페이지(GMF2026 분실물 공지)에 있어요. 내 물건이 있으면 날짜와 목록 번호, ' +
    '내 물건임을 보여 주는 사진을 공식 인스타 10/20 글에 적힌 메일로 보내요.',
]

/**
 * Official ticket sellers: the NOL ticket page the timetable and notices come from, and the YES24 and Ticketlink pages
 * Mint Paper's link page (linktr.ee/mintpaper) lists with it. The Naver booking it also lists no longer names the
 * festival, so it is left out.
 */
export const GRAND_MINT_2026_TICKETS: readonly TicketSeller[] = [SELLERS.nol(26010721), SELLERS.yes24(59339), SELLERS.ticketlink(64509)]

// Stage colors and icons belong to the festival's design (series/grandMint.ts), keyed the same way.
const STAGES = {
  mint: 'Mint Breeze',
  sunset: 'Club Midnight Sunset',
  forest: 'Loving Forest Garden',
  radar: 'Radar',
} as const

type StageKey = keyof typeof STAGES
type Row = readonly [stage: StageKey, start: string, end: string, artist: string]

const DAY1: readonly Row[] = [
  ['mint', '12:20', '13:00', '연정'],
  ['mint', '13:20', '14:00', '하이파이유니콘'],
  ['mint', '14:20', '15:10', '지소쿠리클럽'],
  ['mint', '15:30', '16:20', '정준일'],
  ['mint', '16:40', '17:30', '적재'],
  ['mint', '17:50', '18:40', '페퍼톤스'],
  ['mint', '19:10', '20:10', '장기하'],
  ['mint', '20:40', '21:40', '이소라'],
  ['sunset', '12:50', '13:20', '퓨처피어클럽'],
  ['sunset', '13:40', '14:20', '리브아워티어스'],
  ['sunset', '14:40', '15:30', '오월오일'],
  ['sunset', '15:50', '16:40', '라쿠나'],
  ['sunset', '17:10', '18:00', '카더가든'],
  ['sunset', '18:30', '19:30', '리도어'],
  ['sunset', '20:00', '21:00', '터치드'],
  ['sunset', '21:30', '22:50', '이승윤'],
  ['forest', '12:40', '13:20', '컨파인드 화이트'],
  ['forest', '13:40', '14:10', '러브이즈사이클'],
  ['forest', '14:30', '15:10', '거니'],
  ['forest', '15:30', '16:20', '수민'],
  ['forest', '16:40', '17:30', '유라'],
  ['forest', '17:50', '18:40', '알레프'],
  ['forest', '19:00', '19:50', '바이 바이 배드맨'],
  ['forest', '20:20', '21:20', '홍이삭'],
  ['radar', '13:40', '14:10', '사인회: 연정'],
  ['radar', '14:40', '15:10', '사인회: 하이파이유니콘'],
  ['radar', '15:20', '16:10', '토크: 지금이 저점매수 (퓨처피어클럽, 러브이즈사이클)'],
  ['radar', '16:20', '16:50', '하이터치&사인회: 오월오일'],
  ['radar', '17:10', '17:40', '사인회: 수민'],
  ['radar', '19:00', '20:00', '십란 공개방송 특별 생중계'],
]

const DAY2: readonly Row[] = [
  ['mint', '12:20', '12:50', '산보'],
  ['mint', '13:10', '13:50', '신인류'],
  ['mint', '14:10', '15:00', '드래곤포니'],
  ['mint', '15:20', '16:10', '볼빨간사춘기'],
  ['mint', '16:30', '17:20', '정승환'],
  ['mint', '17:40', '18:30', '로이킴'],
  ['mint', '19:00', '20:00', '씨엔블루'],
  ['mint', '20:30', '21:30', '윤하'],
  ['sunset', '12:40', '13:10', '과카몰리'],
  ['sunset', '13:30', '14:10', '이오욱 (LOW)'],
  ['sunset', '14:30', '15:20', '원위'],
  ['sunset', '15:40', '16:30', '극동아시아타이거즈'],
  ['sunset', '16:50', '17:40', '솔루션스'],
  ['sunset', '18:00', '18:50', '엔플라잉'],
  ['sunset', '19:20', '20:20', '쏜애플'],
  ['sunset', '20:50', '22:30', '십란 (십센치 X 소란)'],
  ['forest', '12:40', '13:10', '구구'],
  ['forest', '13:30', '14:10', '토카이'],
  ['forest', '14:30', '15:10', '로시'],
  ['forest', '15:30', '16:10', '닙아카이브'],
  ['forest', '16:30', '17:20', '신지훈'],
  ['forest', '17:40', '18:30', '까치산'],
  ['forest', '18:50', '19:40', '선우정아'],
  ['forest', '20:20', '21:20', '이석원'],
  ['radar', '13:30', '14:20', '토크: 지금이 저점매수 (산보, 과카몰리)'],
  ['radar', '14:30', '15:00', '사인회: 신인류'],
  ['radar', '15:10', '16:00', '퍼포먼스: 삐의 등장! 지엠에삐-쇼'],
  ['radar', '16:10', '16:40', '하이터치회: 원위'],
  ['radar', '17:10', '17:40', '사인회: 극동아시아타이거즈'],
  ['radar', '18:00', '18:50', '토크: 라쿠나 복귀 신고합니다'],
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

export function createGrandMint2026(): Festival {
  return {
    id: GRAND_MINT_2026_ID,
    name: '그랜드 민트 페스티벌 2026',
    startDate: '2026-10-17',
    endDate: '2026-10-18',
    venue: GRAND_MINT.venue,
    stages: (Object.keys(STAGES) as StageKey[]).map((key) => ({ id: `${KEY}-${key}`, name: STAGES[key], ...stageLook(GRAND_MINT, key) })),
    performances: [...toPerformances('2026-10-17', 'd1', DAY1), ...toPerformances('2026-10-18', 'd2', DAY2)],
    pins: GRAND_MINT.pins(),
  }
}
