/** One line-up announcement (usually the official poster), shown until the timetable is out. */
export interface LineupImage {
  /** Bundled image URL (import it from src/assets/lineups/). */
  src: string
  /** Everything the image says, for screen readers: artists, dates, venue. */
  alt: string
  /** e.g. "1차 라인업" */
  label: string
  width: number
  height: number
}

/** The catalog keeps posters in the order they were announced; the app shows the latest one on top. */
export const newestFirst = (images: readonly LineupImage[]): LineupImage[] => [...images].reverse()
