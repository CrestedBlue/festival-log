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
 * Tabs a catalog edition can keep closed until this year's are out: a new edition comes in with its timetable and
 * map closed (the user, 2026-11-07), and each opens when the collection brings it in (COLLECT.md).
 */
export type ClosableTab = Extract<Tab, 'timetable' | 'map'>

/**
 * Where the app opens: the timetable tab while it has something to show (the timetable, or before that the
 * line-up), otherwise the map — skipping the tabs the edition has not opened yet, down to the info tab.
 */
export function homeTab(festival: Pick<Festival, 'performances'> | null, lineupCount = 0, closed: readonly Tab[] = []): Tab {
  if (!festival) return 'timetable'
  const empty = festival.performances.length === 0 && lineupCount === 0
  const order: readonly Tab[] = empty ? ['map', 'timetable'] : ['timetable', 'map']
  return order.find((tab) => !closed.includes(tab)) ?? 'info'
}

/** The tabs about one festival: locked while there is none on my list. */
export const FESTIVAL_TABS: readonly Tab[] = ['timetable', 'map', 'info']

/**
 * The tab to show: as asked, except that with no festival to show the festival tabs are locked and the catalog (관리 >
 * 둘러보기) shows instead (the user's call, 2026-10-27), and a tab the edition has not opened yet shows `home`.
 */
export function shownTab(tab: Tab, hasFestival: boolean, closed: readonly Tab[] = [], home: Tab = 'info'): Tab {
  if (!hasFestival) return FESTIVAL_TABS.includes(tab) ? 'manage' : tab
  return closed.includes(tab) ? home : tab
}

export function buildHash(tab: Tab, params: Record<string, string | undefined> = {}): string {
  const entries = Object.entries(params).filter((entry): entry is [string, string] => Boolean(entry[1]))
  const query = new URLSearchParams(entries).toString()
  return `#/${tab}${query ? `?${query}` : ''}`
}

/** The admin catalog page lives at <base>manage/ (a separate page, not an app tab). */
export const isAdminPath = (pathname: string, base: string): boolean =>
  pathname === `${base}manage` || pathname.startsWith(`${base}manage/`)
