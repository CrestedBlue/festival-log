import type { AppData, Festival, Performance, Pin, Stage } from './schema'

type FestivalPatch = Partial<Pick<Festival, 'name' | 'startDate' | 'endDate' | 'venue'>>

const mapFestival = (data: AppData, festivalId: string, fn: (f: Festival) => Festival): AppData => ({
  ...data,
  festivals: data.festivals.map((f) => (f.id === festivalId ? fn(f) : f)),
})

const dropFavorites = (data: AppData, removedIds: ReadonlySet<string>): AppData =>
  removedIds.size === 0 ? data : { ...data, favorites: data.favorites.filter((id) => !removedIds.has(id)) }

export const addFestival = (data: AppData, festival: Festival): AppData => ({
  ...data,
  festivals: [...data.festivals, festival],
  activeFestivalId: festival.id,
})

export const updateFestival = (data: AppData, festivalId: string, patch: FestivalPatch): AppData =>
  mapFestival(data, festivalId, (f) => ({ ...f, ...patch }))

export const setActiveFestival = (data: AppData, festivalId: string): AppData => ({
  ...data,
  activeFestivalId: festivalId,
})

export function removeFestival(data: AppData, festivalId: string): AppData {
  const target = data.festivals.find((f) => f.id === festivalId)
  if (!target) return data
  const festivals = data.festivals.filter((f) => f.id !== festivalId)
  const activeFestivalId =
    data.activeFestivalId === festivalId ? (festivals[0]?.id ?? null) : data.activeFestivalId
  return dropFavorites({ ...data, festivals, activeFestivalId }, new Set(target.performances.map((p) => p.id)))
}

export const addStage = (data: AppData, festivalId: string, stage: Stage): AppData =>
  mapFestival(data, festivalId, (f) => ({ ...f, stages: [...f.stages, stage] }))

export function removeStage(data: AppData, festivalId: string, stageId: string): AppData {
  const festival = data.festivals.find((f) => f.id === festivalId)
  const removed = new Set(festival?.performances.filter((p) => p.stageId === stageId).map((p) => p.id))
  const next = mapFestival(data, festivalId, (f) => ({
    ...f,
    stages: f.stages.filter((s) => s.id !== stageId),
    performances: f.performances.filter((p) => p.stageId !== stageId),
  }))
  return dropFavorites(next, removed)
}

export const addPerformances = (data: AppData, festivalId: string, list: readonly Performance[]): AppData =>
  mapFestival(data, festivalId, (f) => ({ ...f, performances: [...f.performances, ...list] }))

export const removePerformance = (data: AppData, festivalId: string, performanceId: string): AppData =>
  dropFavorites(
    mapFestival(data, festivalId, (f) => ({
      ...f,
      performances: f.performances.filter((p) => p.id !== performanceId),
    })),
    new Set([performanceId]),
  )

export const toggleFavorite = (data: AppData, performanceId: string): AppData => ({
  ...data,
  favorites: data.favorites.includes(performanceId)
    ? data.favorites.filter((id) => id !== performanceId)
    : [...data.favorites, performanceId],
})

export const addPin = (data: AppData, festivalId: string, pin: Pin): AppData =>
  mapFestival(data, festivalId, (f) => ({ ...f, pins: [...f.pins, pin] }))

export const removePin = (data: AppData, festivalId: string, pinId: string): AppData =>
  mapFestival(data, festivalId, (f) => ({ ...f, pins: f.pins.filter((p) => p.id !== pinId) }))

/** True when the incoming festival reuses performance ids from a different festival (favorites would get mixed up). */
export function hasIdCollision(data: AppData, festival: Festival): boolean {
  const incoming = new Set(festival.performances.map((p) => p.id))
  return data.festivals.some(
    (f) => f.id !== festival.id && f.performances.some((p) => incoming.has(p.id)),
  )
}

/** Same id = a friend's updated copy of the same festival, so replace it in place. */
export function importFestival(data: AppData, festival: Festival): AppData {
  const exists = data.festivals.some((f) => f.id === festival.id)
  const festivals = exists
    ? data.festivals.map((f) => (f.id === festival.id ? festival : f))
    : [...data.festivals, festival]
  return { ...data, festivals, activeFestivalId: festival.id }
}
