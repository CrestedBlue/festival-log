import { describe, expect, test } from 'vitest'
import {
  addDays,
  dayDiff,
  festivalMoment,
  formatClock,
  formatDayLabel,
  listDays,
  parseClock,
  toFestivalMinutes,
  toIsoDate,
} from './time'

describe('parseClock', () => {
  test('parses HH:MM and H:MM into minutes since midnight', () => {
    expect(parseClock('18:30')).toBe(1110)
    expect(parseClock('9:05')).toBe(545)
    expect(parseClock('00:00')).toBe(0)
  })

  test('accepts 24:00 as midnight, which Korean timetables often use', () => {
    expect(parseClock('24:00')).toBe(1440)
  })

  test('returns null for malformed or out-of-range input', () => {
    expect(parseClock('24:01')).toBeNull()
    expect(parseClock('25:00')).toBeNull()
    expect(parseClock('12:60')).toBeNull()
    expect(parseClock('1830')).toBeNull()
    expect(parseClock('')).toBeNull()
  })
})

describe('toFestivalMinutes', () => {
  test('keeps daytime clocks as-is', () => {
    expect(toFestivalMinutes('18:30')).toBe(1110)
  })

  test('treats clocks before 06:00 as the night of the same festival day', () => {
    expect(toFestivalMinutes('01:00')).toBe(25 * 60)
    expect(toFestivalMinutes('05:59')).toBe(29 * 60 + 59)
    expect(toFestivalMinutes('06:00')).toBe(6 * 60)
  })

  test('throws on invalid clock text', () => {
    expect(() => toFestivalMinutes('nope')).toThrow()
  })
})

describe('formatClock', () => {
  test('wraps festival minutes past midnight back to a wall clock', () => {
    expect(formatClock(1110)).toBe('18:30')
    expect(formatClock(25 * 60 + 5)).toBe('01:05')
  })
})

describe('listDays', () => {
  test('lists every date between start and end inclusive', () => {
    expect(listDays('2026-10-30', '2026-11-01')).toEqual(['2026-10-30', '2026-10-31', '2026-11-01'])
  })

  test('returns just the start date for a one-day festival', () => {
    expect(listDays('2026-10-17', '2026-10-17')).toEqual(['2026-10-17'])
  })

  test('returns an empty list when the end is before the start or dates are invalid', () => {
    expect(listDays('2026-10-18', '2026-10-17')).toEqual([])
    expect(listDays('2026-13-01', '2026-13-02')).toEqual([])
  })
})

describe('addDays / toIsoDate', () => {
  test('adds days across month boundaries', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01')
    expect(addDays('2026-11-01', -1)).toBe('2026-10-31')
  })

  test('formats a local date as YYYY-MM-DD', () => {
    expect(toIsoDate(new Date(2026, 9, 7, 23, 59))).toBe('2026-10-07')
  })
})

describe('festivalMoment', () => {
  test('maps daytime to the same calendar day', () => {
    expect(festivalMoment(new Date(2026, 9, 17, 19, 10))).toEqual({ day: '2026-10-17', minutes: 1150 })
  })

  test('maps after-midnight hours back to the previous festival day', () => {
    expect(festivalMoment(new Date(2026, 9, 18, 1, 30))).toEqual({ day: '2026-10-17', minutes: 25 * 60 + 30 })
  })
})

describe('formatDayLabel', () => {
  test('renders month.day with the Korean weekday', () => {
    expect(formatDayLabel('2026-10-17')).toBe('10.17 (토)')
  })
})

describe('dayDiff', () => {
  test('counts whole days from a to b', () => {
    expect(dayDiff('2026-10-16', '2026-10-19')).toBe(3)
    expect(dayDiff('2026-10-19', '2026-10-16')).toBe(-3)
  })
})
