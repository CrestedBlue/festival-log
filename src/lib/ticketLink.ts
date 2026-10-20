const MAX_LINK_LENGTH = 500
const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:/i

/** A ticket link the user typed: http(s) only (never javascript: etc.), https:// added when missing. */
export function parseTicketLink(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null
  let url: URL
  try {
    url = new URL(HAS_SCHEME.test(trimmed) ? trimmed : `https://${trimmed}`)
  } catch {
    return null
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
  const value = url.toString()
  return value.length > MAX_LINK_LENGTH ? null : value
}

/** What the link shows as: host and path, no scheme. */
export function linkLabel(link: string): string {
  const url = new URL(link)
  return `${url.host}${url.pathname === '/' ? '' : url.pathname}${url.search}`
}
