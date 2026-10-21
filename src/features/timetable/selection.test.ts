import { describe, expect, test } from 'vitest'
import { selectionParams, timetableSelection } from './selection'

const festival = { startDate: '2026-10-17', endDate: '2026-10-18' }

describe('timetableSelection', () => {
  test('shows the day in the address when the festival has it', () => {
    const selection = timetableSelection(festival, new URLSearchParams('day=2026-10-18&mine=1'), '2026-10-17')
    expect(selection).toEqual({ days: ['2026-10-17', '2026-10-18'], day: '2026-10-18', showMine: true })
  })

  test('falls back to today during the festival, else to the first day', () => {
    expect(timetableSelection(festival, new URLSearchParams('day=2026-01-01'), '2026-10-18').day).toBe('2026-10-18')
    expect(timetableSelection(festival, new URLSearchParams(), '2026-10-21').day).toBe('2026-10-17')
  })
})

describe('selectionParams', () => {
  test('changes only what was picked', () => {
    const current = timetableSelection(festival, new URLSearchParams('day=2026-10-18&mine=1'), '2026-10-17')
    expect(selectionParams(current, { day: '2026-10-17' })).toEqual({ day: '2026-10-17', mine: '1' })
    expect(selectionParams(current, { mine: false })).toEqual({ day: '2026-10-18', mine: undefined })
  })
})
