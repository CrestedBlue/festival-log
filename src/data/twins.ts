import { distanceMeters } from '../lib/geo'
import { CATALOG } from './catalog'
import { catalogFestival } from './resolve'
import type { Festival, Pin, UserData } from './schema'

// Two venue pins this close are the same place (a venue's own grounds easily span a few hundred metres).
const SAME_PLACE_METERS = 1000

const normalizeName = (name: string) => name.replace(/\s+/g, '').toLowerCase()

/**
 * Same dates at the same place. The place matches by venue name (spacing ignored) or by venue pin, since
 * festivals typed into older versions often kept the previous festival's pin and only had the name typed.
 */
export function isSameFestival(a: Festival, b: Festival): boolean {
  if (a.datesTbd || b.datesTbd) return false
  if (a.startDate !== b.startDate || a.endDate !== b.endDate) return false
  const nameA = normalizeName(a.venue.name)
  const nameB = normalizeName(b.venue.name)
  return (nameA !== '' && nameA === nameB) || distanceMeters(a.venue, b.venue) < SAME_PLACE_METERS
}

const uniqueById = (pins: readonly Pin[]): Pin[] => pins.filter((pin, i) => pins.findIndex((p) => p.id === pin.id) === i)

const findCatalogTwin = (festival: Festival): Festival | null =>
  CATALOG.map((entry) => catalogFestival(entry.id)).find((f): f is Festival => f !== null && isSameFestival(f, festival)) ??
  null

function mergeInto(data: UserData, own: Festival, catalogId: string): UserData {
  const swap = (id: string) => (id === own.id ? catalogId : id)
  const myFestivalIds = data.myFestivalIds.map(swap).filter((id, i, ids) => ids.indexOf(id) === i)
  const { [own.id]: ownPins = [], ...otherPins } = data.userPins
  const { [own.id]: ownLink, ...otherLinks } = data.ticketLinks
  const link = otherLinks[catalogId] ?? ownLink
  return {
    ...data,
    myFestivalIds,
    activeFestivalId: data.activeFestivalId === null ? null : swap(data.activeFestivalId),
    // Everything pinned on the festival the user made is the user's own: keep it on the catalog festival.
    userPins: { ...otherPins, [catalogId]: uniqueById([...(otherPins[catalogId] ?? []), ...own.pins, ...ownPins]) },
    ticketLinks: link ? { ...otherLinks, [catalogId]: link } : otherLinks,
    archivedFestivals: data.archivedFestivals.filter((f) => f.id !== own.id),
  }
}

/**
 * A festival the user typed in with an older version that the catalog now has too (same dates, same place)
 * becomes the catalog festival: one entry in my list, with the user's pins and ticket link carried over.
 * The catalog's schedule wins. Returns `data` itself when nothing matches.
 */
export function mergeCatalogTwins(data: UserData): UserData {
  return data.archivedFestivals.reduce((acc, own) => {
    const twin = findCatalogTwin(own)
    return twin ? mergeInto(acc, own, twin.id) : acc
  }, data)
}
