import { describe, expect, test } from 'vitest'
import { FestivalSchema } from '../schema'
import { LETS_ROCK_2026_ID, LETS_ROCK_2026_KEY, LETS_ROCK_SERIES } from './ids'
import { catalogEntry } from './index'
import { LETS_ROCK_2026_NOTICES, LETS_ROCK_2026_TICKETS, createLetsRock2026 } from './letsRock2026'

describe('createLetsRock2026', () => {
  const festival = createLetsRock2026()
  const find = (artist: string) => festival.performances.find((p) => p.artist === artist)
  const DAYS = ['2026-10-03', '2026-10-04']

  test('is a schema-valid two-day festival at Nanji Hangang Park', () => {
    expect(FestivalSchema.safeParse(festival).success).toBe(true)
    expect(festival.id).toBe(LETS_ROCK_2026_ID)
    expect(festival.name).toBe('2026 렛츠락 페스티벌')
    expect([festival.startDate, festival.endDate]).toEqual(DAYS)
    expect(festival.venue.name).toBe('난지한강공원')
  })

  test('has one stage with 21 acts: 10 on the first day, 11 on the second', () => {
    expect(festival.stages.map((s) => s.name)).toEqual(['메인 무대'])
    expect(DAYS.map((day) => festival.performances.filter((p) => p.day === day).length)).toEqual([10, 11])
  })

  test('opens at 11:20 and closes with the headliners at 21:00', () => {
    expect(find('바비핀스')).toMatchObject({ day: '2026-10-03', start: '11:20', end: '11:50' })
    expect(find('Nothing But Thieves')).toMatchObject({ day: '2026-10-03', start: '19:40', end: '21:00' })
    expect(find('국카스텐')).toMatchObject({ day: '2026-10-04', start: '18:50', end: '19:40' })
    expect(find('자우림')).toMatchObject({ day: '2026-10-04', start: '20:00', end: '21:00' })
  })

  test('keeps the sets of a day from overlapping', () => {
    for (const day of DAYS) {
      const sets = festival.performances.filter((p) => p.day === day).sort((a, b) => a.start.localeCompare(b.start))
      sets.slice(1).forEach((set, i) => expect(set.start >= (sets[i]?.end ?? '')).toBe(true))
    }
  })

  test('uses its own yearly code for timetable ids and the festival code for map pins', () => {
    expect(festival.performances.every((p) => p.id.startsWith(`${LETS_ROCK_2026_KEY}-`))).toBe(true)
    expect(festival.pins.every((p) => p.id.startsWith(`${LETS_ROCK_SERIES}-`))).toBe(true)
  })

  test('has notices and NOL ticket as its only seller', () => {
    expect(LETS_ROCK_2026_NOTICES.length).toBeGreaterThan(0)
    expect(LETS_ROCK_2026_TICKETS.map((s) => s.name)).toEqual(['NOL 티켓'])
    expect(catalogEntry(LETS_ROCK_2026_ID)).toMatchObject({ series: LETS_ROCK_SERIES, key: LETS_ROCK_2026_KEY })
  })
})
