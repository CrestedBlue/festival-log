import { describe, expect, test } from 'vitest'
import { makeFestival } from '../data/testFixtures'
import { formatPeriod } from './period'

describe('formatPeriod', () => {
  test('shows a one-day festival as one date and a longer one as a range', () => {
    expect(formatPeriod(makeFestival({ startDate: '2026-10-17', endDate: '2026-10-17' }))).toBe('10.17 (토)')
    expect(formatPeriod(makeFestival({ startDate: '2026-10-17', endDate: '2026-10-18' }))).toBe('10.17 (토) – 10.18 (일)')
  })

  test('says the dates are not out yet instead of showing placeholder dates', () => {
    expect(formatPeriod(makeFestival({ datesTbd: true }))).toBe('날짜 미정')
  })
})
