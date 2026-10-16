import type { CSSProperties } from 'react'
import type { Performance, Stage } from '../../data/schema'
import { findConflicts, performanceSpan, sortByStart } from '../../lib/schedule'
import type { FestivalMoment } from '../../lib/time'

interface Props {
  stages: readonly Stage[]
  performances: readonly Performance[]
  moment: FestivalMoment | null
  onToggle: (id: string) => void
}

export function MyPlanList({ stages, performances, moment, onToggle }: Props) {
  if (performances.length === 0) {
    return <p className="timetable__empty">전체 타임테이블에서 보고 싶은 공연을 눌러 ★ 찜해 두세요.</p>
  }
  const conflicts = findConflicts(performances)
  const stageOf = (id: string) => stages.find((s) => s.id === id)

  return (
    <ol className="plan-list">
      {sortByStart(performances).map((p) => {
        const span = performanceSpan(p)
        const stage = stageOf(p.stageId)
        const isLive = moment !== null && span.start <= moment.minutes && moment.minutes < span.end
        const isPast = moment !== null && moment.minutes >= span.end
        return (
          <li
            key={p.id}
            className={`plan-item${isPast ? ' plan-item--past' : ''}`}
            style={{ '--stage-color': stage?.color ?? 'var(--color-ink)' } as CSSProperties}
          >
            <div className="plan-item__time">
              <strong>{p.start}</strong>
              <span>{p.end}</span>
            </div>
            <div className="plan-item__body">
              <span className="plan-item__artist">{p.artist}</span>
              <span className="plan-item__stage">{stage?.name}</span>
              <span className="plan-item__badges">
                {isLive && <span className="badge badge--live">지금 공연 중</span>}
                {conflicts.has(p.id) && <span className="badge badge--warn">다른 찜과 겹침</span>}
              </span>
            </div>
            <button type="button" className="plan-item__star" aria-label={`${p.artist} 찜 해제`} onClick={() => onToggle(p.id)}>
              ★
            </button>
          </li>
        )
      })}
    </ol>
  )
}
