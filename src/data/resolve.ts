import { catalogEntry } from './catalog'
import type { Festival, UserData } from './schema'

export interface ResolvedFestival {
  source: 'catalog' | 'archived'
  /** Catalog festivals come with the user's own pins appended. */
  festival: Festival
  notices: readonly string[]
}

const built = new Map<string, Festival>()
// Catalog festivals are immutable app data: build each once per session.
const catalogFestival = (id: string): Festival | null => {
  const entry = catalogEntry(id)
  if (!entry) return null
  if (!built.has(id)) built.set(id, entry.create())
  return built.get(id) ?? null
}

export function resolveFestival(data: UserData, festivalId: string): ResolvedFestival | null {
  const fromCatalog = catalogFestival(festivalId)
  if (fromCatalog) {
    const own = data.userPins[festivalId] ?? []
    return {
      source: 'catalog',
      festival: own.length ? { ...fromCatalog, pins: [...fromCatalog.pins, ...own] } : fromCatalog,
      notices: catalogEntry(festivalId)?.notices ?? [],
    }
  }
  const archived = data.archivedFestivals.find((f) => f.id === festivalId)
  return archived ? { source: 'archived', festival: archived, notices: [] } : null
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
