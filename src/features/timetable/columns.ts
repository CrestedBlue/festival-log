// The fourth stage is usually the event zone (talks, signings) with long titles, so it gets a wider column.
const EVENT_STAGE_INDEX = 3
const EVENT_STAGE_WEIGHT = 1.5

/** Relative column widths, one per stage (1 = a third of a phone screen). */
export function stageColumnWeights(count: number): number[] {
  return Array.from({ length: count }, (_, i) => (i === EVENT_STAGE_INDEX ? EVENT_STAGE_WEIGHT : 1))
}
