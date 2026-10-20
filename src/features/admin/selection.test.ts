import { describe, expect, test } from 'vitest'
import { CATALOG } from '../../data/catalog'
import { catalogOverview } from './overview'
import { adminYears, festivalsOfYear, resolveSelection, selectionQuery } from './selection'

const rows = catalogOverview(CATALOG)
const TODAY = '2026-10-20'
const resolve = (query: string) => resolveSelection(new URLSearchParams(query), rows, TODAY)

describe('adminYears', () => {
  test('offers every catalog year plus this year and next, newest first', () => {
    expect(adminYears(rows, TODAY)).toEqual(['2027', '2026'])
  })
})

describe('festivalsOfYear', () => {
  test('lists one year in date order', () => {
    expect(festivalsOfYear(rows, '2026').map((r) => r.key)).toEqual(['gmf2026', 'herorock2026'])
    expect(festivalsOfYear(rows, '2027')).toEqual([])
  })
})

describe('resolveSelection', () => {
  test('opens this year on the next festival that has not ended, on its timetable (or line-up)', () => {
    expect(resolve('')).toEqual({ year: '2026', festivalKey: 'herorock2026', view: 'timetable' })
  })

  test('follows the festival in the address, opening its year and its timetable', () => {
    expect(resolve('?festival=gmf2026')).toEqual({ year: '2026', festivalKey: 'gmf2026', view: 'timetable' })
    expect(resolve('?year=2026&festival=gmf2026&view=notices')).toEqual({ year: '2026', festivalKey: 'gmf2026', view: 'notices' })
  })

  test('falls back for unknown years, festivals and views', () => {
    expect(resolve('?year=1999&festival=nope&view=nope')).toEqual({ year: '2026', festivalKey: 'herorock2026', view: 'timetable' })
  })

  test('a year without festivals selects none', () => {
    expect(resolve('?year=2027')).toEqual({ year: '2027', festivalKey: null, view: 'timetable' })
  })
})

describe('selectionQuery', () => {
  test('writes the selection with readable codes', () => {
    expect(selectionQuery({ year: '2026', festivalKey: 'gmf2026', view: 'map' })).toBe('?year=2026&festival=gmf2026&view=map')
    expect(selectionQuery({ year: '2027', festivalKey: null, view: 'timetable' })).toBe('?year=2027')
  })
})
