import type { Performance, Stage } from '../../../data/schema'
import { performanceSpan, timelineRange } from '../../../lib/schedule'
import { formatClock } from '../../../lib/time'
import { stageColumnWeights } from '../columns'

// Image pixels. The picture is a phone photo's width, and grows wider only past four stages.
export const WIDTH = 1080
export const PAD_X = 40
export const HOURS_WIDTH = 90
export const HEADER_HEIGHT = 300
export const STAGE_HEAD_HEIGHT = 100
export const GRID_TOP = HEADER_HEIGHT + STAGE_HEAD_HEIGHT
export const FOOTER_HEIGHT = 110
/** Twice the app's scale: a long picture has room, so even a 30-minute set shows its name and time. */
export const PX_PER_MIN = 3.2
/** Space between a set and the next one in its column. */
export const SET_GAP = 6
const SET_INSET = 5
const MARK_EVERY_MIN = 30

const sum = (values: readonly number[]) => values.reduce((total, v) => total + v, 0)
/** A stage is never narrower than with four stages; more stages make the picture wider instead. */
const MIN_STAGE_UNIT = (WIDTH - HOURS_WIDTH - PAD_X) / sum(stageColumnWeights(4))

export interface StageColumn {
  id: string
  name: string
  color: string
  x: number
  w: number
}

export interface SetBox {
  id: string
  artist: string
  time: string
  color: string
  x: number
  y: number
  w: number
  h: number
  isFavorite: boolean
}

export interface TimeMark {
  y: number
  /** "13:00" on the hour, null on the half hour. */
  label: string | null
}

export interface ShareLayout {
  width: number
  height: number
  gridBottom: number
  stages: StageColumn[]
  sets: SetBox[]
  marks: TimeMark[]
  favoriteCount: number
}

interface Input {
  stages: readonly Stage[]
  /** The festival's sets; only `day`'s are laid out. */
  performances: readonly Performance[]
  day: string
  favorites: ReadonlySet<string>
}

/** Where everything goes in the shared picture of one day's timetable. */
export function shareLayout({ stages, performances, day, favorites }: Input): ShareLayout {
  const dayPerformances = performances.filter((p) => p.day === day)
  const range = timelineRange(dayPerformances)
  const weights = stageColumnWeights(stages.length)
  const unit = Math.max(MIN_STAGE_UNIT, (WIDTH - HOURS_WIDTH - PAD_X) / sum(weights))
  const width = Math.max(WIDTH, Math.ceil(HOURS_WIDTH + PAD_X + unit * sum(weights)))
  const yOf = (minutes: number) => GRID_TOP + (minutes - range.start) * PX_PER_MIN

  const columns = stages.map((stage, i) => ({
    id: stage.id,
    name: stage.name,
    color: stage.color,
    x: HOURS_WIDTH + unit * sum(weights.slice(0, i)),
    w: unit * (weights[i] ?? 1),
  }))

  const sets = dayPerformances.flatMap((p): SetBox[] => {
    const column = columns.find((c) => c.id === p.stageId)
    if (!column) return []
    const span = performanceSpan(p)
    return [
      {
        id: p.id,
        artist: p.artist,
        time: `${p.start} - ${p.end}`,
        color: column.color,
        x: column.x + SET_INSET,
        y: yOf(span.start),
        w: column.w - SET_INSET * 2,
        h: (span.end - span.start) * PX_PER_MIN - SET_GAP,
        isFavorite: favorites.has(p.id),
      },
    ]
  })

  const marks = Array.from({ length: (range.end - range.start) / MARK_EVERY_MIN + 1 }, (_, i) => {
    const minutes = range.start + i * MARK_EVERY_MIN
    return { y: yOf(minutes), label: minutes % 60 === 0 ? formatClock(minutes) : null }
  })

  const gridBottom = yOf(range.end)
  return {
    width,
    height: gridBottom + FOOTER_HEIGHT,
    gridBottom,
    stages: columns,
    sets,
    marks,
    favoriteCount: sets.filter((s) => s.isFavorite).length,
  }
}
