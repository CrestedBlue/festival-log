import type { Festival } from '../data/schema'
import { summarizeNow } from '../lib/nowSummary'
import { formatClock, festivalMoment, toFestivalMinutes } from '../lib/time'

interface Props {
  festival: Festival
  favorites: readonly string[]
  now: Date
}

const formatWait = (minutes: number) =>
  minutes < 60 ? `${minutes}분 후` : `${Math.floor(minutes / 60)}시간 ${minutes % 60 ? `${minutes % 60}분 ` : ''}후`

export function NowStrip({ festival, favorites, now }: Props) {
  const summary = summarizeNow(festival, favorites, festivalMoment(now))
  const stageName = (stageId: string) => festival.stages.find((s) => s.id === stageId)?.name ?? ''

  // Outside festival days the strip only costs vertical space, so it disappears.
  if (summary.kind !== 'during') return null

  const [first, ...rest] = summary.playing
  return (
    <section className="now-strip" aria-label="지금 공연 중">
      <span className="now-strip__tag">NOW</span>
      <div className="now-strip__body">
        <div className="now-strip__line">
          {first ? (
            <>
              <strong>{first.artist}</strong>
              <span className="now-strip__dim">
                {stageName(first.stageId)} ~{formatClock(toFestivalMinutes(first.end))}
                {rest.length > 0 && ` 외 ${rest.length}`}
              </span>
            </>
          ) : (
            <span>지금은 쉬는 시간</span>
          )}
        </div>
        {summary.next && summary.minutesUntilNext !== null && (
          <div className="now-strip__line now-strip__dim">
            {summary.nextIsFavorite ? '다음 ★' : '다음'} {summary.next.start} {summary.next.artist} ·{' '}
            {formatWait(summary.minutesUntilNext)}
          </div>
        )}
      </div>
    </section>
  )
}
