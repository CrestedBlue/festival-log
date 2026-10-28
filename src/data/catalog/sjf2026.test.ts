import { describe, expect, test } from 'vitest'
import { FestivalSchema } from '../schema'
import { SJF_2026_ID, SJF_2026_KEY, SJF_SERIES } from './ids'
import { catalogEntry } from './index'
import { SJF_2026_NOTICES, SJF_2026_TICKETS, createSjf2026 } from './sjf2026'

describe('createSjf2026', () => {
  const festival = createSjf2026()
  const stageName = (stageId: string | undefined) => festival.stages.find((s) => s.id === stageId)?.name
  const find = (artist: string) => festival.performances.find((p) => p.artist === artist)
  const DAYS = ['2026-05-22', '2026-05-23', '2026-05-24']
  const minutes = (clock: string) => Number(clock.slice(0, 2)) * 60 + Number(clock.slice(3))

  test('is a schema-valid three-day festival at Olympic Park', () => {
    expect(FestivalSchema.safeParse(festival).success).toBe(true)
    expect(festival.id).toBe(SJF_2026_ID)
    expect(festival.name).toBe('서울재즈페스티벌 2026')
    expect([festival.startDate, festival.endDate]).toEqual(['2026-05-22', '2026-05-24'])
    expect(festival.venue.name).toBe('올림픽공원')
  })

  test('has the four stages of the official timetable', () => {
    expect(festival.stages.map((s) => s.name)).toEqual(['MAY FOREST', 'SPARKLING DOME', 'PINK AVENUE', 'SPRING GARDEN'])
  })

  test('lists the 60 acts of the final line-up, 20 a day, 5 on each stage', () => {
    expect(festival.performances).toHaveLength(60)
    for (const day of DAYS) {
      const sets = festival.performances.filter((p) => p.day === day)
      expect(sets).toHaveLength(20)
      for (const stage of festival.stages) expect(sets.filter((p) => p.stageId === stage.id)).toHaveLength(5)
    }
  })

  test('gives each set the length printed on its block', () => {
    const length = (artist: string) => {
      const set = find(artist)
      return set ? minutes(set.end) - minutes(set.start) : null
    }
    expect([length('JANELLE MONÁE'), length('씨엔블루'), length('TROMBONE SHORTY & ORLEANS AVENUE')]).toEqual([90, 80, 75])
    expect([length('PEDER ELIAS'), length('최유리'), length('에픽하이')]).toEqual([70, 75, 75])
    expect([length('HERBIE HANCOCK'), length('웨이브투어스'), length('실리카겔')]).toEqual([90, 60, 80])
  })

  test('places the headliners on the right stage, day and time', () => {
    expect(find('JANELLE MONÁE')).toMatchObject({ day: '2026-05-22', start: '21:00', end: '22:30' })
    expect(stageName(find('JANELLE MONÁE')?.stageId)).toBe('SPARKLING DOME')
    expect(find('JON BATISTE LIVE')).toMatchObject({ day: '2026-05-23', start: '20:00', end: '21:30' })
    expect(stageName(find('JON BATISTE LIVE')?.stageId)).toBe('MAY FOREST')
    expect(find('혁오')).toMatchObject({ day: '2026-05-24', start: '18:50', end: '20:00' })
    expect(stageName(find('실리카겔')?.stageId)).toBe('PINK AVENUE')
    expect(stageName(find('대니 구')?.stageId)).toBe('SPRING GARDEN')
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
    expect(festival.performances.every((p) => p.id.startsWith(`${SJF_2026_KEY}-`))).toBe(true)
    expect(festival.pins.every((p) => p.id.startsWith(`${SJF_SERIES}-`))).toBe(true)
  })

  test('has notices and Melon Ticket as its seller', () => {
    expect(SJF_2026_NOTICES.length).toBeGreaterThan(0)
    expect(SJF_2026_TICKETS.map((s) => s.name)).toEqual(['멜론티켓'])
    expect(catalogEntry(SJF_2026_ID)).toMatchObject({ series: SJF_SERIES, key: SJF_2026_KEY })
  })
})
