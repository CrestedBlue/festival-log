import type { Festival } from '../schema'
import { SJF_2026_ID, SJF_2026_KEY as KEY } from './ids'
import { SJF } from './series/sjf'
import { stageLook } from './series/theme'
import { SELLERS, type TicketSeller } from './tickets'

/**
 * 서울재즈페스티벌 2026 (The 18th Seoul Jazz Festival 2026, 2026-05-22 – 05-24, Olympic Park, Seoul).
 * Source: the official site's notice "[The 18th Seoul Jazz Festival 2026] 타임테이블 안내" of 2026-05-12
 * (seouljazz.co.kr notice 235): one image a day. Each block shows its length ("70'") and sits on a 10-minute grid:
 * the end is where the block ends, the start that end less the length. 60 acts, 20 a day, matching the final line-up.
 * Korean acts go by the Korean name the timetable prints under the English one. SJF VILLAGE (classes, Meet & Greet)
 * is not a stage and is left out.
 * Stage and performance ids are fixed (prefixed with the yearly code) so favorites survive updates.
 * The venue, its map pins and the stage colors and icons belong to the festival, not the year: see series/sjf.ts.
 */
export { SJF_2026_ID }

/** Admin notices, summarised from the official site's timetable and festival-map notices (2026). */
export const SJF_2026_NOTICES: readonly string[] = [
  '무대는 4곳이에요: MAY FOREST(88잔디마당), SPARKLING DOME(KSPO DOME), PINK AVENUE(티켓링크 라이브 아레나), SPRING GARDEN(88호수수변무대).',
  'MAY FOREST는 첫날 11:00, 둘째·셋째 날 10:40에 문을 열고, 다른 무대는 11:30에 열어요.',
  'SJF VILLAGE(KSPO DOME 2-1 게이트 앞)에서는 클래스와 아티스트 Meet & Greet가 열려요.',
  '예매는 멜론티켓에서만 해요. 3일권 정가 티켓과 5/23·5/24 1일권은 매진돼 취소표만 살 수 있어요. 자세한 관람 안내는 멜론티켓 상세 페이지에 있어요.',
  '일정은 현장과 아티스트 사정에 따라 바뀔 수 있어요.',
]

/** Official ticket seller: Melon Ticket, linked from the official site's TICKETS menu. */
export const SJF_2026_TICKETS: readonly TicketSeller[] = [SELLERS.melon(212811)]

// Stage colors and icons belong to the festival's design (series/sjf.ts), keyed the same way.
const STAGES = {
  forest: 'MAY FOREST',
  dome: 'SPARKLING DOME',
  avenue: 'PINK AVENUE',
  garden: 'SPRING GARDEN',
} as const

type StageKey = keyof typeof STAGES
type Row = readonly [stage: StageKey, start: string, end: string, artist: string]

const DAY1: readonly Row[] = [
  ['forest', '12:00', '13:10', 'BUENA VISTA ORCHESTRA'],
  ['forest', '14:00', '15:00', 'JENEVIEVE'],
  ['forest', '15:50', '17:00', 'LEISURE'],
  ['forest', '17:55', '19:10', 'TROMBONE SHORTY & ORLEANS AVENUE'],
  ['forest', '20:00', '21:30', 'ARTURO SANDOVAL'],
  ['dome', '13:10', '14:10', '태버'],
  ['dome', '15:00', '16:00', 'KAWASAKI TAKAYA'],
  ['dome', '16:50', '18:10', '씨엔블루'],
  ['dome', '19:00', '20:00', 'D×S (도겸×승관)'],
  ['dome', '21:00', '22:30', 'JANELLE MONÁE'],
  ['avenue', '12:30', '13:30', 'DON WEST'],
  ['avenue', '14:20', '15:20', '더 폴스'],
  ['avenue', '16:20', '17:30', 'EMILY KING'],
  ['avenue', '18:20', '19:30', '장범준'],
  ['avenue', '20:20', '21:30', 'MAMAS GUN'],
  ['garden', '12:00', '13:00', '지바노프'],
  ['garden', '13:40', '14:40', '스텔라따뚜이'],
  ['garden', '15:20', '16:20', 'GALDIVE'],
  ['garden', '17:00', '18:10', 'JOE ARMON-JONES'],
  ['garden', '19:00', '20:10', 'ORIGINAL LOVE & CADEJO'],
]

