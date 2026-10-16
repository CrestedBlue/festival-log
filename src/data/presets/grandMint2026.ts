import { festivalMapFor } from '../../features/map/festivalMaps'
import type { Festival, Pin } from '../schema'

/**
 * Grand Mint Festival 2026 (2026-10-17/18, Olympic Park, Seoul).
 * Source: official timetable image on the NOL ticket page (nol.yanolja.com/ticket/products/26010721).
 * Headliner sets the timetable leaves open-ended ("20:40 -") use the end time the poster's block suggests.
 * Ids are fixed so adding the preset again replaces it and keeps everyone's favorites.
 */
export const GRAND_MINT_2026_ID = 'gmf2026'

const STAGES = {
  mint: { name: 'Mint Breeze', color: '#1f9e89' },
  sunset: { name: 'Club Midnight Sunset', color: '#ff5a3c' },
  forest: { name: 'Loving Forest Garden', color: '#ec4899' },
  radar: { name: 'Radar', color: '#8a8f3c' },
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

// Pins sit on the bundled festival map (scripts/map/build-gmf2026.mjs): stage art is placed on surveyed
// OpenStreetMap footprints, "(대략)" zones follow the official map's layout, exits are OSM subway entrances.
const anchor = (key: string): { lat: number; lng: number } => {
  const point = festivalMapFor(GRAND_MINT_2026_ID)?.anchors[key]
  if (!point) throw new Error(`GMF 2026 map has no anchor "${key}"`)
  return { lat: point[0], lng: point[1] }
}

const PINS: ReadonlyArray<Omit<Pin, 'id'>> = [
  { name: 'Mint Breeze · 88잔디마당', kind: 'stage', ...anchor('mintBreezeStage') },
  { name: 'Club Midnight Sunset · KSPO DOME', kind: 'stage', ...anchor('clubMidnightStage') },
  { name: 'Loving Forest Garden · 88호수 수변무대', kind: 'stage', ...anchor('lovingForestStage') },
  { name: 'Radar · 체조경기장–수영장 사이 (대략)', kind: 'etc', ...anchor('radar') },
  { name: 'Hungry Zone · 체조경기장–수영장 사이 (대략)', kind: 'food', ...anchor('hungryZoneEast') },
  { name: 'Hungry Zone · 88잔디마당 안 (대략)', kind: 'food', ...anchor('hungryZoneLawn') },
  { name: 'Art Zone · 한얼광장 (대략)', kind: 'etc', ...anchor('artZone') },
  { name: '티켓 부스 (대략)', kind: 'etc', ...anchor('ticketBooth') },
  { name: '올림픽공원역 3번 출구 (5·9호선)', kind: 'etc', ...anchor('olympicParkExit3') },
  { name: '몽촌토성역 1번 출구 (8호선)', kind: 'etc', ...anchor('mongchonExit1') },
]

const toPerformances = (day: string, dayKey: string, rows: readonly Row[]) =>
  rows.map(([stage, start, end, artist], index) => ({
    id: `${GRAND_MINT_2026_ID}-${dayKey}-${stage}-${String(index).padStart(2, '0')}`,
    stageId: `${GRAND_MINT_2026_ID}-${stage}`,
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
    venue: { name: '올림픽공원', lat: 37.5195, lng: 127.1265 },
    stages: (Object.keys(STAGES) as StageKey[]).map((key) => ({ id: `${GRAND_MINT_2026_ID}-${key}`, ...STAGES[key] })),
    performances: [...toPerformances('2026-10-17', 'd1', DAY1), ...toPerformances('2026-10-18', 'd2', DAY2)],
    pins: PINS.map((pin, index) => ({ id: `${GRAND_MINT_2026_ID}-pin-${index}`, ...pin })),
  }
}
