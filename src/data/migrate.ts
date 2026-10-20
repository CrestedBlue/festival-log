import { catalogEntryForLegacyId } from './catalog'
import type { LegacyAppData, Pin, UserData } from './schema'

/**
 * Previous versions stored whole festivals on the device. Festivals that are now in the catalog keep only
 * what the user added to them (their pins); festivals the user typed in are kept read-only (archived).
 */
export function migrateV1(v1: LegacyAppData): UserData {
  const myFestivalIds: string[] = []
  const userPins: Record<string, Pin[]> = {}
  const archivedFestivals: UserData['archivedFestivals'] = []
  const idMap = new Map<string, string>()

  for (const festival of v1.festivals) {
    const entry = catalogEntryForLegacyId(festival.id)
    if (!entry) {
      archivedFestivals.push(festival)
      if (!myFestivalIds.includes(festival.id)) myFestivalIds.push(festival.id)
      continue
    }
    idMap.set(festival.id, entry.id)
    if (!myFestivalIds.includes(entry.id)) myFestivalIds.push(entry.id)
    const own = festival.pins.filter((pin) => !pin.id.startsWith(`${entry.key}-`))
    if (own.length > 0) userPins[entry.id] = [...(userPins[entry.id] ?? []), ...own]
  }

  const active = v1.activeFestivalId === null ? null : (idMap.get(v1.activeFestivalId) ?? v1.activeFestivalId)
  return {
    version: 2,
    myFestivalIds,
    activeFestivalId: active !== null && myFestivalIds.includes(active) ? active : (myFestivalIds[0] ?? null),
    favorites: v1.favorites,
    userPins,
    ticketLinks: {},
    archivedFestivals,
  }
}
