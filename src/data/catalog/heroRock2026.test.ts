import { describe, expect, test } from 'vitest'
import { FestivalSchema } from '../schema'
import { HERO_ROCK_2026_ID, HERO_ROCK_2026_KEY } from './ids'
import { createHeroRock2026 } from './heroRock2026'

describe('createHeroRock2026', () => {
  const festival = createHeroRock2026()

  test('is a schema-valid 2026 festival whose dates are not announced yet', () => {
    expect(FestivalSchema.safeParse(festival).success).toBe(true)
    expect(festival.id).toBe(HERO_ROCK_2026_ID)
    expect(festival.datesTbd).toBe(true)
    expect(festival.startDate.slice(0, 4)).toBe('2026')
  })

  test('is at Songdo Convensia and has no timetable yet', () => {
    expect(festival.venue.name).toBe('송도컨벤시아')
    expect(festival.venue.lat).toBeCloseTo(37.3888, 3)
    expect(festival.venue.lng).toBeCloseTo(126.6467, 3)
    expect(festival.stages).toEqual([])
    expect(festival.performances).toEqual([])
  })

  test('pins the venue and the nearest subway exit under the festival key', () => {
    expect(festival.pins.map((p) => p.name)).toEqual(['송도컨벤시아 · 행사장', '인천대입구역 4번 출구 (인천 1호선)'])
    expect(festival.pins.every((p) => p.id.startsWith(`${HERO_ROCK_2026_KEY}-`))).toBe(true)
  })
})
