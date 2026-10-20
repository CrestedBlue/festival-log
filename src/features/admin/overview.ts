import type { CatalogEntry } from '../../data/catalog'
import { FestivalSchema, type Festival } from '../../data/schema'
import { formatPeriod } from '../../lib/period'
import { listDays } from '../../lib/time'

export interface FestivalOverview {
  id: string
  /** Festival code, the same every year (e.g. "herorock"). */
  series: string
  /** Yearly code (e.g. "herorock2026"). */
  key: string
  name: string
  period: string
  venue: string
  year: string
  startDate: string
  endDate: string
  /** null while the dates are not announced. */
  days: number | null
  stageCount: number
  performanceCount: number
  pinCount: number
  notices: readonly string[]
  /** What users can't see yet: 날짜, 타임테이블, 주의사항. */
  missing: string[]
  /** Schema errors, or why the festival could not be built. */
  problems: string[]
  /** null when the catalog entry failed to build. */
  festival: Festival | null
}

function missingParts(festival: Festival, notices: readonly string[]): string[] {
  return [
    festival.datesTbd ? '날짜' : null,
    festival.performances.length === 0 ? '타임테이블' : null,
    notices.length === 0 ? '주의사항' : null,
  ].filter((part): part is string => part !== null)
}

function brokenOverview(entry: CatalogEntry, error: unknown): FestivalOverview {
  const message = error instanceof Error ? error.message : String(error)
  // The yearly code ends in the year, so the festival still lands under the right year.
  const year = entry.key.match(/\d{4}$/)?.[0] ?? ''
  const day = year ? `${year}-01-01` : ''
  return {
    id: entry.id,
    series: entry.series,
    key: entry.key,
    name: entry.key,
    period: '',
    venue: '',
    year,
    startDate: day,
    endDate: day,
    days: null,
    stageCount: 0,
    performanceCount: 0,
    pinCount: 0,
    notices: entry.notices,
    missing: [],
    problems: [`만들지 못했어요: ${message}`],
    festival: null,
  }
}

function overviewOf(entry: CatalogEntry): FestivalOverview {
  let festival: Festival
  try {
    festival = entry.create()
  } catch (error) {
    return brokenOverview(entry, error)
  }
  const parsed = FestivalSchema.safeParse(festival)
  return {
    id: entry.id,
    series: entry.series,
    key: entry.key,
    name: festival.name,
    period: formatPeriod(festival),
    venue: festival.venue.name,
    year: festival.startDate.slice(0, 4),
    startDate: festival.startDate,
    endDate: festival.endDate,
    days: festival.datesTbd ? null : listDays(festival.startDate, festival.endDate).length,
    stageCount: festival.stages.length,
    performanceCount: festival.performances.length,
    pinCount: festival.pins.length,
    notices: entry.notices,
    missing: missingParts(festival, entry.notices),
    problems: parsed.success ? [] : parsed.error.issues.map((issue) => issue.message),
    festival,
  }
}

/** Every catalog festival as the admin page shows it (catalog order). */
export const catalogOverview = (entries: readonly CatalogEntry[]): FestivalOverview[] => entries.map(overviewOf)
