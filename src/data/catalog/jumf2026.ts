import checklist01 from '../../assets/guides/guide-jumf2026-checklist-01.webp'
import checklist02 from '../../assets/guides/guide-jumf2026-checklist-02.webp'
import checklist03 from '../../assets/guides/guide-jumf2026-checklist-03.webp'
import checklist04 from '../../assets/guides/guide-jumf2026-checklist-04.webp'
import checklist05 from '../../assets/guides/guide-jumf2026-checklist-05.webp'
import checklist06 from '../../assets/guides/guide-jumf2026-checklist-06.webp'
import type { Festival } from '../schema'
import type { GuideImage, GuideSet } from './guide'
import { JUMF_2026_ID, JUMF_2026_KEY as KEY } from './ids'
import { JUMF } from './series/jumf'
import { stageLook } from './series/theme'

/**
 * 2026 전주얼티밋뮤직페스티벌 (JUMF, 2026-08-14 – 08-16, Jeonju University artificial-turf fields, Jeonju).
 * Source: the official homepage's notice board (jumf.co.kr/24), "[JUMF 2026] 타임테이블 공개!" of 2026-07-27: one
 * image a day, each with a grid and a list per stage (the list was read; it matches the grid). 60 acts, 20 a day,
 * on three stages. The 18:10–18:20 break on the main stages is not a set and is left out.
 * Stage and performance ids are fixed (prefixed with the yearly code) so favorites survive updates.
 * The venue, its map pins and the stage colors and icons belong to the festival, not the year: see series/jumf.ts.
 */
export { JUMF_2026_ID }

/** Admin notices, summarised from the official notice board (2026: timetable, site map, FAQ posts). */
export const JUMF_2026_NOTICES: readonly string[] = [
  '게이트는 사흘 모두 13:00에 열려요. 티켓부스는 12:00–22:00예요.',
  '마루·너울 스테이지는 인조잔디구장에 나란히 선 야외 무대이고, 숨 스테이지는 실내체육관(쿨존)이에요.',
  '다리 없는 좌식·등받이 의자, 원터치 텐트(그늘막존 안), 30L 이하 보냉가방·아이스박스, 분무형 스프레이는 가져갈 수 있어요. 다리 있는 캠핑 의자, 팩으로 고정하는 텐트, 30L 넘는 아이스박스, 가스충전식 스프레이는 안 돼요.',
  '물품보관소는 13:00부터 공연이 끝나고 30분까지, 3,000원(카드만)이에요. 신분증과 보관증이 필요하고 그날 찾아야 해요(다음 날 찾으면 20,000원).',
  '전주대 안 주차는 무료지만(통제구역 제외) 많이 막혀요. 대중교통을 권해요.',
  '셔틀버스(전주역 ↔ 전주대)는 11:50 전주역 첫차부터 24:00 전주대 막차까지 선착순이에요. 전주대 정류장은 교수연구동 주차장(티켓부스 근처)이고, 돌아가는 차는 전북도청·한옥마을을 거쳐요.',
]

const OFFICIAL = '출처: 전주얼티밋뮤직페스티벌 공식 홈페이지 (2026)'
const page = (src: string, alt: string): GuideImage => ({ src, alt, width: 1080, height: 1350 })

/** Official guide pages, as published ("[JUMF 2026] FAQ_체크리스트" of 2026-08-11). */
export const JUMF_2026_GUIDES: readonly GuideSet[] = [
  {
    title: 'FAQ 체크리스트',
    source: OFFICIAL,
    images: [
      page(checklist01, 'FAQ 체크리스트 안내 (Checklist Information)'),
      page(checklist02, '입장 안내: 티켓부스는 12:00–22:00(메인 게이트 13:00). 현장 판매 1일권 120,000원, 2일권(금/토, 토/일) 174,000원, 3일권 228,000원. 입장할 때 YES24 모바일 티켓과 본인 확인 신분증이 필요하고 예매자 본인만 들어갈 수 있어요'),
      page(checklist03, '입장 안내: 보안검색에서 걸린 물품은 따로 보관하지 않아요(물품보관소에 맡기거나 폐기). 티켓 양도·명의 변경은 안 되고, 대리 예매면 YES24 모바일 티켓·예매자 신분증 사본·실관람객 신분증을 챙겨요. 주민등록증, 여권, 운전면허증, 외국인등록증, 모바일 신분증(캡처본은 안 돼요)'),
      page(checklist04, '입장 안내: 1일권은 그날만, 2·3일권 팔찌는 처음 한 번 받아 계속 차요(분실·훼손 시 재발급 안 돼요). 전 연령 관람 가능, 2020년 이후 출생자는 무료(증빙서류, 보호자 동반). 성인 인증 팔찌는 티켓부스에서 신분증을 보여 주고 받아요. 없으면 술을 살 수 없어요'),
      page(checklist05, '안전·응급·편의: 응급상황은 현장 스태프(점퍼)에게, 온열질환 응급버스·쿨링 수소버스는 사이트맵 참고. 분실물은 종합안내소. 반려동물은 안 돼요(장애인 보조견 제외). 휴대폰 충전은 유료. 군산·익산 셔틀버스는 올해 없어요'),
      page(checklist06, 'MD·무대·방송: 공식 MD 판매·픽업데스크는 12:00–20:00(다 팔리면 일찍 마감). 마루·너울 스테이지는 듀얼 무대이고 돌출무대는 없어요. 올해는 온라인 생중계가 없어요'),
    ],
  },
]

