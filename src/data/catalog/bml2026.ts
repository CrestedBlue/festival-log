import notice01 from '../../assets/guides/guide-bml2026-notice-01.webp'
import notice02 from '../../assets/guides/guide-bml2026-notice-02.webp'
import type { Festival } from '../schema'
import type { GuideImage, GuideSet } from './guide'
import { BML_2026_ID, BML_2026_KEY as KEY } from './ids'
import { BML } from './series/bml'
import { stageLook } from './series/theme'
import { SELLERS, type TicketSeller } from './tickets'

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
  '우선입장권 티켓 부스는 10:00, 티켓 부스는 10:10, 인포메이션 부스(현장 판매)는 10:40에 열려요. 무대마다 문 여는 시간은 타임테이블에 있어요.',
  '모바일 티켓은 관람 전날 저녁 8시에 예매처 앱에서 발급돼요. 캡처본·사본은 안 되고, 예매자 본인 신분증 원본을 꼭 챙기세요. 네이버 예약은 [마이] › [예약]에서 확인해요.',
  '대리 수령은 직계 가족 아이디로 예매한 경우만 돼요(가족관계 증명 서류 필요). 2매를 샀다면 동행인과 함께 티켓 부스에 가야 해요.',
  '손목밴드를 차야 입장 줄을 설 수 있어요. 잃어버리거나 망가지면 다시 주지 않아요. 손목밴드 돌려쓰기를 포함한 양도·재판매는 불법이에요.',
  'Mint Breeze Stage(문화마당)는 스탠딩 존과 앉아서 보는 레저 존(1인용 매트 권장), Loving Forest Garden(T2 야외 무대)은 앉아서 보는 무대, ' +
    'Flood in the Cave(T2 실내 공연장)는 스탠딩이에요. 사람이 많으면 무대 입장이 제한될 수 있어요.',
  '재사용 용기에 담은 음식과 500ml 이하 페트병 물·음료만 가져갈 수 있어요(병·캔·주류·외부 포장 음식은 안 돼요). 스탠딩 존과 실내 공연장에는 뚜껑 있는 500ml 이하 생수만 돼요.',
  '텐트, 다리 있는 의자, 장우산, 바퀴 달린 물건(휠체어·유모차는 돼요), 전문 촬영·녹음 장비는 가져갈 수 없어요. 큰 가방은 물품보관소에 맡기세요.',
  '자리 맡기는 안 돼요. 무대마다 마지막 공연이 끝나고 15분이 지나면 남은 물건은 모두 버려져요.',
  '미취학 아동(2020년 1월 1일 이후 출생)은 보호자와 함께면 무료예요(증빙 서류 필요). 프리 워터존이 있으니 텀블러를 챙기세요.',
]

/** Official ticket sellers, as the ticket notice names and links them (NOL ticket, YES24, Naver booking). */
export const BML_2026_TICKETS: readonly TicketSeller[] = [SELLERS.nol(26002268), SELLERS.yes24(57200), SELLERS.naver(1597631, 7439479)]

const OFFICIAL = '출처: 민트페이퍼 공식 홈페이지 BML2026 공지 (2026)'
const page = (src: string, alt: string): GuideImage => ({ src, alt, width: 1080, height: 1350 })

/** The two notice pages of the timetable post (2026-04-30), as published. */
export const BML_2026_GUIDES: readonly GuideSet[] = [
  {
    title: '안내 사항',
    source: OFFICIAL,
    images: [
      page(
        notice01,
        '우선입장권 티켓 부스 10:00, 티켓 부스 10:10, 인포메이션 부스(현장 판매) 10:40 오픈. 손목밴드는 분실·훼손 시 재발급 불가, 손목밴드를 차야 입장 줄을 설 수 있음. ' +
          '양도·재판매 금지. 우선입장권 관객은 서브 게이트로 먼저 입장. 작은 가방만 반입, 큰 짐은 물품보관소. Mint Breeze Stage 레저 존은 1인용 매트 권장. 자리 맡기 금지',
      ),
      page(
        notice02,
        '무대별 마지막 공연 종료 15분 후 남은 물품은 폐기. 재사용 용기 음식물과 500mL 이하 PET 물·음료만 반입(스탠딩 존·실내 공연장은 생수만). 프리 워터존 운영, 텀블러 지참. ' +
          '무대별 입장 제한 가능. 의료 부스 운영. 다회용기 반납. 민트문화체육센터는 T2 인근, 수강신청 11:30부터 선착순 1인 1강좌. 분실물은 인포메이션 부스',
      ),
    ],
  },
]

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
