import type { Festival } from '../../data/schema'
import { listDays } from '../../lib/time'

export interface TimetableSelection {
  days: string[]
  /** The day shown: the one in the address, else today during the festival, else the first day. */
  day: string
  /** Only the starred sets ("my plan"). */
  showMine: boolean
}

export function timetableSelection(
  festival: Pick<Festival, 'startDate' | 'endDate'>,
  params: URLSearchParams,
  today: string,
): TimetableSelection {
  const days = listDays(festival.startDate, festival.endDate)
  const requested = params.get('day')
  const day = requested && days.includes(requested) ? requested : days.includes(today) ? today : (days[0] ?? '')
  return { days, day, showMine: params.get('mine') === '1' }
}

/** Address params for a new choice, keeping what does not change. */
export const selectionParams = (current: TimetableSelection, next: { day?: string; mine?: boolean }) => ({
  day: next.day ?? current.day,
  mine: (next.mine ?? current.showMine) ? '1' : undefined,
})
