import { ARTIST_NAMES } from '../../data/catalog/artists'
import type { Festival } from '../../data/schema'

const normalize = (text: string) => text.replace(/\s+/g, '').toLowerCase()

/**
 * The artists a line-up poster's text names: its alt text reads "…포스터: A, B, C 외. dates, venue", so the names are
 * what comes after the colon, up to " 외" or the end of the first sentence.
 */
function lineupNames(lineup: readonly string[]): string[] {
  return lineup.flatMap((text) => {
    const names = text.slice(text.indexOf(':') + 1).split(/\s외[.\s]|\.\s/)[0] ?? ''
    return names.split(',').map((name) => name.trim()).filter(Boolean)
  })
}

// every name of an artist (data/catalog/artists.ts), by any of its names
const NAMES_OF = new Map(ARTIST_NAMES.flatMap((names) => names.map((name) => [normalize(name), names] as const)))
const namesOf = (artist: string): readonly string[] => NAMES_OF.get(normalize(artist)) ?? [artist]

interface ArtistMatch {
  artist: string
  /** The other name it was found by, when not its own. */
  alias: string | null
}

/** An artist the query finds, by its own name or by another one it goes by. */
function matchArtist(artist: string, q: string): ArtistMatch | null {
  if (normalize(artist).includes(q)) return { artist, alias: null }
  const alias = namesOf(artist).find((name) => normalize(name).includes(q))
  return alias ? { artist, alias } : null
}

/** The artists of a festival the query finds: from its timetable, else from its line-up posters. */
function matchingArtists(festival: Festival, q: string, lineup: readonly string[]): ArtistMatch[] {
  const find = (artists: readonly string[]) => [...new Set(artists)].flatMap((artist) => matchArtist(artist, q) ?? [])
  const fromSets = find(festival.performances.map((p) => p.artist))
  return fromSets.length > 0 ? fromSets : find(lineupNames(lineup))
}

/**
 * Name, venue or an artist (in its timetable, or on its line-up posters: their alt texts in `lineup`) contains the
 * query, ignoring spaces and letter case.
 */
export function matchesQuery(festival: Festival, query: string, lineup: readonly string[] = []): boolean {
  const q = normalize(query)
  return q === '' || normalize(festival.name).includes(q) || normalize(festival.venue.name).includes(q) || matchingArtists(festival, q, lineup).length > 0
}

/**
 * What a search found among the festival's artists, for its row ("NELL 출연", "Roselia·Ro Ro 외 1팀 출연", with the
 * other name it was found by: "THORNAPPLE (쏜애플) 출연"); null if none.
 */
export function artistHit(festival: Festival, query: string, lineup: readonly string[] = []): string | null {
  const q = normalize(query)
  if (q === '') return null
  const found = matchingArtists(festival, q, lineup)
  if (found.length === 0) return null
  const shown = found.slice(0, 2).map(({ artist, alias }) => (alias ? `${artist} (${alias})` : artist))
  const more = found.length - 2
  return `${shown.join('·')}${more > 0 ? ` 외 ${more}팀` : ''} 출연`
}

export interface MonthGroup {
  label: string
  festivals: Festival[]
}

const TBD_LABEL = '날짜 미정'

/** Festivals by start month, latest first (with the year in the label when several years are listed:
 *  `withYear`); festivals whose dates are not out come last. */
export function groupByMonth(festivals: readonly Festival[], { withYear = false } = {}): MonthGroup[] {
  const byLatest = [...festivals].sort((a, b) => b.startDate.localeCompare(a.startDate))
  const groups = new Map<string, Festival[]>()
  for (const festival of byLatest.filter((f) => !f.datesTbd)) {
    const month = `${Number(festival.startDate.slice(5, 7))}월`
    const label = withYear ? `${festival.startDate.slice(0, 4)}년 ${month}` : month
    groups.set(label, [...(groups.get(label) ?? []), festival])
  }
  const tbd = byLatest.filter((f) => f.datesTbd)
  return [
    ...[...groups.entries()].map(([label, list]) => ({ label, festivals: list })),
    ...(tbd.length > 0 ? [{ label: TBD_LABEL, festivals: tbd }] : []),
  ]
}

/** The letter standing in for a festival's mark when it has none: its name's first, past a leading year. */
export const nameInitial = (name: string): string => name.replace(/^[\d\s.'’-]+/, '').charAt(0).toUpperCase() || '?'

export const hasEnded = (festival: Festival, today: string): boolean => !festival.datesTbd && festival.endDate < today
