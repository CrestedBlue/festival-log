import type { Performance } from '../data/schema'
import { DAY_CUTOFF_MINUTES, MINUTES_PER_DAY, parseClock, toFestivalMinutes, type FestivalMoment } from './time'

const DEFAULT_RANGE = { start: 12 * 60, end: 23 * 60 } as const
/** Anything longer is almost certainly a typo like 20:00-19:00. */
export const MAX_SET_MINUTES = 12 * 60

export interface Span {
  start: number
  end: number
}

/**
 * Festival-minute span of a set, or null when the clocks are malformed or the set is impossible.
 * The end is rolled forward to the first time after the start, so 04:00-06:00 and 23:30-01:00 both work.
 */
export function spanOf(start: string, end: string): Span | null {
  const startWall = parseClock(start)
  const endWall = parseClock(end)
  if (startWall === null || endWall === null) return null
  const startMinutes = startWall < DAY_CUTOFF_MINUTES ? startWall + MINUTES_PER_DAY : startWall
  let endMinutes = endWall
  while (endMinutes <= startMinutes) endMinutes += MINUTES_PER_DAY
  return endMinutes - startMinutes > MAX_SET_MINUTES ? null : { start: startMinutes, end: endMinutes }
}

export function performanceSpan(p: Pick<Performance, 'start' | 'end'>): Span {
  const span = spanOf(p.start, p.end)
  if (!span) throw new Error(`잘못된 공연 시간: ${p.start}-${p.end}`)
  return span
}

export function sortByStart<T extends Pick<Performance, 'start' | 'day'>>(list: readonly T[]): T[] {
  return [...list].sort(
    (a, b) => a.day.localeCompare(b.day) || toFestivalMinutes(a.start) - toFestivalMinutes(b.start),
  )
}

const overlaps = (a: Span, b: Span) => a.start < b.end && b.start < a.end

export function findConflicts(list: readonly Performance[]): Set<string> {
  const conflicts = new Set<string>()
  list.forEach((a, i) => {
    list.slice(i + 1).forEach((b) => {
      if (a.day === b.day && overlaps(performanceSpan(a), performanceSpan(b))) {
        conflicts.add(a.id)
        conflicts.add(b.id)
      }
    })
  })
  return conflicts
}

export function nowPlaying(list: readonly Performance[], moment: FestivalMoment): Performance[] {
  return sortByStart(
    list.filter((p) => {
      if (p.day !== moment.day) return false
      const span = performanceSpan(p)
      return span.start <= moment.minutes && moment.minutes < span.end
    }),
  )
}

export function upNext(list: readonly Performance[], moment: FestivalMoment, limit: number): Performance[] {
  return sortByStart(
    list.filter((p) => p.day === moment.day && performanceSpan(p).start >= moment.minutes),
  ).slice(0, limit)
}

export function timelineRange(list: readonly Performance[]): Span {
  if (list.length === 0) return { ...DEFAULT_RANGE }
  const spans = list.map(performanceSpan)
  const start = Math.min(...spans.map((s) => s.start))
  const end = Math.max(...spans.map((s) => s.end))
  return {
    start: Math.floor(start / 60) * 60,
    end: Math.ceil(end / 60) * 60,
  }
}
