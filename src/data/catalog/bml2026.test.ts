import { describe, expect, test } from 'vitest'
import { FestivalSchema } from '../schema'
import { BML_2026_GUIDES, BML_2026_NOTICES, BML_2026_TICKETS, createBml2026 } from './bml2026'
import { BML_2026_ID, BML_2026_KEY, BML_SERIES } from './ids'
import { catalogEntry } from './index'

describe('createBml2026', () => {
  const festival = createBml2026()
  const stageName = (stageId: string | undefined) => festival.stages.find((s) => s.id === stageId)?.name
  const find = (artist: string) => festival.performances.find((p) => p.artist === artist)
  const DAYS = ['2026-05-30', '2026-05-31']

  test('is a schema-valid two-day festival at the Oil Tank Culture Park', () => {
    expect(FestivalSchema.safeParse(festival).success).toBe(true)
    expect(festival.id).toBe(BML_2026_ID)
    expect(festival.name).toBe('뷰티풀 민트 라이프 2026')
    expect([festival.startDate, festival.endDate]).toEqual(DAYS)
    expect(festival.venue.name).toBe('문화비축기지')
  })

  test('has the four stages of the official timetable', () => {
    expect(festival.stages.map((s) => s.name)).toEqual(['Mint Stage', 'Breeze Stage', 'Loving Forest Garden', 'Flood in the Cave'])
  })

  test('lists the 48 acts of the final line-up, 24 a day', () => {
    expect(festival.performances).toHaveLength(48)
    for (const day of DAYS) expect(festival.performances.filter((p) => p.day === day)).toHaveLength(24)
  })

  test('places acts on the right stage, day and time', () => {
    expect(find('AxMxP')).toMatchObject({ day: '2026-05-30', start: '12:00', end: '12:40' })
    expect(stageName(find('AxMxP')?.stageId)).toBe('Breeze Stage')
    expect(find('정승환')).toMatchObject({ day: '2026-05-30', start: '16:10', end: '17:00' })
    expect(stageName(find('정승환')?.stageId)).toBe('Mint Stage')
    expect(stageName(find('Tuesday Beach Club')?.stageId)).toBe('Flood in the Cave')
    expect(find('장기하')).toMatchObject({ day: '2026-05-31', start: '18:10', end: '19:00' })
    expect(stageName(find('알레프')?.stageId)).toBe('Loving Forest Garden')
  })

  test('ends the last sets, which the timetable leaves open-ended, where their blocks end', () => {
    expect([find('LUCY'), find('N.Flying'), find('하동균'), find('다섯')].map((p) => p?.end)).toEqual(['21:00', '20:00', '20:30', '19:50'])
    expect([find('원필'), find('AKMU'), find('옥상달빛'), find('KARDI')].map((p) => p?.end)).toEqual(['20:00', '21:00', '20:30', '19:50'])
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
    expect(festival.performances.every((p) => p.id.startsWith(`${BML_2026_KEY}-`))).toBe(true)
    expect(festival.pins.length).toBeGreaterThan(0)
    expect(festival.pins.every((p) => p.id.startsWith(`${BML_SERIES}-`))).toBe(true)
  })

  test('has notices, the two official notice pages and the three ticket sellers', () => {
    expect(BML_2026_NOTICES.length).toBeGreaterThan(0)
    expect(BML_2026_GUIDES.map((g) => [g.title, g.images.length])).toEqual([['안내 사항', 2]])
    expect(BML_2026_TICKETS.map((s) => s.name)).toEqual(['NOL 티켓', 'YES24', '네이버 예약'])
    expect(catalogEntry(BML_2026_ID)).toMatchObject({ series: BML_SERIES, key: BML_2026_KEY })
  })
})
