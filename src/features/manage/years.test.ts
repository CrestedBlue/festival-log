import { describe, expect, test } from 'vitest'
import { makeFestival } from '../../data/testFixtures'
import { groupByYear } from './years'

describe('groupByYear', () => {
  test('groups festivals by start year, newest year first, earliest date first inside a year', () => {
    const a = makeFestival({ id: 'a', startDate: '2026-10-17', endDate: '2026-10-18' })
    const b = makeFestival({ id: 'b', startDate: '2025-10-18', endDate: '2025-10-19' })
    const c = makeFestival({ id: 'c', startDate: '2026-05-01', endDate: '2026-05-01' })
    expect(groupByYear([a, b, c]).map(({ year, festivals }) => [year, festivals.map((f) => f.id)])).toEqual([
      ['2026', ['c', 'a']],
      ['2025', ['b']],
    ])
  })

  test('returns nothing for an empty list', () => {
    expect(groupByYear([])).toEqual([])
  })
})
