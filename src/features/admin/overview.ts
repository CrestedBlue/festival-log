import type { CatalogEntry } from '../../data/catalog'
import { FestivalSchema, type Festival } from '../../data/schema'
import { formatPeriod } from '../../lib/period'
import { listDays } from '../../lib/time'
import { festivalMapFor } from '../map/festivalMaps'

export interface FestivalOverview {
  id: string
  key: string
  name: string
  period: string
  venue: string
  startDate: string
  /** null while the dates are not announced. */
  days: number | null
  stageCount: number
  performanceCount: number
  pinCount: number
  noticeCount: number
  notices: readonly string[]
  hasIllustratedMap: boolean
  /** What users can't see yet: 날짜, 타임테이블, 주의사항. */
  missing: string[]
  /** Schema errors, or why the festival could not be built. */
  problems: string[]
}

function missingParts(festival: Festival, notices: readonly string[]): string[] {
  return [
    festival.datesTbd ? '날짜' : null,
    festival.performances.length === 0 ? '타임테이블' : null,
    notices.length === 0 ? '주의사항' : null,
  ].filter((part): part is string => part !== null)
}

function overviewOf(entry: CatalogEntry): FestivalOverview {
  const base = { id: entry.id, key: entry.key, notices: entry.notices, noticeCount: entry.notices.length }
  let festival: Festival
  try {
    festival = entry.create()
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return {
      ...base,
      name: entry.key,
      period: '',
      venue: '',
      startDate: '',
      days: null,
      stageCount: 0,
      performanceCount: 0,
      pinCount: 0,
      hasIllustratedMap: false,
      missing: [],
      problems: [`만들지 못했어요: ${message}`],
    }
  }
  const parsed = FestivalSchema.safeParse(festival)
  return {
    ...base,
    name: festival.name,
    period: formatPeriod(festival),
    venue: festival.venue.name,
    startDate: festival.startDate,
    days: festival.datesTbd ? null : listDays(festival.startDate, festival.endDate).length,
    stageCount: festival.stages.length,
    performanceCount: festival.performances.length,
    pinCount: festival.pins.length,
    hasIllustratedMap: festivalMapFor(festival.id) !== null,
    missing: missingParts(festival, entry.notices),
    problems: parsed.success ? [] : parsed.error.issues.map((issue) => issue.message),
  }
}

/** Every catalog festival as the admin page shows it, the one that starts last first. */
export const catalogOverview = (entries: readonly CatalogEntry[]): FestivalOverview[] =>
  entries.map(overviewOf).sort((a, b) => b.startDate.localeCompare(a.startDate))
