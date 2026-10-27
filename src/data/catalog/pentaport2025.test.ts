import { describe, expect, test } from 'vitest'
import { FestivalSchema } from '../schema'
import { PENTAPORT_2025_ID, PENTAPORT_2025_KEY, PENTAPORT_SERIES } from './ids'
import { PENTAPORT_2025_NOTICES, createPentaport2025 } from './pentaport2025'
import { createPentaport2026 } from './pentaport2026'
import { catalogEntry } from './index'

describe('createPentaport2025', () => {
  const festival = createPentaport2025()
  const stageName = (stageId: string | undefined) => festival.stages.find((s) => s.id === stageId)?.name
  const find = (artist: string) => festival.performances.find((p) => p.artist === artist)
  const isEvent = (id: string) => id.includes('-event-')
  const DAYS = ['2025-08-01', '2025-08-02', '2025-08-03']

  test('is a schema-valid three-day festival at Songdo Moonlight Festival Park', () => {
    expect(FestivalSchema.safeParse(festival).success).toBe(true)
    expect(festival.id).toBe(PENTAPORT_2025_ID)
    expect(festival.name).toBe('2025 인천펜타포트 락 페스티벌')
    expect([festival.startDate, festival.endDate]).toEqual(['2025-08-01', '2025-08-03'])
    expect(festival.venue).toEqual(createPentaport2026().venue)
  })

  test('has the three stages from the official timetable', () => {
    expect(festival.stages.map((s) => s.name)).toEqual(['KB국민카드', 'INCHEON', 'INCHEON AIRPORT'])
  })

  test('lists all 57 slots (58 acts: one slot is HYUKOH & SUNSET ROLLERCOASTER), 19 a day, plus the opening', () => {
    const acts = festival.performances.filter((p) => !isEvent(p.id))
    expect(acts).toHaveLength(57)
    for (const day of DAYS) expect(acts.filter((p) => p.day === day)).toHaveLength(19)
    expect(festival.performances.filter((p) => isEvent(p.id)).map((p) => [p.day, p.artist, p.start])).toEqual([['2025-08-01', '개막식', '21:00']])
  })

  test('places the headliners on the right stage, day, and time', () => {
    expect(find('ASIAN KUNG-FU GENERATION')).toMatchObject({ day: '2025-08-01', start: '21:10', end: '22:30' })
    expect(find('Pulp')).toMatchObject({ day: '2025-08-02', start: '21:00', end: '22:30' })
    expect(find('BECK')).toMatchObject({ day: '2025-08-03', start: '21:00', end: '22:20' })
    expect(stageName(find('BECK')?.stageId)).toBe('KB국민카드')
    expect(stageName(find('크라잉넛')?.stageId)).toBe('INCHEON')
    expect(stageName(find('밀레나')?.stageId)).toBe('INCHEON AIRPORT')
  })

  test('has the replacements of the last week: GLEN CHECK for BEABADOOBEE, 이승윤 for DEAFHEAVEN', () => {
    expect(find('글렌체크')).toMatchObject({ day: '2025-08-02', start: '17:10', end: '18:00' })
    expect(find('이승윤')).toMatchObject({ day: '2025-08-03', start: '17:20', end: '18:10' })
    expect(find('BEABADOOBEE')).toBeUndefined()
    expect(find('DEAFHEAVEN')).toBeUndefined()
  })

  test('keeps sets on one stage from overlapping', () => {
    for (const stage of festival.stages) {
      for (const day of DAYS) {
        const sets = festival.performances.filter((p) => p.stageId === stage.id && p.day === day).sort((a, b) => a.start.localeCompare(b.start))
        sets.slice(1).forEach((set, i) => expect(set.start >= (sets[i]?.end ?? '')).toBe(true))
      }
    }
  })

  test('uses its own yearly code for timetable ids and the festival code for map pins', () => {
    expect(festival.performances.every((p) => p.id.startsWith(`${PENTAPORT_2025_KEY}-`))).toBe(true)
    expect(festival.pins.every((p) => p.id.startsWith(`${PENTAPORT_SERIES}-`))).toBe(true)
  })

  test('is in the catalog with notices from the official posts', () => {
    expect(catalogEntry(PENTAPORT_2025_ID)).toMatchObject({ series: PENTAPORT_SERIES, key: PENTAPORT_2025_KEY })
    expect(PENTAPORT_2025_NOTICES.length).toBeGreaterThan(0)
  })
})
