import type { Festival } from '../data/schema'

export const TABS = ['timetable', 'map', 'info', 'manage'] as const
export type Tab = (typeof TABS)[number]

export interface Route {
  tab: Tab
  params: URLSearchParams
}

const isTab = (value: string): value is Tab => (TABS as readonly string[]).includes(value)

/** A hash that names no tab (first launch, a home-screen icon) opens `home`. */
export function parseHash(hash: string, home: Tab = 'timetable'): Route {
  const [path = '', query = ''] = hash.replace(/^#\/?/, '').split('?')
  return { tab: isTab(path) ? path : home, params: new URLSearchParams(query) }
}

/**
 * Where the app opens: the timetable tab while it has something to show (the timetable, or before that the
 * line-up), otherwise the map.
 */
export const homeTab = (festival: Pick<Festival, 'performances'> | null, lineupCount = 0): Tab =>
  festival && festival.performances.length === 0 && lineupCount === 0 ? 'map' : 'timetable'

export function buildHash(tab: Tab, params: Record<string, string | undefined> = {}): string {
  const entries = Object.entries(params).filter((entry): entry is [string, string] => Boolean(entry[1]))
  const query = new URLSearchParams(entries).toString()
  return `#/${tab}${query ? `?${query}` : ''}`
}

/** The admin catalog page lives at <base>manage/ (a separate page, not an app tab). */
export const isAdminPath = (pathname: string, base: string): boolean =>
  pathname === `${base}manage` || pathname.startsWith(`${base}manage/`)