// Shown with both names, as the official notices call them ("마루(MARU) STAGE").
// Stage colors and icons belong to the festival's design (series/jumf.ts), keyed the same way.
const STAGES = {
  maru: 'MARU 마루',
  neoul: 'NEOUL 너울',
  soom: 'SOOM 숨',
} as const

type StageKey = keyof typeof STAGES
type Row = readonly [stage: StageKey, start: string, end: string, artist: string]

const DAY1: readonly Row[] = [
  ['maru', '14:30', '15:00', '하츠웨이브'],
  ['maru', '15:30', '16:10', '나상현씨밴드'],
  ['maru', '16:50', '17:30', '오월오일'],
  ['maru', '18:20', '19:00', 'QWER'],
  ['maru', '19:40', '20:30', '페퍼톤스'],
  ['maru', '21:20', '22:20', 'FLOW'],
  ['neoul', '14:00', '14:30', '다다다'],
  ['neoul', '15:00', '15:30', "can't be blue"],
  ['neoul', '16:10', '16:50', 'ONEWE'],
  ['neoul', '17:30', '18:10', 'SABASISTER'],
  ['neoul', '19:00', '19:40', '숀'],
  ['neoul', '20:30', '21:20', '로맨틱펀치'],
  ['neoul', '22:20', '23:20', '10CM'],
  ['soom', '14:00', '14:30', '송은채'],
  ['soom', '14:50', '15:20', 'NIBUY'],
  ['soom', '15:40', '16:10', 'Tokai'],
  ['soom', '16:30', '17:00', '그리즐리'],
  ['soom', '17:20', '17:50', '로시'],
  ['soom', '18:10', '18:50', '디에이드'],
  ['soom', '19:10', '19:50', 'KAMI WA SAIKORO WO FURANAI'],
]

const DAY2: readonly Row[] = [
  ['maru', '14:30', '15:00', 'D82'],
  ['maru', '15:30', '16:10', '까치산'],
  ['maru', '16:50', '17:30', '레이지본'],
  ['maru', '18:20', '19:00', '브로큰발렌타인'],
  ['maru', '19:50', '20:40', '극동아시아타이거즈'],
  ['maru', '21:30', '22:30', 'NELL'],
  ['neoul', '14:00', '14:30', 'Nyteh'],
  ['neoul', '15:00', '15:30', '천진우'],
  ['neoul', '16:10', '16:50', '윤마치'],
  ['neoul', '17:30', '18:10', '송소희'],
  ['neoul', '19:00', '19:50', 'Redoor'],
  ['neoul', '20:40', '21:30', '국카스텐'],
  ['neoul', '22:30', '23:30', '자우림'],
  ['soom', '14:00', '14:30', 'LIF'],
  ['soom', '14:50', '15:20', '이십사일'],
  ['soom', '15:40', '16:10', '고니'],
  ['soom', '16:30', '17:00', '밴드기린'],
  ['soom', '17:20', '17:50', '와와와'],
  ['soom', '18:10', '18:50', '신빠람 이박사'],
  ['soom', '19:10', '19:50', '블랙홀 X 방수미'],
]

const DAY3: readonly Row[] = [
  ['maru', '14:00', '14:30', 'Synsnake'],
  ['maru', '15:00', '15:30', 'Snake Chicken Soup'],
  ['maru', '16:10', '16:50', 'EMNW'],
  ['maru', '17:30', '18:10', 'Knosis'],
  ['maru', '19:00', '19:50', '너드커넥션'],
  ['maru', '20:40', '21:30', 'IDIOTAPE'],
  ['maru', '22:20', '23:20', 'YB'],
  ['neoul', '14:30', '15:00', '라이엇키즈'],
  ['neoul', '15:30', '16:10', '초록불꽃소년단'],
  ['neoul', '16:50', '17:30', '소닉스톤즈'],
  ['neoul', '18:20', '19:00', '카디'],
  ['neoul', '19:50', '20:40', 'Sable Hills'],
  ['neoul', '21:30', '22:20', '김광진'],
  ['soom', '14:00', '14:30', '우무해'],
  ['soom', '14:50', '15:20', 'BrokenTeeth'],
  ['soom', '15:40', '16:10', '루아멜'],
  ['soom', '16:30', '17:00', '드링킹소년소녀합창단'],
  ['soom', '17:20', '17:50', '타카피'],
  ['soom', '18:10', '18:50', '더 픽스'],
  ['soom', '19:10', '19:50', '스키조'],
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

export function createJumf2026(): Festival {
  return {
    id: JUMF_2026_ID,
    name: '2026 전주얼티밋뮤직페스티벌',
    startDate: '2026-08-14',
    endDate: '2026-08-16',
    venue: JUMF.venue,
    stages: (Object.keys(STAGES) as StageKey[]).map((key) => ({ id: `${KEY}-${key}`, name: STAGES[key], ...stageLook(JUMF, key) })),
    performances: [
      ...toPerformances('2026-08-14', 'd1', DAY1),
      ...toPerformances('2026-08-15', 'd2', DAY2),
      ...toPerformances('2026-08-16', 'd3', DAY3),
    ],
    pins: JUMF.pins(),
  }
}