const DAY2: readonly Row[] = [
  ['forest', '12:00', '13:00', '라틴 키친 루나 with 일레인'],
  ['forest', '13:40', '14:50', 'ALFA MIST'],
  ['forest', '15:40', '17:00', '백예린'],
  ['forest', '17:50', '19:05', 'CORY HENRY & THE FUNK APOSTLES'],
  ['forest', '20:00', '21:30', 'JON BATISTE LIVE'],
  ['dome', '13:10', '14:10', '박찬영'],
  ['dome', '15:10', '16:10', '태용, 해찬'],
  ['dome', '16:50', '18:10', 'PREP'],
  ['dome', '18:55', '20:10', '에픽하이'],
  ['dome', '20:50', '22:20', 'FKJ'],
  ['avenue', '12:30', '13:30', '스텔라장'],
  ['avenue', '14:10', '15:10', 'STACEY RYAN'],
  ['avenue', '15:50', '16:50', 'ANSON SEABRA'],
  ['avenue', '17:40', '18:50', 'PEDER ELIAS'],
  ['avenue', '19:35', '20:50', '최유리'],
  ['garden', '12:00', '13:00', '문미향'],
  ['garden', '13:40', '14:40', 'SM JAZZ TRIO'],
  ['garden', '15:20', '16:20', 'ENJI'],
  ['garden', '17:00', '18:10', '이진아 (JIN AH LEE JAZZ QUARTET)'],
  ['garden', '18:50', '20:00', 'SUMMER SALT'],
]

const DAY3: readonly Row[] = [
  ['forest', '12:00', '13:00', '윤석철 ARTIFACTION (Guest. 음음)'],
  ['forest', '13:50', '15:00', 'CIMAFUNK'],
  ['forest', '15:50', '17:00', 'ELLA MAI'],
  ['forest', '17:50', '19:10', 'MEDESKI MARTIN & WOOD'],
  ['forest', '20:00', '21:30', 'HERBIE HANCOCK'],
  ['dome', '13:00', '14:00', 'Mulasaki Ima'],
  ['dome', '14:50', '16:00', '한로로'],
  ['dome', '16:50', '17:50', '웨이브투어스'],
  ['dome', '18:50', '20:00', '혁오'],
  ['dome', '20:50', '22:20', 'OF MONSTERS AND MEN'],
  ['avenue', '12:30', '13:30', '유라'],
  ['avenue', '14:30', '15:30', 'THEE SACRED SOULS'],
  ['avenue', '16:20', '17:30', '적재'],
  ['avenue', '18:20', '19:20', 'FREE NATIONALS'],
  ['avenue', '20:00', '21:20', '실리카겔'],
  ['garden', '12:00', '13:00', '밀레나'],
  ['garden', '13:40', '14:40', 'TOMONARI SORA'],
  ['garden', '15:20', '16:20', '고상지'],
  ['garden', '17:00', '18:00', 'ARON!'],
  ['garden', '18:50', '20:00', '대니 구'],
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

export function createSjf2026(): Festival {
  return {
    id: SJF_2026_ID,
    name: '서울재즈페스티벌 2026',
    startDate: '2026-05-22',
    endDate: '2026-05-24',
    venue: SJF.venue,
    stages: (Object.keys(STAGES) as StageKey[]).map((key) => ({ id: `${KEY}-${key}`, name: STAGES[key], ...stageLook(SJF, key) })),
    performances: [
      ...toPerformances('2026-05-22', 'd1', DAY1),
      ...toPerformances('2026-05-23', 'd2', DAY2),
      ...toPerformances('2026-05-24', 'd3', DAY3),
    ],
    pins: SJF.pins(),
  }
}
