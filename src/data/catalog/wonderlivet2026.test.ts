import { describe, expect, test } from 'vitest'
import { FestivalSchema } from '../schema'
import { WONDERLIVET_2026_ID, WONDERLIVET_2026_KEY, WONDERLIVET_SERIES } from './ids'
import { WONDERLIVET_2026_NOTICES, createWonderlivet2026 } from './wonderlivet2026'
import { catalogEntry, festivalMapFor } from './index'
import { SERIES } from './series'

const DAYS = ['2026-11-20', '2026-11-21', '2026-11-22']

describe('createWonderlivet2026', () => {
  const festival = createWonderlivet2026()
  const stageName = (stageId: string | undefined) => festival.stages.find((s) => s.id === stageId)?.name
  const find = (artist: string) => festival.performances.find((p) => p.artist === artist)

  test('is a schema-valid three-day festival at KINTEX', () => {
    expect(FestivalSchema.safeParse(festival).success).toBe(true)
    expect(festival.id).toBe(WONDERLIVET_2026_ID)
    expect(festival.name).toBe('원더리벳 2026')
    expect([festival.startDate, festival.endDate]).toEqual(['2026-11-20', '2026-11-22'])
    expect(festival.venue.name).toBe('킨텍스 제2전시장 7–10홀')
  })

  test('has the two stages from the official timetable', () => {
    expect(festival.stages.map((s) => s.name)).toEqual(['WONDER STAGE', 'LIVET STAGE'])
  })

  test('lists all 42 acts, 14 a day, taking turns on the two stages', () => {
    expect(festival.performances).toHaveLength(42)
    for (const day of DAYS) {
      const sets = festival.performances.filter((p) => p.day === day).sort((a, b) => a.start.localeCompare(b.start))
      expect(sets).toHaveLength(14)
      sets.slice(1).forEach((set, i) => {
        expect(set.start).toBe(sets[i]?.end) // back to back
        expect(set.stageId).not.toBe(sets[i]?.stageId) // on the other stage
      })
    }
  })

  test('places the openers and closers on the right stage, day, and time', () => {
    expect(find('A I W E O')).toMatchObject({ day: '2026-11-20', start: '12:00', end: '12:30' })
    expect(stageName(find('A I W E O')?.stageId)).toBe('LIVET STAGE')
    expect(find('THE ORAL CIGARETTES')).toMatchObject({ day: '2026-11-20', start: '21:00', end: '22:00' })
    expect(stageName(find('THE ORAL CIGARETTES')?.stageId)).toBe('WONDER STAGE')
    expect(find('[Alexandros]')).toMatchObject({ day: '2026-11-21', start: '21:00' })
    expect(find('HANRORO')).toMatchObject({ day: '2026-11-21', start: '19:10', end: '20:00' })
    expect(find('NELL')).toMatchObject({ day: '2026-11-22', start: '19:10', end: '20:00' })
    expect(stageName(find('SUKIMASWITCH')?.stageId)).toBe('LIVET STAGE')
    expect(find('YUZU')).toMatchObject({ day: '2026-11-22', start: '21:00', end: '22:00' })
  })

  test('uses the yearly code for timetable ids and the festival code for map pins', () => {
    expect(festival.performances.every((p) => p.id.startsWith(`${WONDERLIVET_2026_KEY}-`))).toBe(true)
    expect(festival.pins.every((p) => p.id.startsWith(`${WONDERLIVET_SERIES}-`))).toBe(true)
  })

  test('pins the halls and the stations the official directions name, and has no illustrated map yet', () => {
    expect(festival.pins.map((p) => p.name)).toEqual(['킨텍스 제2전시장 7–10홀 · 공연장', '킨텍스역 (GTX-A) (대략)', '대화역 (3호선) (대략)'])
    expect(festivalMapFor(WONDERLIVET_2026_ID)).toBeNull()
  })

  test('comes with notices from the official FAQ, and the design of its own', () => {
    expect(WONDERLIVET_2026_NOTICES.length).toBeGreaterThan(0)
    expect(catalogEntry(WONDERLIVET_2026_ID)?.guides).toEqual([])
    expect(Object.keys(SERIES[WONDERLIVET_SERIES]?.theme.stages ?? {})).toEqual(['wonder', 'livet'])
    expect(SERIES[WONDERLIVET_SERIES]?.sources.map((s) => s.value)).toEqual(['@wonderlivet'])
  })
})
