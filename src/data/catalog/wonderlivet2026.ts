import type { Festival } from '../schema'
import type { GuideSet } from './guide'
import { WONDERLIVET_2026_ID, WONDERLIVET_2026_KEY as KEY } from './ids'
import { WONDERLIVET } from './series/wonderlivet'
import { stageLook } from './series/theme'

/**
 * 원더리벳 2026 (WONDERLIVET 2026, 2026-11-20 – 11-22, KINTEX halls 7–10, Goyang).
 * Source: the official timetable post on Instagram (@wonderlivet, 2026-09-29): one slide with all three days and one
 * slide a day (the same sets). 42 acts, 14 a day (the full line-up post of 2026-08-27 lists the same 42, and the
 * official link page says 42), on two stages that take turns back to back from 12:00. The last set of each day is
 * drawn as "21:00 – 22:00+" (it may run over); it is kept as 22:00.
 * Stage and performance ids are fixed (prefixed with the yearly code) so favorites survive updates.
 * The venue, its map pins and the stage colors and icons belong to the festival, not the year: see series/wonderlivet.ts.
 */
export { WONDERLIVET_2026_ID }

/** Admin notices, summarised from the timetable post and the official site's FAQ and directions (wonderli.vet). */
export const WONDERLIVET_2026_NOTICES: readonly string[] = [
  '손목밴드 부스는 10:00에 열고(그날 마지막 공연이 끝날 때까지), 메인 게이트는 11:00에 열려요. 첫 공연은 12:00예요.',
  '손목밴드 부스에서 모바일 티켓(앱 화면, 캡처는 안 돼요)과 예매자 본인의 실물 신분증을 보여 주고 밴드를 차요. 대리 수령은 안 되고, 동행인과 함께 가야 해요.',
  '밴드를 차면 무대 사이를 오가고 다시 들어올 수 있어요. 2·3일권 밴드는 마지막 날까지 계속 차고 있어야 하고, 잃어버리거나 망가지면 다시 주지 않아요.',
  '전석 스탠딩이에요. 외부 음식은 안 되고 500ml 이하 페트병 생수만 가져갈 수 있어요(안에 푸드존이 있어요).',
  '공연 촬영·녹음은 안 돼요. 몇몇 아티스트는 공연 내내 모든 촬영(기념사진 포함)이 금지돼요.',
  '흡연은 킨텍스 전시장 밖 지정 흡연구역에서만 돼요. 물품보관소는 공연장 안에 생길 예정이에요.',
  '오는 길: 킨텍스역(GTX-A) 4·5번 출구, 대화역(3호선) 2번 출구에서 버스나 걸어서, 버스는 킨텍스·킨텍스 제2전시장 정류장. 차는 내비에 "킨텍스 제2전시장"(관람 주차 할인 없음).',
  '현장 판매는 예매가 끝난 뒤 남은 표만, 관람 당일 10:30부터 해요(진행 여부는 공식 SNS에서 공지). 예매·취소 마감은 관람 전날 11:00예요.',
]

/** No official guide pages yet: the FAQ is text (in the notices); the festival map is still to come. */
export const WONDERLIVET_2026_GUIDES: readonly GuideSet[] = []

// Shown as the timetable names them. Colors and icons belong to the festival's design (series/wonderlivet.ts).
const STAGES = {
  wonder: 'WONDER STAGE',
  livet: 'LIVET STAGE',
} as const

type StageKey = keyof typeof STAGES
type Row = readonly [stage: StageKey, start: string, end: string, artist: string]

// In the timetable's order: the two stages take turns (LIVET opens the day).
const DAY1: readonly Row[] = [
  ['livet', '12:00', '12:30', 'A I W E O'],
  ['wonder', '12:30', '13:00', 'nishina'],
  ['livet', '13:00', '13:35', 'Conton Candy'],
  ['wonder', '13:35', '14:10', 'jo0ji'],
  ['livet', '14:10', '14:50', 'CLAN QUEEN'],
  ['wonder', '14:50', '15:30', 'SONG SOHEE'],
  ['livet', '15:30', '16:10', 'ReoNa'],
  ['wonder', '16:10', '16:50', 'Da-iCE'],
  ['livet', '16:50', '17:35', 'IDIOTAPE'],
  ['wonder', '17:35', '18:20', 'amazarashi'],
  ['livet', '18:20', '19:10', 'THORNAPPLE'],
  ['wonder', '19:10', '20:00', 'Hoshimachi Suisei'],
  ['livet', '20:00', '21:00', 'natori'],
  ['wonder', '21:00', '22:00', 'THE ORAL CIGARETTES'],
]

const DAY2: readonly Row[] = [
  ['livet', '12:00', '12:30', 'The Shepherd Bois'],
  ['wonder', '12:30', '13:00', 'Midnight Grand Orchestra'],
  ['livet', '13:00', '13:35', 'TAK with Hatsune Miku & Kasane Teto'],
  ['wonder', '13:35', '14:10', 'MyGO!!!!!'],
  ['livet', '14:10', '14:50', 'Tani Yuuki'],
  ['wonder', '14:50', '15:30', 'yama'],
  ['livet', '15:30', '16:10', 'CHiCO with HoneyWorks'],
  ['wonder', '16:10', '16:50', 'Roselia'],
  ['livet', '16:50', '17:35', 'indigo la End'],
  ['wonder', '17:35', '18:20', 'Kyary Pamyu Pamyu'],
  ['livet', '18:20', '19:10', 'FREDERIC'],
  ['wonder', '19:10', '20:00', 'HANRORO'],
  ['livet', '20:00', '21:00', 'SAMBOMASTER'],
  ['wonder', '21:00', '22:00', '[Alexandros]'],
]

const DAY3: readonly Row[] = [
  ['livet', '12:00', '12:30', 'Tomatomat'],
  ['wonder', '12:30', '13:00', 'KUROMI'],
  ['livet', '13:00', '13:35', 'BRANDY SENKI'],
  ['wonder', '13:35', '14:10', 'eill'],
  ['livet', '14:10', '14:50', 'SWEET STEADY'],
  ['wonder', '14:50', '15:30', 'QWER'],
  ['livet', '15:30', '16:10', 'Chevon'],
  ['wonder', '16:10', '16:50', 'CANDY TUNE'],
  ['livet', '16:50', '17:35', 'MRCH'],
  ['wonder', '17:35', '18:20', 'HUMBREADERS'],
  ['livet', '18:20', '19:10', 'Ai Otsuka'],
  ['wonder', '19:10', '20:00', 'NELL'],
  ['livet', '20:00', '21:00', 'SUKIMASWITCH'],
  ['wonder', '21:00', '22:00', 'YUZU'],
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

export function createWonderlivet2026(): Festival {
  return {
    id: WONDERLIVET_2026_ID,
    name: '원더리벳 2026',
    startDate: '2026-11-20',
    endDate: '2026-11-22',
    venue: WONDERLIVET.venue,
    stages: (Object.keys(STAGES) as StageKey[]).map((key) => ({ id: `${KEY}-${key}`, name: STAGES[key], ...stageLook(WONDERLIVET, key) })),
    performances: [
      ...toPerformances('2026-11-20', 'd1', DAY1),
      ...toPerformances('2026-11-21', 'd2', DAY2),
      ...toPerformances('2026-11-22', 'd3', DAY3),
    ],
    pins: WONDERLIVET.pins(),
  }
}
