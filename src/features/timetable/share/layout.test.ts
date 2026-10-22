import { describe, expect, test } from 'vitest'
import type { Performance, Stage } from '../../../data/schema'
import { FOOTER_HEIGHT, GRID_TOP, PX_PER_MIN, SET_GAP, WIDTH, shareLayout } from './layout'

const stage = (id: string, color = '#2f8f62'): Stage => ({ id, name: `무대 ${id}`, color })
const set = (id: string, stageId: string, start: string, end: string, day = '2026-10-17'): Performance => ({
  id,
  stageId,
  day,
  artist: `가수 ${id}`,
  start,
  end,
})

const stages = ['a', 'b', 'c', 'd'].map((id) => stage(id))
const performances = [
  set('p1', 'a', '12:20', '13:00'),
  set('p2', 'b', '13:40', '14:20'),
  set('p3', 'd', '21:30', '22:50'),
  set('other-day', 'a', '15:00', '16:00', '2026-10-18'),
]

describe('shareLayout', () => {
  test("lays out only the chosen day's sets", () => {
    const layout = shareLayout({ stages, performances, day: '2026-10-17', favorites: new Set() })
    expect(layout.sets.map((s) => s.id)).toEqual(['p1', 'p2', 'p3'])
  })

  test('runs the whole day from the hour before the first set to the hour after the last', () => {
    const layout = shareLayout({ stages, performances, day: '2026-10-17', favorites: new Set() })
    const minutes = 23 * 60 - 12 * 60
    expect(layout.gridBottom - GRID_TOP).toBe(minutes * PX_PER_MIN)
    expect(layout.height).toBe(GRID_TOP + minutes * PX_PER_MIN + FOOTER_HEIGHT)
  })

  test('places each set by its start and length', () => {
    const layout = shareLayout({ stages, performances, day: '2026-10-17', favorites: new Set() })
    const first = layout.sets[0]
    expect(first?.y).toBe(GRID_TOP + 20 * PX_PER_MIN)
    expect(first?.h).toBe(40 * PX_PER_MIN - SET_GAP)
    expect(first?.time).toBe('12:20 - 13:00')
  })

  test('is 1080px wide up to four stages, with the fourth one and a half times as wide', () => {
    const layout = shareLayout({ stages, performances, day: '2026-10-17', favorites: new Set() })
    expect(layout.width).toBe(WIDTH)
    const [a, , , d] = layout.stages
    expect(d?.w).toBeCloseTo((a?.w ?? 0) * 1.5)
    expect((d?.x ?? 0) + (d?.w ?? 0)).toBeLessThanOrEqual(WIDTH)
  })

  test('grows wider rather than squeezing many stages', () => {
    const many = ['a', 'b', 'c', 'd', 'e', 'f', 'g'].map((id) => stage(id))
    const four = shareLayout({ stages, performances, day: '2026-10-17', favorites: new Set() })
    const seven = shareLayout({ stages: many, performances, day: '2026-10-17', favorites: new Set() })
    expect(seven.width).toBeGreaterThan(WIDTH)
    expect(seven.stages[0]?.w).toBeCloseTo(four.stages[0]?.w ?? 0)
  })

  test("marks the day's favorites and counts only those", () => {
    const layout = shareLayout({ stages, performances, day: '2026-10-17', favorites: new Set(['p2', 'other-day']) })
    expect(layout.sets.filter((s) => s.isFavorite).map((s) => s.id)).toEqual(['p2'])
    expect(layout.favoriteCount).toBe(1)
  })

  test('marks every half hour and labels the hours', () => {
    const layout = shareLayout({ stages, performances, day: '2026-10-17', favorites: new Set() })
    expect(layout.marks).toHaveLength(23)
    expect(layout.marks.filter((m) => m.label).map((m) => m.label)).toEqual([
      '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00',
    ])
  })
})
