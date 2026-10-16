import { describe, expect, test } from 'vitest'
import { makeFestival } from '../data/testFixtures'
import { summarizeNow } from './nowSummary'

const festival = makeFestival({
  performances: [
    { id: 'a', stageId: 's1', day: '2026-10-17', artist: 'A', start: '18:00', end: '19:00' },
    { id: 'b', stageId: 's1', day: '2026-10-17', artist: 'B', start: '18:30', end: '19:30' },
    { id: 'c', stageId: 's1', day: '2026-10-17', artist: 'C', start: '20:00', end: '21:00' },
    { id: 'd', stageId: 's1', day: '2026-10-17', artist: 'D', start: '21:00', end: '22:00' },
  ],
})

describe('summarizeNow', () => {
  test('counts down before the festival', () => {
    expect(summarizeNow(festival, [], { day: '2026-10-14', minutes: 600 })).toEqual({ kind: 'before', daysLeft: 3 })
  })

  test('marks the festival as over afterwards', () => {
    expect(summarizeNow(festival, [], { day: '2026-10-19', minutes: 600 }).kind).toBe('after')
  })

  test('lists favorites first among what is playing', () => {
    const summary = summarizeNow(festival, ['b'], { day: '2026-10-17', minutes: 18 * 60 + 40 })
    expect(summary.kind === 'during' && summary.playing.map((p) => p.id)).toEqual(['b', 'a'])
  })

  test('prefers the next favorite over the next set overall', () => {
    const summary = summarizeNow(festival, ['d'], { day: '2026-10-17', minutes: 19 * 60 + 40 })
    expect(summary).toMatchObject({ kind: 'during', next: { id: 'd' }, nextIsFavorite: true, minutesUntilNext: 80 })
  })

  test('falls back to the next set overall when no favorite is coming up', () => {
    const summary = summarizeNow(festival, [], { day: '2026-10-17', minutes: 19 * 60 + 40 })
    expect(summary).toMatchObject({ kind: 'during', next: { id: 'c' }, nextIsFavorite: false, minutesUntilNext: 20 })
  })
})
