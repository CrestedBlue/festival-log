import { describe, expect, test } from 'vitest'
import { FestivalSchema } from '../schema'
import { HERO_ROCK_2026_ID, HERO_ROCK_SERIES } from './ids'
import { HERO_ROCK_2026_LINEUP, HERO_ROCK_2026_NOTICES, createHeroRock2026 } from './heroRock2026'
import { festivalMapFor } from './index'

describe('createHeroRock2026', () => {
  const festival = createHeroRock2026()

  test('is a schema-valid three-day festival on the dates Melon Ticket lists', () => {
    expect(FestivalSchema.safeParse(festival).success).toBe(true)
    expect(festival.id).toBe(HERO_ROCK_2026_ID)
    expect(festival.name).toBe('2026 히어로 락 페스티벌 - 인천')
    expect([festival.startDate, festival.endDate]).toEqual(['2026-12-18', '2026-12-20'])
    expect(festival.datesTbd).toBeUndefined()
  })

  test('is at Songdo Convensia and has no timetable yet', () => {
    expect(festival.venue.name).toBe('송도컨벤시아')
    expect(festival.venue.lat).toBeCloseTo(37.3888, 3)
    expect(festival.venue.lng).toBeCloseTo(126.6467, 3)
    expect(festival.stages).toEqual([])
    expect(festival.performances).toEqual([])
  })

  test('pins only what is announced: the venue, and the stations near it as one row, drawn as the map\'s icons', () => {
    expect(festival.pins.map((p) => [p.name, p.group ?? null])).toEqual([
      ['송도컨벤시아', null],
      ['인천대입구역 (인천 1호선)', '가까운 역'],
      ['센트럴파크역 (인천 1호선)', '가까운 역'],
      ['지식정보단지역 (인천 1호선)', '가까운 역'],
    ])
    expect(festival.pins.every((p) => p.detail)).toBe(true)
    const map = festivalMapFor(HERO_ROCK_2026_ID)
    expect(festival.pins.every((p) => p.mapIcon && map?.icons[p.mapIcon])).toBe(true)
    expect(festival.pins.every((p) => p.id.startsWith(`${HERO_ROCK_SERIES}-`))).toBe(true)
  })

  test('has notices from the ticket page', () => {
    expect(HERO_ROCK_2026_NOTICES.length).toBeGreaterThan(0)
  })

  test('has the first line-up poster, described for screen readers', () => {
    expect(HERO_ROCK_2026_LINEUP).toHaveLength(1)
    const [first] = HERO_ROCK_2026_LINEUP
    expect(first).toMatchObject({ label: '1차 라인업', width: 700, height: 880 })
    expect(first?.alt).toContain('YB')
    expect(first?.alt).toContain('극동아시아타이거즈')
  })
})
