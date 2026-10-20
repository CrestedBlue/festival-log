import type { ReactNode } from 'react'
import type { Festival } from '../../data/schema'
import { formatPeriod } from '../../lib/period'
import { listDays } from '../../lib/time'
import { calendarTile, hasEnded } from './browse'

interface Props {
  festival: Festival
  today: string
  active: boolean
  /** e.g. "직접 만든 것" for festivals typed into an older version. */
  tag?: string
  /** Right edge: check, plus, or "보는 중". */
  trailing: ReactNode
  onPick: () => void
}

/** A festival as one row: calendar square, name, length and venue. */
export function FestivalRow({ festival, today, active, tag, trailing, onPick }: Props) {
  const tile = calendarTile(festival)
  const length = festival.datesTbd ? '날짜 미정' : `${listDays(festival.startDate, festival.endDate).length}일`
  return (
    <button type="button" className={`fest-row${active ? ' is-active' : ''}`} onClick={onPick}>
      <span className={`cal${hasEnded(festival, today) ? ' cal--ended' : ''}`} aria-hidden="true">
        <span className="cal__weekday">{tile.weekday}</span>
        <span className="cal__day">{tile.day}</span>
      </span>
      <span className="fest-row__text">
        <span className="fest-row__name">
          {festival.name}
          {tag && <span className="fest-row__tag">{tag}</span>}
        </span>
        <span className="fest-row__meta">
          <span className="visually-hidden">{formatPeriod(festival)} · </span>
          {length}
          {festival.venue.name && ` · ${festival.venue.name}`}
        </span>
      </span>
      {trailing}
    </button>
  )
}
