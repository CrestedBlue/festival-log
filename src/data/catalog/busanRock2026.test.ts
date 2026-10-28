import { describe, expect, test } from 'vitest'
import { FestivalSchema } from '../schema'
import { BUSAN_ROCK_2026_NOTICES, BUSAN_ROCK_2026_TICKETS, createBusanRock2026 } from './busanRock2026'
import { BUSAN_ROCK_2026_ID, BUSAN_ROCK_2026_KEY, BUSAN_ROCK_SERIES } from './ids'
import { catalogEntry } from './index'

describe('createBusanRock2026', () => {
  const festival = createBusanRock2026()
  const stageName = (stageId: string | undefined) => festival.stages.find((s) => s.id === stageId)?.name
  const isEvent = (id: string) => id.includes('-event-')
  const acts = festival.performances.filter((p) => !isEvent(p.id))
  const find = (artist: string, day?: string) => acts.find((p) => p.artist === artist && (!day || p.day === day))
  const DAYS = ['2026-10-02', '2026-10-03', '2026-10-04']

  test('is a schema-valid three-day festival at Samnak Ecological Park', () => {
    expect(FestivalSchema.safeParse(festival).success).toBe(true)
    expect(festival.id).toBe(BUSAN_ROCK_2026_ID)
    expect(festival.name).toBe('2026 부산국제록페스티벌')
    expect([festival.startDate, festival.endDate]).toEqual(['2026-10-02', '2026-10-04'])
    expect(festival.venue.name).toBe('삼락생태공원')
  })

  test('has the five stages of the official timetable', () => {
    expect(festival.stages.map((s) => s.name)).toEqual(['SAMROCK', 'GREEN', 'RIVER', 'WAVE', 'HIDDEN'])
  })

  test('lists 99 acts, 33 a day, and two HIDDEN EVENTs a day on the HIDDEN stage', () => {
    expect(acts).toHaveLength(99)
    for (const day of DAYS) {
      expect(acts.filter((p) => p.day === day)).toHaveLength(33)
      const events = festival.performances.filter((p) => isEvent(p.id) && p.day === day)
      expect(events).toHaveLength(2)
      expect(events.every((p) => stageName(p.stageId) === 'HIDDEN')).toBe(true)
    }
  })

  test('has MEGADETH as the SAMROCK headliner on both of the first two nights (the 10/2 change)', () => {
    expect(find('MEGADETH', '2026-10-02')).toMatchObject({ start: '21:00', end: '22:00' })
    expect(find('MEGADETH', '2026-10-03')).toMatchObject({ start: '20:40', end: '22:00' })
    expect(stageName(find('MEGADETH')?.stageId)).toBe('SAMROCK')
    expect(find('THE LIBERTINES')).toMatchObject({ day: '2026-10-04', start: '20:50', end: '22:00' })
    expect(find('Avenged Sevenfold')).toBeUndefined()
  })

  test('places acts on the right stage, day and time', () => {
    expect(find('이승윤')).toMatchObject({ day: '2026-10-02', start: '19:30', end: '20:50' })
    expect(stageName(find('이승윤')?.stageId)).toBe('GREEN')
    expect(stageName(find('Henry Moodie')?.stageId)).toBe('RIVER')
    expect(stageName(find('타이거디스코')?.stageId)).toBe('WAVE')
    expect(stageName(find('아사달')?.stageId)).toBe('HIDDEN')
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
    expect(festival.performances.every((p) => p.id.startsWith(`${BUSAN_ROCK_2026_KEY}-`))).toBe(true)
    expect(festival.pins.every((p) => p.id.startsWith(`${BUSAN_ROCK_SERIES}-`))).toBe(true)
  })

  test('has notices and YES24 as its seller', () => {
    expect(BUSAN_ROCK_2026_NOTICES.length).toBeGreaterThan(0)
    expect(BUSAN_ROCK_2026_TICKETS).toEqual([{ name: 'YES24', url: 'https://ticket.yes24.com/Special/58933' }])
    expect(catalogEntry(BUSAN_ROCK_2026_ID)).toMatchObject({ series: BUSAN_ROCK_SERIES, key: BUSAN_ROCK_2026_KEY })
  })
})
