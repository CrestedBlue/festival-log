import type { Festival } from '../data/schema'
import { formatDayLabel } from './time'

export function formatPeriod(f: Pick<Festival, 'startDate' | 'endDate' | 'datesTbd'>): string {
  if (f.datesTbd) return '날짜 미정'
  if (f.startDate === f.endDate) return formatDayLabel(f.startDate)
  return `${formatDayLabel(f.startDate)} – ${formatDayLabel(f.endDate)}`
}
