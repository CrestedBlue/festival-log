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

  if (summary.kind === 'before') {
    return (
      <section className="now-strip" aria-label="페스티벌까지 남은 날">
        <span className="now-strip__tag now-strip__tag--next">D-{summary.daysLeft}</span>
        <span>
          <strong>{festival.name}</strong>까지 {summary.daysLeft}일 남았어요
        </span>
      </section>
    )
  }

  if (summary.kind === 'after') {
    return (
      <section className="now-strip" aria-label="지난 페스티벌">
        <span className="now-strip__tag">DONE</span>
        <span>다녀온 페스티벌 · 찜한 공연 {favorites.length}개</span>
      </section>
    )
  }

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
