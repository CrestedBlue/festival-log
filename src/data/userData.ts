import type { Pin, UserData } from './schema'

const without = <T>(record: Readonly<Record<string, T>>, key: string): Record<string, T> =>
  Object.fromEntries(Object.entries(record).filter(([k]) => k !== key))

export const addMyFestival = (data: UserData, festivalId: string): UserData => ({
  ...data,
  myFestivalIds: data.myFestivalIds.includes(festivalId) ? data.myFestivalIds : [...data.myFestivalIds, festivalId],
  activeFestivalId: festivalId,
})

/** Removes a festival from my list with everything the user kept for it (favorites stay: they are harmless ids). */
export function removeMyFestival(data: UserData, festivalId: string): UserData {
  const myFestivalIds = data.myFestivalIds.filter((id) => id !== festivalId)
  return {
    ...data,
    myFestivalIds,
    activeFestivalId: data.activeFestivalId === festivalId ? (myFestivalIds[0] ?? null) : data.activeFestivalId,
    userPins: without(data.userPins, festivalId),
    ticketLinks: without(data.ticketLinks, festivalId),
    archivedFestivals: data.archivedFestivals.filter((f) => f.id !== festivalId),
  }
}

export const setActiveFestival = (data: UserData, festivalId: string): UserData =>
  data.myFestivalIds.includes(festivalId) ? { ...data, activeFestivalId: festivalId } : data

export const toggleFavorite = (data: UserData, performanceId: string): UserData => ({
  ...data,
  favorites: data.favorites.includes(performanceId)
    ? data.favorites.filter((id) => id !== performanceId)
    : [...data.favorites, performanceId],
})

export const addUserPin = (data: UserData, festivalId: string, pin: Pin): UserData => ({
  ...data,
  userPins: { ...data.userPins, [festivalId]: [...(data.userPins[festivalId] ?? []), pin] },
})

export const removeUserPin = (data: UserData, festivalId: string, pinId: string): UserData => ({
  ...data,
  userPins: { ...data.userPins, [festivalId]: (data.userPins[festivalId] ?? []).filter((p) => p.id !== pinId) },
})

/** `null` clears the link. Callers validate with parseTicketLink first. */
export const setTicketLink = (data: UserData, festivalId: string, url: string | null): UserData => ({
  ...data,
  ticketLinks: url ? { ...data.ticketLinks, [festivalId]: url } : without(data.ticketLinks, festivalId),
})
