/** Width of `text` set in the label's font at `size` px. */
export type MeasureText = (text: string, size: number) => number

export interface LabelBox {
  /** The first line runs beside the star, so it is narrower. */
  firstLineWidth: number
  lineWidth: number
  height: number
}

export interface FitOptions {
  /** Font sizes to try, largest first. */
  sizes: readonly number[]
  /** Room kept under the text (the set's time), given up when the text needs it. */
  reserve: number
}

export interface FittedLabel {
  size: number
  lines: string[]
  /** Whether the reserved room under the text is still free. */
  showTime: boolean
}

export const lineHeightOf = (size: number) => Math.round(size * 1.15)

/** A set's name: 26px down to 20px, with its time (21px) underneath while it fits. */
export const SET_LABEL: FitOptions = { sizes: [26, 24, 22, 20], reserve: 25 }

const ELLIPSIS = '…'

const widthOf = (box: LabelBox, line: number) => (line === 0 ? box.firstLineWidth : box.lineWidth)

/** Wraps between words only, like the app's keep-all; null when a word is too wide for its line. */
export function wrapWords(text: string, size: number, box: LabelBox, measure: MeasureText): string[] | null {
  const lines: string[] = []
  let current = ''
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const next = current ? `${current} ${word}` : word
    if (measure(next, size) <= widthOf(box, lines.length)) {
      current = next
      continue
    }
    if (!current) return null
    lines.push(current)
    if (measure(word, size) > widthOf(box, lines.length)) return null
    current = word
  }
  return current ? [...lines, current] : lines
}

/** Breaks anywhere, for text no size keeps whole; past `maxLines` the last line ends in an ellipsis. */
function breakAnywhere(text: string, size: number, box: LabelBox, measure: MeasureText, maxLines: number): string[] {
  const lines: string[] = []
  let current = ''
  for (const char of text) {
    const next = current + char
    if (!current || measure(next, size) <= widthOf(box, lines.length)) {
      current = next
      continue
    }
    lines.push(current.trimEnd())
    current = char.trim()
  }
  const all = current ? [...lines, current] : lines
  if (all.length <= maxLines) return all

  let last = [...(all[maxLines - 1] ?? '')]
  while (last.length > 0 && measure(last.join('') + ELLIPSIS, size) > widthOf(box, maxLines - 1)) {
    last = last.slice(0, -1)
  }
  return [...all.slice(0, maxLines - 1), last.join('').trimEnd() + ELLIPSIS]
}

/**
 * Fits a label into its box the way the app would want it on paper: keep words whole (shrinking the font
 * before breaking one), keep the reserved room while the text allows, and only as a last resort break
 * inside a word and cut it short.
 */
export function fitLabel(
  text: string,
  box: LabelBox,
  measure: MeasureText,
  { sizes, reserve }: FitOptions = SET_LABEL,
): FittedLabel {
  const tryFit = (showTime: boolean): FittedLabel | null => {
    const room = box.height - (showTime ? reserve : 0)
    for (const size of sizes) {
      const lines = wrapWords(text, size, box, measure)
      if (lines && lines.length * lineHeightOf(size) <= room) return { size, lines, showTime }
    }
    return null
  }
  const fitted = tryFit(true) ?? tryFit(false)
  if (fitted) return fitted

  const size = Math.min(...sizes)
  const maxLines = Math.max(1, Math.floor(box.height / lineHeightOf(size)))
  return { size, lines: breakAnywhere(text, size, box, measure, maxLines), showTime: false }
}
