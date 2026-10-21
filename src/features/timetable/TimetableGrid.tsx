import { useEffect, useRef, type CSSProperties } from 'react'
import { StarIcon } from '../../components/icons'
import { StageIcon } from '../../components/StageIcon'
import type { Performance, Stage } from '../../data/schema'
import { performanceSpan, timelineRange } from '../../lib/schedule'
import { formatClock, type FestivalMoment } from '../../lib/time'
import { stageColumnWeights } from './columns'
import { setStatus } from './setStatus'

const PX_PER_MIN = 1.6
const MARK_EVERY_MIN = 30
const COMPACT_BELOW_PX = 44
const SCROLL_LEAD_PX = 72

interface Props {
  stages: readonly Stage[]
  performances: readonly Performance[]
  favorites: ReadonlySet<string>
  moment: FestivalMoment | null
  /** Without it the sets are shown read-only (the admin page). */
  onToggle?: (id: string) => void
}

export function TimetableGrid({ stages, performances, favorites, moment, onToggle }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const range = timelineRange(performances)
  const marks = Array.from({ length: (range.end - range.start) / MARK_EVERY_MIN }, (_, i) => range.start + i * MARK_EVERY_MIN)
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

  const weights = stageColumnWeights(stages.length)
  const gridStyle = {
    '--stage-weight-sum': weights.reduce((sum, w) => sum + w, 0),
    gridTemplateColumns: `48px ${weights.map((w) => `minmax(0, ${w}fr)`).join(' ')}`,
    '--mark-px': `${MARK_EVERY_MIN * PX_PER_MIN}px`,
    '--body-px': `${(range.end - range.start) * PX_PER_MIN}px`,
  } as CSSProperties

  return (
    <div className="tt-scroll" ref={scrollRef}>
      <div className="tt-grid" style={gridStyle}>
        <div className="tt-corner" aria-hidden="true" />
        {stages.map((stage) => (
          <div key={stage.id} className="tt-stage-head" style={{ '--stage-color': stage.color } as CSSProperties}>
            <div className="tt-stage-head__card">
              <StageIcon name={stage.icon} />
              <span className="tt-stage-head__name">{stage.name}</span>
            </div>
          </div>
        ))}

        <div className="tt-hours" aria-hidden="true">
          {marks.map((m) => (
            <span key={m} style={{ top: (m - range.start) * PX_PER_MIN }}>
              {formatClock(m)}
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
                // Every set looks the same whether it is on, over or still to come (the user's call); only badges tell.
                const status = setStatus(span, moment?.minutes ?? null)
                const badge = status && (status.kind === 'live' ? '공연 중' : `${status.minutes}분 후`)
                const classes = ['tt-set', isFavorite && 'tt-set--fav', height < COMPACT_BELOW_PX && 'tt-set--compact']
                const setProps = {
                  className: classes.filter(Boolean).join(' '),
                  style: { top: (span.start - range.start) * PX_PER_MIN, height: height - 3, '--stage-color': stage.color } as CSSProperties,
                  'aria-label': `${p.artist}, ${p.start}부터 ${p.end}까지${badge ? `, ${badge}` : ''}${isFavorite ? ', 찜함' : ''}`,
                }
                const body = (
                  <>
                    <span className="tt-set__artist">{p.artist}</span>
                    <span className="tt-set__time">
                      {p.start} - {p.end}
                    </span>
                    {status && <span className={`badge badge--${status.kind}`}>{badge}</span>}
                    {onToggle && (
                      <span className="tt-set__star">
                        <StarIcon filled={isFavorite} />
                      </span>
                    )}
                  </>
                )
                return (
                  <div role="listitem" key={p.id}>
                    {onToggle ? (
                      <button type="button" {...setProps} aria-pressed={isFavorite} onClick={() => onToggle(p.id)}>
                        {body}
                      </button>
                    ) : (
                      <div {...setProps}>{body}</div>
                    )}
                  </div>
                )
              })}
          </div>
        ))}

        {nowInRange && moment && (
          <div className="tt-now" style={{ top: nowTop }} aria-label={`현재 시각 ${formatClock(moment.minutes)}`}>
            <span className="tt-now__label">
              <strong>{formatClock(moment.minutes)}</strong>지금
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
