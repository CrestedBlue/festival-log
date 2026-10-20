import type { Pin, Venue } from '../../schema'

/** "인스타" = an Instagram account (@handle), "공홈" = the official website's notice board (https URL). */
export type SourceMethod = '인스타' | '공홈'

/** Where Claude looks for new official posts (timetable, map, notices, line-ups) for a festival. */
export interface CollectionSource {
  method: SourceMethod
  value: string
  /**
   * Date of the newest post Claude has gone through from this source (YYYY-MM-DD), null before the first
   * run. Claude updates it after each collection; nobody types it in.
   */
  lastScrapedPostDate: string | null
}

/**
 * What a festival keeps from year to year: where it is held and its map pins (venue, zones, official
 * markers, subway exits). Each year's catalog entry adds only its own dates, stages, timetable, notices
 * and line-up. Map pin ids are prefixed with the festival code (e.g. "gmf-zone-…").
 */
export interface FestivalSeries {
  /** Festival code, the same every year (e.g. "gmf"). */
  code: string
  name: string
  venue: Venue
  pins: () => Pin[]
  sources: readonly CollectionSource[]
}
