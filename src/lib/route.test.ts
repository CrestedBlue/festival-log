import { describe, expect, test } from 'vitest'
import { buildHash, parseHash } from './route'

describe('parseHash', () => {
  test('reads the tab and query params', () => {
    const route = parseHash('#/timetable?day=2026-10-17&mine=1')
    expect(route.tab).toBe('timetable')
    expect(route.params.get('day')).toBe('2026-10-17')
    expect(route.params.get('mine')).toBe('1')
  })

  test('falls back to the timetable tab for unknown or empty hashes', () => {
    expect(parseHash('').tab).toBe('timetable')
    expect(parseHash('#/nope').tab).toBe('timetable')
  })
})

describe('buildHash', () => {
  test('omits empty params', () => {
    expect(buildHash('map')).toBe('#/map')
    expect(buildHash('timetable', { day: '2026-10-17', mine: undefined })).toBe('#/timetable?day=2026-10-17')
  })
})
