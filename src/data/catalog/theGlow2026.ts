import type { Festival } from '../schema'
import { THE_GLOW_2026_ID, THE_GLOW_2026_KEY as KEY } from './ids'
import { THE_GLOW } from './series/theGlow'
import { stageLook } from './series/theme'
import { SELLERS, type TicketSeller } from './tickets'

/**
 * 더 글로우 2026 (THE GLOW 2026, 2026-03-21 – 03-22, KINTEX halls 7, 8, 9 and 10A, Goyang).
 * Source: the official site (theglowseoul.com, read 2026-11-08): the timetable (two images of 2026-02-12, one a day),
 * the full line-up notice (38 acts, the same as the timetable), the festival map, the FAQ and the ticket notices.
 * Three stages in three halls, 19 acts a day. Artists are named as the timetable names them: Korean acts by their
 * Korean names, the others in Latin letters as the line-up notice spells them.
 * Stage and performance ids are fixed (prefixed with the yearly code) so favorites survive updates.
 * The venue, its map pins and the stage colors and icons belong to the festival, not the year: see series/theGlow.ts.
 */
export { THE_GLOW_2026_ID }

/** Admin notices, summarised from the official site's festival map, FAQ, directions and ticket notices (2026). */
export const THE_GLOW_2026_NOTICES: readonly string[] = [
  '물품보관소는 09:00, 손목밴드 부스·MD 부스는 10:00, 게이트(입장)는 11:00에 열려요. 첫 공연은 11:40 STAGE 126이에요.',
  'STAGE 37은 7홀, STAGE 126은 9홀, STAGE X는 10A홀이에요. 1층·2층 게이트로 스테이지 사이를 오갈 수 있는데, STAGE X는 1층으로만 드나들어요.',
  '손목밴드 부스에서 모바일 티켓(앱 화면, 캡처는 안 돼요)과 예매자 본인의 실물 신분증을 보여 주고 손목밴드를 차요. 모바일 신분증은 되고 학생증은 안 돼요. ' +
    '대리 수령은 안 돼요(직계가족만 가족관계증명서와 두 사람의 실물 신분증을 챙기면 돼요).',
  '손목밴드는 관람이 끝날 때까지 차고 있어야 하고(2일권은 이틀 내내), 잃어버리거나 망가지면 다시 주지 않아요. 밴드를 차면 나갔다 다시 들어올 수 있어요.',
  '술을 사려면 손목밴드 부스에서 신분증을 보여 주고 성인인증 손목밴드도 같이 받아요.',
  '전석 스탠딩이고 돗자리·종이의자는 안 돼요. 외부 음식은 안 되고 500ml 이하 페트병 생수만 가져갈 수 있어요(안에 푸드존이 있어요).',
  '물품보관소는 2층 8홀 앞 로비, 09:00–23:00예요. 비닐백 6,000원, 타포린백 9,000원, 캐리어 같은 큰 짐 10,000원이고 카드로만 내요.',
  '공연 촬영·녹음·스트리밍은 안 되고 삼각대·모노포드·플래시는 못 가져가요. 흡연은 킨텍스 전시장 밖 지정 흡연구역에서만 돼요.',
  '휠체어존은 스테이지마다 2층에 있고, 로비 2층의 휠체어존 전용 게이트로 들어가요(동반 1인까지).',
  '오는 길: 킨텍스역(GTX-A) 4·5번 출구, 대화역(3호선) 2번 출구. 버스는 킨텍스 정류장(55, 89, 1100, M7646, M7731)이나 킨텍스 제2전시장 정류장(33-1, 83, 98, 062). ' +
    '유료 셔틀버스는 사전 예매(퀸즈스마일)만 타요. 관람 주차 할인은 없어요.',
  '티켓은 멜론티켓에서 팔았어요(2일권 193,000원, 1일권 121,000원). 모바일 티켓은 관람 전날 멜론티켓 앱 [예매확인]에 떠요.',
]

