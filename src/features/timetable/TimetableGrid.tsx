import { useEffect, useRef, type CSSProperties } from 'react'
import type { Performance, Stage } from '../../data/schema'
import { findConflicts, performanceSpan, timelineRange } from '../../lib/schedule'
import { formatClock, type FestivalMoment } from '../../lib/time'

const PX_PER_MIN = 1.6
const COMPACT_BELOW_PX = 44
const SCROLL_LEAD_PX = 72

interface Props {
  stages: readonly Stage[]
  performances: readonly Performance[]
  favorites: ReadonlySet<string>
  moment: FestivalMoment | null
  onToggle: (id: string) => void
}

export function TimetableGrid({ stages, performances, favorites, moment, onToggle }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const range = timelineRange(performances)
  const hours = Array.from({ length: (range.end - range.start) / 60 }, (_, i) => range.start + i * 60)
  const conflicts = findConflicts(performances.filter((p) => favorites.has(p.id)))
  const nowInRange = moment !== null && moment.minutes >= range.start && moment.minutes <= range.end
  const nowTop = moment ? (moment.minutes - range.start) * PX_PER_MIN : 0

  // Land on "now" during the festival, otherwise on the first set you starred.
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const firstFavorite = performances.find((p) => favorites.has(p.id))
    const target = nowInRange
      ? nowTop
      : firstFavorite
        ? (performanceSpan(firstFavorite).start - range.start) * PX_PER_MIN
        : 0
    el.scrollTop = Math.max(0, target - SCROLL_LEAD_PX)
    // Only on mount (the grid is keyed by day).
  }, [])

  const gridStyle = {
    '--stage-count': stages.length,
    '--hour-px': `${60 * PX_PER_MIN}px`,
    '--body-px': `${(range.end - range.start) * PX_PER_MIN}px`,
  } as CSSProperties

  return (
    <div className="tt-scroll" ref={scrollRef}>
      <div className="tt-grid" style={gridStyle}>
        <div className="tt-corner" aria-hidden="true" />
        {stages.map((stage) => (
          <div key={stage.id} className="tt-stage-head" style={{ '--stage-color': stage.color } as CSSProperties}>
            <span className="tt-stage-head__name">{stage.name}</span>
          </div>
        ))}

        <div className="tt-hours" aria-hidden="true">
          {hours.map((h) => (
            <span key={h} style={{ top: (h - range.start) * PX_PER_MIN }}>
              {formatClock(h)}
            </span>
          ))}
        </div>

        {stages.map((stage) => (
          <div key={stage.id} className="tt-column" role="list" aria-label={stage.name}>
            {performances
              .filter((p) => p.stageId === stage.id)
              .map((p) => {
                const span = performanceSpan(p)
                const height = (span.end - span.start) * PX_PER_MIN
                const isFavorite = favorites.has(p.id)
                const isPast = moment !== null && moment.minutes >= span.end
                const isLive = moment !== null && span.start <= moment.minutes && moment.minutes < span.end
                const classes = [
                  'tt-set',
                  isFavorite && 'tt-set--fav',
                  isPast && 'tt-set--past',
                  isLive && 'tt-set--live',
                  height < COMPACT_BELOW_PX && 'tt-set--compact',
                ]
                return (
                  <div role="listitem" key={p.id}>
                    <button
                      type="button"
                      className={classes.filter(Boolean).join(' ')}
                      style={{ top: (span.start - range.start) * PX_PER_MIN, height: height - 3, '--stage-color': stage.color } as CSSProperties}
                      aria-pressed={isFavorite}
                      aria-label={`${p.artist}, ${p.start}부터 ${p.end}까지${isFavorite ? ', 찜함' : ''}`}
                      onClick={() => onToggle(p.id)}
                    >
                      <span className="tt-set__artist">
                        {isFavorite && <span aria-hidden="true">★ </span>}
                        {p.artist}
                      </span>
                      <span className="tt-set__time">
                        {p.start}–{p.end}
                      </span>
                      {conflicts.has(p.id) && <span className="tt-set__warn">겹침</span>}
                    </button>
                  </div>
                )
              })}
          </div>
        ))}

        {nowInRange && moment && (
          <div className="tt-now" style={{ top: nowTop }} aria-label={`현재 시각 ${formatClock(moment.minutes)}`}>
            <span>NOW {formatClock(moment.minutes)}</span>
          </div>
        )}
      </div>
    </div>
  )
}
