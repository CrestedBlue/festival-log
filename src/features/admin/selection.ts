import type { FestivalOverview } from './overview'

export const ADMIN_VIEWS = ['timetable', 'map', 'notices'] as const
export type AdminView = (typeof ADMIN_VIEWS)[number]

export interface AdminSelection {
  year: string
  /** Yearly code of the festival shown on the right; null when the year has none. */
  festivalKey: string | null
  view: AdminView
}

const isView = (value: string | null): value is AdminView => (ADMIN_VIEWS as readonly (string | null)[]).includes(value)

/** Years with catalog festivals plus this year and next (to plan ahead), newest first. */
export function adminYears(rows: readonly FestivalOverview[], today: string): string[] {
  const thisYear = Number(today.slice(0, 4))
  const years = new Set([...rows.map((r) => r.year).filter(Boolean), String(thisYear), String(thisYear + 1)])
  return [...years].sort((a, b) => b.localeCompare(a))
}

export const festivalsOfYear = (rows: readonly FestivalOverview[], year: string): FestivalOverview[] =>
  rows.filter((r) => r.year === year).sort((a, b) => a.startDate.localeCompare(b.startDate))

/** Timetable (or, before it, the line-up) first, else the map — same rule as the app. */
const homeView = (row: FestivalOverview): AdminView =>
  row.performanceCount > 0 || row.lineup.length > 0 ? 'timetable' : 'map'

/** The next festival that has not ended yet, else the year's last one. */
const defaultFestival = (inYear: readonly FestivalOverview[], today: string) =>
  inYear.find((r) => r.endDate >= today) ?? inYear.at(-1) ?? null

export function resolveSelection(query: URLSearchParams, rows: readonly FestivalOverview[], today: string): AdminSelection {
  const years = adminYears(rows, today)
  const requested = rows.find((r) => r.key === query.get('festival')) ?? null
  const queryYear = query.get('year')
  const thisYear = today.slice(0, 4)
  const year = queryYear && years.includes(queryYear) ? queryYear : (requested?.year ?? thisYear)
  const inYear = festivalsOfYear(rows, year)
  const festival = requested && requested.year === year ? requested : defaultFestival(inYear, today)
  const view = query.get('view')
  return {
    year,
    festivalKey: festival?.key ?? null,
    view: isView(view) ? view : festival ? homeView(festival) : 'timetable',
  }
}

export function selectionQuery({ year, festivalKey, view }: AdminSelection): string {
  const params = new URLSearchParams({ year })
  if (festivalKey) {
    params.set('festival', festivalKey)
    params.set('view', view)
  }
  return `?${params.toString()}`
}
