import type { Pin, StageIconName, Venue } from '../../schema'

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

/** How one stage looks: its main color (heading, set cards) and the icon beside its name. */
export interface StageLook {
  color: string
  icon: StageIconName
}

/**
 * A festival's own design, the same every year (the user's call, 2026-10-21): the main color (selected
 * day, selected tab, "my plan" switch), the picture to the right of the title, and each stage's look,
 * keyed by the stage key (the part of the stage id after the yearly code, e.g. "mint" in "gmf2026-mint").
 */
export interface FestivalTheme {
  /** null keeps the app's ink color. */
  accent: string | null
  /** Picture to the right of the title (an imported image URL), null for none. */
  art: string | null
  /** Its logo alone, square, beside the festival in the lists (an imported image URL, made from `art` by
   * scripts/art/build-marks.mjs), null for none. */
  mark: string | null
  stages: Readonly<Record<string, StageLook>>
}

/**
 * What a festival keeps from year to year: where it is held, its map pins (venue, zones, official
 * markers, subway exits) and its design. Each year's catalog entry adds only its own dates, stage names,
 * timetable, notices and line-up. Map pin ids are prefixed with the festival code (e.g. "gmf-pin-…").
 */
export interface FestivalSeries {
  /** Festival code, the same every year (e.g. "gmf"). */
  code: string
  name: string
  venue: Venue
  pins: () => Pin[]
  sources: readonly CollectionSource[]
  theme: FestivalTheme
}
