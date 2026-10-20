import type { Pin, Venue } from '../../schema'

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
}
