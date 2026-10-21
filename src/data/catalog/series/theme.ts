import type { FestivalSeries, StageLook } from './types'

/** The color and icon a yearly file gives its stage; every stage key must be in the festival's theme. */
export function stageLook(series: FestivalSeries, key: string): StageLook {
  const look = series.theme.stages[key]
  if (!look) throw new Error(`${series.code} theme has no stage "${key}"`)
  return look
}
