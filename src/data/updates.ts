import { catalogEntry } from './catalog'
import type { UserData } from './schema'

/**
 * New content on my festivals (a red dot on the manage tab and the festival's row): each catalog festival says when
 * it last got some (`updatedAt`), and the device keeps that date for each festival on my list as of when I last
 * opened it (`seenUpdates`). A newer catalog date means something was added since.
 */
type UpdatedAtOf = (festivalId: string) => string | null

/** The date a catalog festival last got new content; null for festivals not in the catalog. */
export const catalogUpdatedAt: UpdatedAtOf = (festivalId) => catalogEntry(festivalId)?.updatedAt ?? null

/** Whether a festival on my list got new content after I last opened it. */
export function hasNewContent(data: UserData, festivalId: string, updatedAtOf: UpdatedAtOf = catalogUpdatedAt): boolean {
  const updatedAt = updatedAtOf(festivalId)
  const seen = data.seenUpdates[festivalId]
  return data.myFestivalIds.includes(festivalId) && updatedAt !== null && seen !== undefined && seen < updatedAt
}

/** Whether any festival on my list has new content (the manage tab's dot). */
export const newContentAnywhere = (data: UserData, updatedAtOf: UpdatedAtOf = catalogUpdatedAt): boolean =>
  data.myFestivalIds.some((id) => hasNewContent(data, id, updatedAtOf))

/** Opening a festival (or adding it): what it has now counts as seen. */
export function markSeen(data: UserData, festivalId: string, updatedAtOf: UpdatedAtOf = catalogUpdatedAt): UserData {
  const updatedAt = updatedAtOf(festivalId)
  if (updatedAt === null || data.seenUpdates[festivalId] === updatedAt) return data
  return { ...data, seenUpdates: { ...data.seenUpdates, [festivalId]: updatedAt } }
}

/**
 * Festivals on my list without a date yet (saved before dates were kept) count as seen as they are now, so only
 * what is added from here on shows. Returns the same data when nothing is missing.
 */
export function fillSeenUpdates(data: UserData, updatedAtOf: UpdatedAtOf = catalogUpdatedAt): UserData {
  const missing = data.myFestivalIds.filter((id) => data.seenUpdates[id] === undefined && updatedAtOf(id) !== null)
  if (missing.length === 0) return data
  return { ...data, seenUpdates: { ...data.seenUpdates, ...Object.fromEntries(missing.map((id) => [id, updatedAtOf(id)!])) } }
}
