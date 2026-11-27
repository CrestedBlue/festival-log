/**
 * One topic of the info tab's notices, drawn as a picture above a speech-bubble box (the blocks zigzag: the picture
 * is on the left in the first block, on the right in the next, and so on). One fact a line; `**…**` makes the key
 * numbers bold.
 */
export interface NoticeBlock {
  /** Stable key. */
  id: string
  /** The topic, read out for screen readers (the picture and the box do not show it). */
  title: string
  /** The picture (decorative, transparent background). */
  art: string
  /** The block's main color, for the bullet dots. */
  tone: string
  /** The picture's size in pixels, so its room is kept before it loads. */
  width: number
  height: number
  lines: readonly string[]
}
