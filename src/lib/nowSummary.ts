import type { Festival, Performance } from '../data/schema'
import { nowPlaying, performanceSpan, upNext } from './schedule'
import { dayDiff, type FestivalMoment } from './time'

export type NowSummary =
  | { kind: 'before'; daysLeft: number }
  | { kind: 'after' }
  | {
      kind: 'during'
      playing: Performance[]
      next: Performance | null
      nextIsFavorite: boolean
      minutesUntilNext: number | null
    }

export function summarizeNow(festival: Festival, favorites: readonly string[], moment: FestivalMoment): NowSummary {
  if (moment.day < festival.startDate) return { kind: 'before', daysLeft: dayDiff(moment.day, festival.startDate) }
  if (moment.day > festival.endDate) return { kind: 'after' }

  const favoriteSet = new Set(favorites)
  const isFavorite = (p: Performance) => favoriteSet.has(p.id)
  const playing = nowPlaying(festival.performances, moment)
  const nextFavorite = upNext(festival.performances.filter(isFavorite), moment, 1)[0]
  const next = nextFavorite ?? upNext(festival.performances, moment, 1)[0] ?? null

  return {
    kind: 'during',
    playing: [...playing.filter(isFavorite), ...playing.filter((p) => !isFavorite(p))],
    next,
    nextIsFavorite: Boolean(nextFavorite),
    minutesUntilNext: next ? performanceSpan(next).start - moment.minutes : null,
  }
}
