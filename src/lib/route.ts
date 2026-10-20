export const TABS = ['timetable', 'map', 'info', 'manage'] as const
export type Tab = (typeof TABS)[number]

export interface Route {
  tab: Tab
  params: URLSearchParams
}

const isTab = (value: string): value is Tab => (TABS as readonly string[]).includes(value)

export function parseHash(hash: string): Route {
  const [path = '', query = ''] = hash.replace(/^#\/?/, '').split('?')
  return { tab: isTab(path) ? path : 'timetable', params: new URLSearchParams(query) }
}

export function buildHash(tab: Tab, params: Record<string, string | undefined> = {}): string {
  const entries = Object.entries(params).filter((entry): entry is [string, string] => Boolean(entry[1]))
  const query = new URLSearchParams(entries).toString()
  return `#/${tab}${query ? `?${query}` : ''}`
}
