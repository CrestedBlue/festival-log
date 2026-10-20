import type { Festival } from '../../data/schema'
import { weekdayLabel } from '../../lib/time'

const normalize = (text: string) => text.replace(/\s+/g, '').toLowerCase()

/** Name or venue contains the query, ignoring spaces and letter case. */
export function matchesQuery(festival: Festival, query: string): boolean {
  const q = normalize(query)
  return q === '' || normalize(festival.name).includes(q) || normalize(festival.venue.name).includes(q)
}

export interface MonthGroup {
  label: string
  festivals: Festival[]
}

const TBD_LABEL = '날짜 미정'

/** One year's festivals by start month, latest first; festivals whose dates are not out come last. */
export function groupByMonth(festivals: readonly Festival[]): MonthGroup[] {
  const byLatest = [...festivals].sort((a, b) => b.startDate.localeCompare(a.startDate))
  const groups = new Map<string, Festival[]>()
  for (const festival of byLatest.filter((f) => !f.datesTbd)) {
    const label = `${Number(festival.startDate.slice(5, 7))}월`
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
