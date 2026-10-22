import { describe, expect, test } from 'vitest'
import { FestivalSchema } from '../schema'
import { JUMF_2026_ID, JUMF_2026_KEY, JUMF_SERIES } from './ids'
import { JUMF_2026_NOTICES, createJumf2026 } from './jumf2026'
import { catalogEntry, festivalMapFor } from './index'

const DAYS = ['2026-08-14', '2026-08-15', '2026-08-16']

describe('createJumf2026', () => {
  const festival = createJumf2026()
  const stageName = (stageId: string | undefined) => festival.stages.find((s) => s.id === stageId)?.name
  const find = (artist: string) => festival.performances.find((p) => p.artist === artist)

  test('is a schema-valid three-day festival at Jeonju University', () => {
    expect(FestivalSchema.safeParse(festival).success).toBe(true)
    expect(festival.id).toBe(JUMF_2026_ID)
    expect(festival.name).toBe('2026 전주얼티밋뮤직페스티벌')
    expect([festival.startDate, festival.endDate]).toEqual(['2026-08-14', '2026-08-16'])
    expect(festival.venue.name).toBe('전주대학교 인조잔디구장')
  })

  test('has the three stages from the official timetable', () => {
    expect(festival.stages.map((s) => s.name)).toEqual(['MARU 마루', 'NEOUL 너울', 'SOOM 숨'])
  })

  test('lists all 60 acts, 20 a day', () => {
    expect(festival.performances).toHaveLength(60)
    for (const day of DAYS) expect(festival.performances.filter((p) => p.day === day)).toHaveLength(20)
  })

  test('places the headliners on the right stage, day, and time', () => {
    expect(find('10CM')).toMatchObject({ day: '2026-08-14', start: '22:20', end: '23:20' })
    expect(stageName(find('10CM')?.stageId)).toBe('NEOUL 너울')
    expect(find('자우림')).toMatchObject({ day: '2026-08-15', start: '22:30', end: '23:30' })
    expect(find('NELL')).toMatchObject({ day: '2026-08-15', start: '21:30', end: '22:30' })
    expect(stageName(find('NELL')?.stageId)).toBe('MARU 마루')
    expect(find('YB')).toMatchObject({ day: '2026-08-16', start: '22:20', end: '23:20' })
    expect(stageName(find('스키조')?.stageId)).toBe('SOOM 숨')
  })

  test('keeps sets on one stage from overlapping', () => {
    for (const stage of festival.stages) {
      for (const day of DAYS) {
        const sets = festival.performances.filter((p) => p.stageId === stage.id && p.day === day).sort((a, b) => a.start.localeCompare(b.start))
        sets.slice(1).forEach((set, i) => expect(set.start >= (sets[i]?.end ?? '')).toBe(true))
      }
    }
  })

  test('uses the yearly code for timetable ids and the festival code for map pins', () => {
    expect(festival.performances.every((p) => p.id.startsWith(`${JUMF_2026_KEY}-`))).toBe(true)
    expect(festival.pins.every((p) => p.id.startsWith(`${JUMF_SERIES}-`))).toBe(true)
  })

  test('pins both stage areas on campus and has no illustrated map yet', () => {
    expect(festival.pins.filter((p) => p.kind === 'stage').map((p) => p.name)).toEqual([
      '마루·너울 스테이지 · 인조잔디구장 A·B',
      '숨 스테이지 · 실내체육관 (쿨존)',
    ])
    expect(festivalMapFor(JUMF_2026_ID)).toBeNull()
  })

  test('comes with the official FAQ checklist and notices', () => {
    const guides = catalogEntry(JUMF_2026_ID)?.guides ?? []
    expect(guides.map((g) => [g.title, g.images.length])).toEqual([['FAQ 체크리스트', 6]])
    expect(guides.flatMap((g) => g.images).every((image) => image.alt.length > 10)).toBe(true)
    expect(JUMF_2026_NOTICES.length).toBeGreaterThan(0)
  })
})
