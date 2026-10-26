import { describe, expect, test } from 'vitest'
import { CATALOG } from '../../data/catalog'
import { SERIES } from '../../data/catalog/series'
import { seriesOverview } from './overview'
import { resolveSelection, selectionQuery } from './selection'

const series = seriesOverview(CATALOG, SERIES)
const TODAY = '2026-10-20'
const resolve = (query: string) => resolveSelection(new URLSearchParams(query), series, TODAY)

describe('resolveSelection', () => {
  test('opens on the festival whose next edition has not ended, on its timetable (or line-up)', () => {
    expect(resolve('')).toEqual({ section: 'festivals', series: 'wonderlivet', year: '2026', view: 'timetable' }) // 11-20, before Hero Rock's 12-18
  })

  test('follows the festival, year and view in the address', () => {
    expect(resolve('?festival=pentaport')).toEqual({ section: 'festivals', series: 'pentaport', year: '2026', view: 'timetable' })
    expect(resolve('?festival=pentaport&year=2026&view=map')).toEqual({ section: 'festivals', series: 'pentaport', year: '2026', view: 'map' })
  })

  test('falls back for unknown festivals, years and views', () => {
    expect(resolve('?festival=nope&year=1999&view=nope')).toEqual({ section: 'festivals', series: 'wonderlivet', year: '2026', view: 'timetable' })
    expect(resolve('?festival=pentaport&year=1999')).toMatchObject({ series: 'pentaport', year: '2026' })
  })

  test('opens the CS section and keeps the chosen festival for coming back', () => {
    expect(resolve('?tab=cs').section).toBe('cs')
    expect(resolve('?tab=cs&festival=pentaport&year=2026&view=map')).toEqual({ section: 'cs', series: 'pentaport', year: '2026', view: 'map' })
  })
})

describe('selectionQuery', () => {
  test('writes the selection with the festival code and year', () => {
    expect(selectionQuery({ section: 'festivals', series: 'pentaport', year: '2026', view: 'map' })).toBe('?festival=pentaport&year=2026&view=map')
    expect(selectionQuery({ section: 'cs', series: 'pentaport', year: '2026', view: 'map' })).toBe('?tab=cs&festival=pentaport&year=2026&view=map')
  })
})
