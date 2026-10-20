import { describe, expect, test } from 'vitest'
import { makeFestival } from '../data/testFixtures'
import { buildHash, homeTab, isAdminPath, parseHash } from './route'

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

  test('is the timetable tab when there is a timetable or a line-up, the map otherwise', () => {
    expect(homeTab(makeFestival())).toBe('timetable')
    expect(homeTab({ performances: [] }, 1)).toBe('timetable')
    expect(homeTab({ performances: [] })).toBe('map')
    expect(homeTab(null)).toBe('timetable')
  })
})

describe('buildHash', () => {
  test('omits empty params', () => {
    expect(buildHash('map')).toBe('#/map')
    expect(buildHash('timetable', { day: '2026-10-17', mine: undefined })).toBe('#/timetable?day=2026-10-17')
  })
})

describe('isAdminPath', () => {
  test('is true for the admin page with or without the trailing slash', () => {
    expect(isAdminPath('/festival-log/manage/', '/festival-log/')).toBe(true)
    expect(isAdminPath('/festival-log/manage', '/festival-log/')).toBe(true)
    expect(isAdminPath('/manage/', '/')).toBe(true)
  })

  test('is false for the app itself and for look-alike paths', () => {
    expect(isAdminPath('/festival-log/', '/festival-log/')).toBe(false)
    expect(isAdminPath('/festival-log/managers', '/festival-log/')).toBe(false)
    expect(isAdminPath('/manage/', '/festival-log/')).toBe(false)
  })
})
