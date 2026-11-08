import type { Festival } from '../schema'
import { PENTAPORT_2027_ID } from './ids'
import { PENTAPORT } from './series/pentaport'

/**
 * 2027 인천펜타포트 락 페스티벌 (2027-07-30 – 08-01, Songdo Moonlight Festival Park, Incheon).
 * Source: the date was shown on the festival's own screens on the last day of 2026 (8/2), as the user saw there, and
 * Namu Wiki keeps it; no official post has it yet (Instagram @pentaportrf and the official site, checked 2026-11-08).
 * Made at the user's word (2026-11-08) with the timetable and map tabs closed: no line-up, timetable or map yet.
 * The venue and its map pins belong to the festival, not the year: see series/pentaport.ts.
 */
export { PENTAPORT_2027_ID }

/** Admin notices (2027): only the dates are out. */
export const PENTAPORT_2027_NOTICES: readonly string[] = [
  '2026 펜타포트 마지막 날(8/2) 현장 화면에서 2027년 7월 30일(금)–8월 1일(일) 개최를 예고했어요. 공식 글은 아직 없어요.',
  '라인업·티켓·타임테이블·행사장 지도는 아직 발표 전이에요. 나오는 대로 채워요.',
]

export function createPentaport2027(): Festival {
  return {
    id: PENTAPORT_2027_ID,
    name: '2027 인천펜타포트 락 페스티벌',
    startDate: '2027-07-30',
    endDate: '2027-08-01',
    venue: PENTAPORT.venue,
    stages: [],
    performances: [],
    pins: PENTAPORT.pins(),
  }
}
