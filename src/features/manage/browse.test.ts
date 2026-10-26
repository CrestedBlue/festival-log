import { describe, expect, test } from 'vitest'
import { makeFestival } from '../../data/testFixtures'
import { artistHit, calendarTile, groupByMonth, hasEnded, matchesQuery } from './browse'

const hero = makeFestival({
  id: 'hero',
  name: '2026 히어로 락 페스티벌 - 인천',
  startDate: '2026-12-18',
  endDate: '2026-12-20',
  venue: { name: '송도컨벤시아', lat: 37.3888, lng: 126.6467 },
  performances: [],
})
const winter = makeFestival({ id: 'winter', name: 'Winter Mint', startDate: '2026-12-05', endDate: '2026-12-05', performances: [] })
const gmf = makeFestival({ id: 'gmf', name: '그랜드 민트 페스티벌 2026', startDate: '2026-10-17', endDate: '2026-10-18' })
const tbd = makeFestival({ id: 'tbd', datesTbd: true, startDate: '2026-12-31', endDate: '2026-12-31', performances: [] })

describe('matchesQuery', () => {
  test('finds festivals by name or venue, ignoring spaces and letter case', () => {
    expect(matchesQuery(hero, '히어로')).toBe(true)
    expect(matchesQuery(hero, '송도 컨벤')).toBe(true)
    expect(matchesQuery(winter, 'MINT')).toBe(true)
    expect(matchesQuery(gmf, '송도')).toBe(false)
  })

  test('an empty query matches everything', () => {
    expect(matchesQuery(gmf, '  ')).toBe(true)
  })

  test('finds festivals by an artist in the timetable or on the line-up poster, ignoring spaces and letter case', () => {
    const withSets = makeFestival({ performances: [{ id: 'p1', stageId: 's1', day: '2026-10-17', artist: 'Kyary Pamyu Pamyu', start: '18:00', end: '19:00' }] })
    expect(matchesQuery(withSets, 'kyary pamyu')).toBe(true)
    expect(matchesQuery(hero, '국카스텐', ['1차 라인업 포스터: YB, 부활, 국카스텐, LACUNA COIL']) ).toBe(true)
    expect(matchesQuery(hero, '자우림', ['1차 라인업 포스터: YB, 부활, 국카스텐'])).toBe(false)
  })
})

describe('artistHit', () => {
  const sets = (artists: string[]) => makeFestival({ performances: artists.map((artist, i) => ({ id: `p${i}`, stageId: 's1', day: '2026-10-17', artist, start: '18:00', end: '19:00' })) })

  test('names the artists a search found in the timetable, a couple of them and how many more', () => {
    expect(artistHit(sets(['NELL', 'QWER', 'YB']), 'nell')).toBe('NELL 출연')
    expect(artistHit(sets(['Roselia', 'MyGO!!!!!', 'Ro Ro', 'Rock']), 'ro')).toBe('Roselia·Ro Ro 외 1팀 출연')
  })

  test('names the line-up poster entry when there is no timetable yet', () => {
    expect(artistHit(hero, '국카', ['1차 라인업 포스터: YB, 부활, 국카스텐, LACUNA COIL 외. 2026년 12월'])).toBe('국카스텐 출연')
  })

  test('says nothing when the festival matched by its name or place, or for an empty search', () => {
    expect(artistHit(hero, '송도')).toBeNull()
    expect(artistHit(sets(['NELL']), ' ')).toBeNull()
  })
})

describe('groupByMonth', () => {
  test('names the year with the month when festivals of every year are listed together', () => {
    const older = makeFestival({ id: 'old', startDate: '2025-12-06', endDate: '2025-12-07' })
    expect(groupByMonth([gmf, older, hero], { withYear: true }).map((g) => g.label)).toEqual(['2026년 12월', '2026년 10월', '2025년 12월'])
  })

  test('groups by month, latest first, with undecided dates last', () => {
    const groups = groupByMonth([gmf, tbd, winter, hero])
    expect(groups.map((g) => [g.label, g.festivals.map((f) => f.id)])).toEqual([
      ['12월', ['hero', 'winter']],
      ['10월', ['gmf']],
      ['날짜 미정', ['tbd']],
    ])
  })
})

describe('calendarTile', () => {
  test('shows the first day and its weekday', () => {
    expect(calendarTile(hero)).toEqual({ weekday: '금', day: '18' })
    expect(calendarTile(gmf)).toEqual({ weekday: '토', day: '17' })
  })

  test('marks dates that are not announced', () => {
    expect(calendarTile(tbd)).toEqual({ weekday: '미정', day: '–' })
  })
})

describe('hasEnded', () => {
  test('is true only once the last day is over', () => {
    expect(hasEnded(gmf, '2026-10-18')).toBe(false)
    expect(hasEnded(gmf, '2026-10-19')).toBe(true)
    expect(hasEnded(hero, '2026-10-20')).toBe(false)
    expect(hasEnded(tbd, '2027-01-05')).toBe(false)
  })
})
