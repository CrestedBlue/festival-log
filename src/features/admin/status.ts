import type { FestivalOverview } from './overview'

export type StatusTone = 'ready' | 'pending' | 'error'

export function statusOf(row: FestivalOverview): { tone: StatusTone; label: string } {
  if (row.problems.length > 0) return { tone: 'error', label: '오류' }
  if (row.missing.length > 0) return { tone: 'pending', label: `${row.missing.join('·')} 없음` }
  return { tone: 'ready', label: '완료' }
}