/** Official ticket sellers, as the official site's TICKET page links them (theglowseoul.com/ticket). */
export const THE_GLOW_2026_TICKETS: readonly TicketSeller[] = [SELLERS.melon(212651)]

// Shown as the timetable names them, hall by hall. Colors and icons belong to the festival's design (series/theGlow.ts).
const STAGES = {
  stage37: 'STAGE 37',
  stage126: 'STAGE 126',
  stageX: 'STAGE X',
} as const

type StageKey = keyof typeof STAGES
type Row = readonly [stage: StageKey, start: string, end: string, artist: string]

// Stage by stage as the timetable lays them out (hall 7, hall 9, hall 10A), each from the top.
const DAY1: readonly Row[] = [
  ['stage37', '12:20', '13:00', '김승주'],
  ['stage37', '13:45', '14:30', '드래곤포니'],
  ['stage37', '15:20', '16:10', '리도어'],
  ['stage37', '17:00', '17:50', '메이트'],
  ['stage37', '18:50', '19:50', '한로로'],
  ['stage37', '20:50', '22:00', '이승윤'],
  ['stage126', '11:40', '12:20', '공원'],
  ['stage126', '13:00', '13:45', 'WIM'],
  ['stage126', '14:30', '15:20', '윤마치'],
  ['stage126', '16:10', '17:00', 'The Walters'],
  ['stage126', '17:50', '18:50', '쏜애플'],
  ['stage126', '19:50', '20:50', '장기하'],
  ['stageX', '12:00', '12:35', '데카당'],
  ['stageX', '13:10', '13:45', '놀이도감'],
  ['stageX', '14:20', '15:00', "The Dinosaur's Skin"],
  ['stageX', '15:35', '16:15', '나상현씨밴드'],
  ['stageX', '16:50', '17:35', '바이바이배드맨'],
  ['stageX', '18:10', '18:55', '지소쿠리클럽'],
  ['stageX', '19:30', '20:20', '솔루션스'],
]

const DAY2: readonly Row[] = [
  ['stage37', '12:20', '13:00', '신인류'],
  ['stage37', '13:45', '14:30', '송소희'],
  ['stage37', '15:20', '16:10', '백현진'],
  ['stage37', '17:00', '17:50', '데이먼스 이어'],
  ['stage37', '18:50', '19:50', '새소년'],
  ['stage37', '20:50', '22:00', '혁오'],
  ['stage126', '11:40', '12:20', '고고학'],
  ['stage126', '13:00', '13:45', '까치산'],
  ['stage126', '14:30', '15:20', 'Kiro Akiyama'],
  ['stage126', '16:10', '17:00', 'grentperez'],
  ['stage126', '17:50', '18:50', '터치드'],
  ['stage126', '19:50', '20:50', '이찬혁'],
  ['stageX', '12:00', '12:35', '이십사일'],
  ['stageX', '13:10', '13:45', '제미나이'],
  ['stageX', '14:20', '15:00', '유라'],
  ['stageX', '15:35', '16:15', 'HOME'],
  ['stageX', '16:50', '17:35', '봉제인간'],
  ['stageX', '18:10', '18:55', 'Cafuné'],
  ['stageX', '19:30', '20:20', '바밍타이거'],
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

export function createTheGlow2026(): Festival {
  return {
    id: THE_GLOW_2026_ID,
    name: '더 글로우 2026',
    startDate: '2026-03-21',
    endDate: '2026-03-22',
    venue: THE_GLOW.venue,
    stages: (Object.keys(STAGES) as StageKey[]).map((key) => ({ id: `${KEY}-${key}`, name: STAGES[key], ...stageLook(THE_GLOW, key) })),
    performances: [...toPerformances('2026-03-21', 'd1', DAY1), ...toPerformances('2026-03-22', 'd2', DAY2)],
    pins: THE_GLOW.pins(),
  }
}
