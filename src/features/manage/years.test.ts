import { describe, expect, test } from 'vitest'
import { makeFestival } from '../../data/testFixtures'
import { ALL_YEARS, groupByYear, inShownYear } from './years'

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

describe('inShownYear', () => {
  const a = makeFestival({ id: 'a', startDate: '2026-10-17', endDate: '2026-10-18' })
  const b = makeFestival({ id: 'b', startDate: '2025-10-18', endDate: '2025-10-19' })
  const all = [a, b]
  const ids = (shown: ReturnType<typeof inShownYear>) => [shown.year, shown.festivals.map((f) => f.id)]

  test('every year together for "전체"', () => {
    expect(ids(inShownYear(all, ALL_YEARS, '2026'))).toEqual([ALL_YEARS, ['a', 'b']])
  })

  test('the year asked for, else the year of the festival being viewed, else the newest', () => {
    expect(ids(inShownYear(all, '2025', '2026'))).toEqual(['2025', ['b']])
    expect(ids(inShownYear(all, '1999', '2025'))).toEqual(['2025', ['b']])
    expect(ids(inShownYear(all, null, undefined))).toEqual(['2026', ['a']])
  })

  test('lists the years to choose from, newest first', () => {
    expect(inShownYear(all, null, undefined).years).toEqual(['2026', '2025'])
  })
})

