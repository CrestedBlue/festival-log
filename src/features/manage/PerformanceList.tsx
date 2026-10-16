import type { CSSProperties } from 'react'
import { removePerformance } from '../../data/actions'
import type { Festival } from '../../data/schema'
import { updateData } from '../../data/store'
import { sortByStart } from '../../lib/schedule'
import { formatDayLabel, listDays } from '../../lib/time'

export function PerformanceList({ festival }: { festival: Festival }) {
  const days = listDays(festival.startDate, festival.endDate)
  const colorOf = (stageId: string) => festival.stages.find((s) => s.id === stageId)?.color ?? 'var(--color-ink)'

  const remove = (id: string, artist: string) => {
    if (window.confirm(`'${artist}' 공연을 지울까요?`)) updateData((d) => removePerformance(d, festival.id, id))
  }

  return (
    <div className="perf-days">
      {days.map((day) => {
        const list = sortByStart(festival.performances.filter((p) => p.day === day))
        return (
          <details key={day} className="perf-day">
            <summary>
              {formatDayLabel(day)} <span className="hint">· {list.length}개</span>
            </summary>
            <ul className="perf-list">
              {list.map((p) => (
                <li key={p.id} style={{ '--stage-color': colorOf(p.stageId) } as CSSProperties}>
                  <span className="perf-list__time">
                    {p.start}–{p.end}
                  </span>
                  <span className="perf-list__artist">{p.artist}</span>
                  <button
                    type="button"
                    className="btn btn--small btn--ghost"
                    aria-label={`${p.artist} 삭제`}
                    onClick={() => remove(p.id, p.artist)}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          </details>
        )
      })}
    </div>
  )
}
