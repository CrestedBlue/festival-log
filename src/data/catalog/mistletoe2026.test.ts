import { describe, expect, test } from 'vitest'
import { FestivalSchema } from '../schema'
import { MISTLETOE_2026_ID, MISTLETOE_2026_KEY, MISTLETOE_SERIES } from './ids'
import { catalogEntry, festivalMapFor } from './index'
import { MISTLETOE_2026_TICKETS, createMistletoe2026 } from './mistletoe2026'

describe('createMistletoe2026', () => {
  const festival = createMistletoe2026()

  test('is a schema-valid one-evening gig at 201P on 2026-12-05', () => {
    expect(FestivalSchema.safeParse(festival).success).toBe(true)
    expect([festival.startDate, festival.endDate]).toEqual(['2026-12-05', '2026-12-05'])
    expect(festival.venue.name).toContain('201P')
  })

  test('has its two sets on the one stage, the second by S2omeday', () => {
    expect(festival.stages.map((s) => s.name)).toEqual(['201P'])
    expect(festival.performances.map((p) => [p.start, p.end, p.artist])).toEqual([
      ['17:30', '18:20', '1부'],
      ['18:40', '19:30', 'S2omeday'],
    ])
  })

  test('pins the club and Sinchon station on the plain map', () => {
    expect(festivalMapFor(MISTLETOE_2026_ID)).toBeNull()
    expect(festival.pins.map((p) => p.name)).toEqual(['201P (신촌 201punks)', '신촌역 (2호선)'])
  })

  test('is sold on 201P\'s own page, and is in the catalog under its own code', () => {
    expect(MISTLETOE_2026_TICKETS).toEqual([{ name: '201P', url: 'https://201p.me/39/?idx=399' }])
    expect(catalogEntry(MISTLETOE_2026_ID)).toMatchObject({ series: MISTLETOE_SERIES, key: MISTLETOE_2026_KEY })
  })
})
