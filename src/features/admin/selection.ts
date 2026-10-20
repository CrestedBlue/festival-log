import type { FestivalOverview, SeriesOverview } from './overview'

export const ADMIN_VIEWS = ['timetable', 'map', 'notices'] as const
export type AdminView = (typeof ADMIN_VIEWS)[number]
export type AdminSection = 'festivals' | 'cs'

export interface AdminSelection {
  section: AdminSection
  /** Festival code shown on the right; null when there are no festivals. */
  series: string | null
  /** Year of the edition whose timetable and notices are shown; null when the festival has none yet. */
  year: string | null
  view: AdminView
}

const isView = (value: string | null): value is AdminView => (ADMIN_VIEWS as readonly (string | null)[]).includes(value)

/** Timetable (or, before it, the line-up) first, else the map: the same rule as the app. */
const homeView = (edition: FestivalOverview | null): AdminView =>
  edition && (edition.performanceCount > 0 || edition.lineup.length > 0) ? 'timetable' : 'map'

/** The edition that has not ended and starts soonest. */
const nextEdition = (editions: readonly FestivalOverview[], today: string) =>
  [...editions].filter((e) => e.endDate >= today).sort((a, b) => a.startDate.localeCompare(b.startDate))[0] ?? null

/** The festival whose next edition comes first; the first festival when none is coming. */
function defaultSeries(series: readonly SeriesOverview[], today: string): SeriesOverview | null {
  const upcoming = series
    .map((s) => ({ s, next: nextEdition(s.editions, today) }))
    .filter((x) => x.next !== null)
    .sort((a, b) => (a.next?.startDate ?? '').localeCompare(b.next?.startDate ?? ''))
  return upcoming[0]?.s ?? series[0] ?? null
}

export function resolveSelection(query: URLSearchParams, series: readonly SeriesOverview[], today: string): AdminSelection {
  const chosen = series.find((s) => s.code === query.get('festival')) ?? defaultSeries(series, today)
  const editions = chosen?.editions ?? []
  // Editions are newest first, so without an upcoming one the latest is shown.
  const edition = editions.find((e) => e.year === query.get('year')) ?? nextEdition(editions, today) ?? editions[0] ?? null
  const view = query.get('view')
  return {
    section: query.get('tab') === 'cs' ? 'cs' : 'festivals',
    series: chosen?.code ?? null,
    year: edition?.year ?? null,
    view: isView(view) ? view : homeView(edition),
  }
}

/** The festival choice stays in the address on the CS tab too, so coming back shows the same festival. */
export function selectionQuery({ section, series, year, view }: AdminSelection): string {
  const params = new URLSearchParams()
  if (section === 'cs') params.set('tab', 'cs')
  if (series) params.set('festival', series)
  if (year) params.set('year', year)
  params.set('view', view)
  return `?${params.toString()}`
}
