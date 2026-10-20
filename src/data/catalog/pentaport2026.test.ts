import { describe, expect, test } from 'vitest'
import { FestivalSchema } from '../schema'
import { PENTAPORT_2026_ID, PENTAPORT_2026_KEY, PENTAPORT_SERIES } from './ids'
import { PENTAPORT_2026_NOTICES, createPentaport2026 } from './pentaport2026'

describe('createPentaport2026', () => {
  const festival = createPentaport2026()
  const stageName = (stageId: string | undefined) => festival.stages.find((s) => s.id === stageId)?.name
  const find = (artist: string) => festival.performances.find((p) => p.artist === artist)
  const isEvent = (id: string) => id.includes('-event-')

  test('is a schema-valid three-day festival at Songdo Moonlight Festival Park', () => {
    expect(FestivalSchema.safeParse(festival).success).toBe(true)
    expect(festival.id).toBe(PENTAPORT_2026_ID)
    expect(festival.name).toBe('2026 인천펜타포트 락 페스티벌')
    expect([festival.startDate, festival.endDate]).toEqual(['2026-07-31', '2026-08-02'])
    expect(festival.venue.name).toBe('송도달빛축제공원')
  })

  test('has the three stages from the official timetable', () => {
    expect(festival.stages.map((s) => s.name)).toEqual(['KB국민카드', 'MONSTER ENERGY', 'STANLEY 1913'])
  })

  test('lists all 66 acts, 22 a day, plus the stage events', () => {
    const acts = festival.performances.filter((p) => !isEvent(p.id))
    expect(acts).toHaveLength(66)
    for (const day of ['2026-07-31', '2026-08-01', '2026-08-02']) expect(acts.filter((p) => p.day === day)).toHaveLength(22)
    expect(festival.performances.filter((p) => isEvent(p.id)).map((p) => p.artist)).toEqual([
      '개막 행사',
      '스탠리와 함께하는 펜타로빅 with 김혜선',
      '스탠리와 함께하는 펜타로빅 with 김혜선',
      '스탠리와 함께하는 펜타로빅 with 김혜선',
    ])
  })

  test('places the headliners on the right stage, day, and time', () => {
    expect(find('KHRUANGBIN')).toMatchObject({ day: '2026-07-31', start: '21:10', end: '22:30' })
    expect(find('MASSIVE ATTACK')).toMatchObject({ day: '2026-08-01', start: '21:10', end: '22:40' })
    expect(find('PIXIES')).toMatchObject({ day: '2026-08-02', start: '21:10', end: '22:40' })
    expect(stageName(find('PIXIES')?.stageId)).toBe('KB국민카드')
    expect(find('The Jesus and Mary Chain')).toMatchObject({ day: '2026-08-01', start: '20:00', end: '21:00' })
    expect(stageName(find('The Jesus and Mary Chain')?.stageId)).toBe('MONSTER ENERGY')
    expect(stageName(find('이날치')?.stageId)).toBe('STANLEY 1913')
  })

  test('keeps sets on one stage from overlapping', () => {
    for (const stage of festival.stages) {
      for (const day of ['2026-07-31', '2026-08-01', '2026-08-02']) {
        const sets = festival.performances.filter((p) => p.stageId === stage.id && p.day === day).sort((a, b) => a.start.localeCompare(b.start))
        sets.slice(1).forEach((set, i) => expect(set.start >= (sets[i]?.end ?? '')).toBe(true))
      }
    }
  })

  test('uses the yearly code for timetable ids and the festival code for map pins', () => {
    expect(festival.performances.every((p) => p.id.startsWith(`${PENTAPORT_2026_KEY}-`))).toBe(true)
    expect(festival.pins.every((p) => p.id.startsWith(`${PENTAPORT_SERIES}-`))).toBe(true)
    expect(festival.pins.map((p) => p.name)).toEqual(['송도달빛축제공원 · 행사장', '송도달빛축제공원역 4번 출구 (인천 1호선)'])
  })

  test('has notices from the timetable post', () => {
    expect(PENTAPORT_2026_NOTICES.length).toBeGreaterThan(0)
  })
})
