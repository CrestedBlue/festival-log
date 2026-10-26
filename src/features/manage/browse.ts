import type { Festival } from '../../data/schema'
import { weekdayLabel } from '../../lib/time'

const normalize = (text: string) => text.replace(/\s+/g, '').toLowerCase()

/**
 * The artists a line-up poster's text names: its alt text reads "…포스터: A, B, C 외. dates, venue", so the names are
 * what comes after the colon, up to " 외" or the end of the first sentence.
 */
function lineupNames(lineup: readonly string[]): string[] {
  return lineup.flatMap((text) => {
    const names = text.slice(text.indexOf(':') + 1).split(/\s외[.\s]|\.\s/)[0] ?? ''
    return names.split(',').map((name) => name.trim()).filter(Boolean)
  })
}

/** The artists of a festival whose names contain the query: from its timetable, else from its line-up posters. */
function matchingArtists(festival: Festival, q: string, lineup: readonly string[]): string[] {
  const fromSets = [...new Set(festival.performances.map((p) => p.artist))].filter((artist) => normalize(artist).includes(q))
  return fromSets.length > 0 ? fromSets : lineupNames(lineup).filter((name) => normalize(name).includes(q))
}

/**
 * Name, venue or an artist (in its timetable, or on its line-up posters: their alt texts in `lineup`) contains the
 * query, ignoring spaces and letter case.
 */
export function matchesQuery(festival: Festival, query: string, lineup: readonly string[] = []): boolean {
  const q = normalize(query)
  return q === '' || normalize(festival.name).includes(q) || normalize(festival.venue.name).includes(q) || matchingArtists(festival, q, lineup).length > 0
}

/** What a search found among the festival's artists, for its row ("NELL 출연", "Roselia·Ro Ro 외 1팀 출연"); null if none. */
export function artistHit(festival: Festival, query: string, lineup: readonly string[] = []): string | null {
  const q = normalize(query)
  if (q === '') return null
  const names = matchingArtists(festival, q, lineup)
  if (names.length === 0) return null
  const more = names.length - 2
  return `${names.slice(0, 2).join('·')}${more > 0 ? ` 외 ${more}팀` : ''} 출연`
}

export interface MonthGroup {
  label: string
  festivals: Festival[]
}

const TBD_LABEL = '날짜 미정'

/** Festivals by start month, latest first (with the year in the label when several years are listed:
 *  `withYear`); festivals whose dates are not out come last. */
export function groupByMonth(festivals: readonly Festival[], { withYear = false } = {}): MonthGroup[] {
  const byLatest = [...festivals].sort((a, b) => b.startDate.localeCompare(a.startDate))
  const groups = new Map<string, Festival[]>()
  for (const festival of byLatest.filter((f) => !f.datesTbd)) {
    const month = `${Number(festival.startDate.slice(5, 7))}월`
    const label = withYear ? `${festival.startDate.slice(0, 4)}년 ${month}` : month
    groups.set(label, [...(groups.get(label) ?? []), festival])
  }
  const tbd = byLatest.filter((f) => f.datesTbd)
  return [
    ...[...groups.entries()].map(([label, list]) => ({ label, festivals: list })),
    ...(tbd.length > 0 ? [{ label: TBD_LABEL, festivals: tbd }] : []),
  ]
}

/** The small calendar square in a festival row: weekday on top, first day below. */
export function calendarTile(festival: Festival): { weekday: string; day: string } {
  if (festival.datesTbd) return { weekday: '미정', day: '–' }
  return { weekday: weekdayLabel(festival.startDate), day: String(Number(festival.startDate.slice(8, 10))) }
}

export const hasEnded = (festival: Festival, today: string): boolean => !festival.datesTbd && festival.endDate < today
