import { describe, expect, test } from 'vitest'
import type { Performance } from '../data/schema'
import { findConflicts, nowPlaying, performanceSpan, spanOf, timelineRange, upNext } from './schedule'

const perf = (id: string, start: string, end: string, day = '2026-10-17', stageId = 's1'): Performance => ({
  id,
  stageId,
  day,
  artist: `artist-${id}`,
  start,
  end,
})

describe('performanceSpan', () => {
  test('converts a set that crosses midnight into a continuous span', () => {
    expect(performanceSpan(perf('a', '23:30', '01:00'))).toEqual({ start: 1410, end: 1500 })
  })
})

describe('spanOf', () => {
  test('handles sets that end at or cross the 06:00 day cutoff', () => {
    expect(spanOf('04:00', '06:00')).toEqual({ start: 28 * 60, end: 30 * 60 })
    expect(spanOf('05:30', '06:30')).toEqual({ start: 29 * 60 + 30, end: 30 * 60 + 30 })
  })

  test('treats 24:00 as midnight', () => {
    expect(spanOf('23:00', '24:00')).toEqual({ start: 23 * 60, end: 24 * 60 })
  })

  test('returns null for backwards, overlong, or malformed sets', () => {
    expect(spanOf('20:00', '19:00')).toBeNull()
    expect(spanOf('18:00', '18:00')).toBeNull()
    expect(spanOf('25:99', '19:00')).toBeNull()
  })
})

describe('findConflicts', () => {
  test('flags overlapping performances on the same day', () => {
    const list = [perf('a', '18:00', '19:00'), perf('b', '18:30', '19:30'), perf('c', '20:00', '21:00')]
    expect([...findConflicts(list)].sort()).toEqual(['a', 'b'])
  })

  test('does not flag back-to-back sets or sets on different days', () => {
    const list = [perf('a', '18:00', '19:00'), perf('b', '19:00', '20:00'), perf('c', '18:30', '19:30', '2026-10-18')]
    expect(findConflicts(list).size).toBe(0)
  })
})

describe('nowPlaying / upNext', () => {
  const list = [
    perf('a', '18:00', '19:00'),
    perf('b', '18:30', '20:00', '2026-10-17', 's2'),
    perf('c', '21:00', '22:00'),
    perf('d', '20:00', '21:00'),
    perf('e', '18:30', '19:30', '2026-10-18'),
  ]

  test('returns the sets currently on stage for the festival day', () => {
    const ids = nowPlaying(list, { day: '2026-10-17', minutes: 18 * 60 + 45 }).map((p) => p.id)
    expect(ids).toEqual(['a', 'b'])
  })

  test('excludes a set at its exact end minute', () => {
    expect(nowPlaying(list, { day: '2026-10-17', minutes: 19 * 60 }).map((p) => p.id)).toEqual(['b'])
  })

  test('returns upcoming sets sorted by start time, limited', () => {
    const ids = upNext(list, { day: '2026-10-17', minutes: 19 * 60 }, 2).map((p) => p.id)
    expect(ids).toEqual(['d', 'c'])
  })
})

describe('timelineRange', () => {
  test('rounds the earliest start down and latest end up to whole hours', () => {
    expect(timelineRange([perf('a', '14:20', '15:10'), perf('b', '23:30', '00:40')])).toEqual({
      start: 14 * 60,
      end: 25 * 60,
    })
  })

  test('falls back to a default evening window when empty', () => {
    expect(timelineRange([])).toEqual({ start: 12 * 60, end: 23 * 60 })
  })
})
