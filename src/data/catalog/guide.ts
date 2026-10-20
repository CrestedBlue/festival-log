/** One page of an official guide (checklist, venue map, …), shown as it was published. */
export interface GuideImage {
  /** Bundled image URL (import it from src/assets/guides/; file names start with "guide-"). */
  src: string
  /** What the page says, for screen readers. */
  alt: string
  width: number
  height: number
}

/** A set of guide pages swiped through side by side on the info tab. */
export interface GuideSet {
  title: string
  /** Where the pages come from, shown under them. */
  source: string
  images: readonly GuideImage[]
}
