import { catalogEntry } from './catalog'
import type { GuideSet } from './catalog/guide'
import type { LineupImage } from './catalog/lineup'
import { SERIES } from './catalog/series'
import type { CollectionSource, FestivalTheme } from './catalog/series/types'
import type { Festival, UserData } from './schema'

export interface ResolvedFestival {
  source: 'catalog' | 'archived'
  /** Catalog festivals come with the user's own pins appended. */
  festival: Festival
  notices: readonly string[]
  /** Line-up posters while there is no timetable (catalog only). */
  lineup: readonly LineupImage[]
  /** Official guide pages for the info tab (catalog only). */
  guides: readonly GuideSet[]
  /** The festival's official channels (Instagram, website), shown on the info tab (catalog only). */
  sources: readonly CollectionSource[]
  /** The festival's own design: main color, title picture, stage looks (catalog only). */
  theme: FestivalTheme | null
  /** Festival code and year, shown above the title as "GMF 2026" (catalog only). */
  edition: { series: string; year: string } | null
}

const built = new Map<string, Festival>()
// Catalog festivals are immutable app data: build each once per session.
export const catalogFestival = (id: string): Festival | null => {
  const entry = catalogEntry(id)
  if (!entry) return null
  if (!built.has(id)) built.set(id, entry.create())
  return built.get(id) ?? null
}

export function resolveFestival(data: UserData, festivalId: string): ResolvedFestival | null {
  const fromCatalog = catalogFestival(festivalId)
  const entry = catalogEntry(festivalId)
  if (fromCatalog && entry) {
    const own = data.userPins[festivalId] ?? []
    const series = SERIES[entry.series]
    return {
      source: 'catalog',
      festival: own.length ? { ...fromCatalog, pins: [...fromCatalog.pins, ...own] } : fromCatalog,
      notices: entry.notices,
      lineup: entry.lineup,
      guides: entry.guides,
      sources: series?.sources ?? [],
      theme: series?.theme ?? null,
      // The yearly code is the festival code plus the year ("gmf2026").
      edition: { series: entry.series, year: entry.key.slice(entry.series.length) },
    }
  }
  const archived = data.archivedFestivals.find((f) => f.id === festivalId)
  return archived
    ? { source: 'archived', festival: archived, notices: [], lineup: [], guides: [], sources: [], theme: null, edition: null }
    : null
}

export function activeFestival(data: UserData): ResolvedFestival | null {
  const ids = data.activeFestivalId ? [data.activeFestivalId, ...data.myFestivalIds] : data.myFestivalIds
  for (const id of ids) {
    if (!data.myFestivalIds.includes(id)) continue
    const resolved = resolveFestival(data, id)
    if (resolved) return resolved
  }
  return null
}
