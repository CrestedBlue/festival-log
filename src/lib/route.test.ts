import { describe, expect, test } from 'vitest'
import { makeFestival } from '../data/testFixtures'
import { buildHash, homeTab, parseHash } from './route'

describe('parseHash', () => {
  test('reads the tab and query params', () => {
    const route = parseHash('#/timetable?day=2026-10-17&mine=1')
    expect(route.tab).toBe('timetable')
    expect(route.params.get('day')).toBe('2026-10-17')
    expect(route.params.get('mine')).toBe('1')
  })

  test('knows the info tab', () => {
    expect(parseHash('#/info').tab).toBe('info')
  })

  test('falls back to the timetable tab for unknown or empty hashes', () => {
    expect(parseHash('').tab).toBe('timetable')
    expect(parseHash('#/nope').tab).toBe('timetable')
  })
})

describe('home tab', () => {
  test('an empty or unknown hash opens the given home tab', () => {
    expect(parseHash('', 'map').tab).toBe('map')
    expect(parseHash('#/', 'map').tab).toBe('map')
    expect(parseHash('#/nope', 'map').tab).toBe('map')
  })

  test('a tab named in the hash always wins over the home tab', () => {
    expect(parseHash('#/timetable', 'map').tab).toBe('timetable')
    expect(parseHash('#/info', 'map').tab).toBe('info')
  })

  test('is the map until the festival has a timetable, the timetable after that', () => {
    expect(homeTab({ performances: [] })).toBe('map')
    expect(homeTab(makeFestival())).toBe('timetable')
    expect(homeTab(null)).toBe('timetable')
  })
})

describe('buildHash', () => {
  test('omits empty params', () => {
    expect(buildHash('map')).toBe('#/map')
    expect(buildHash('timetable', { day: '2026-10-17', mine: undefined })).toBe('#/timetable?day=2026-10-17')
  })
})
