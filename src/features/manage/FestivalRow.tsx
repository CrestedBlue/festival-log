import type { ReactNode } from 'react'
import type { Festival } from '../../data/schema'
import { festivalMark } from '../../data/resolve'
import { formatPeriod } from '../../lib/period'
import { hasEnded, nameInitial } from './browse'

interface Props {
  festival: Festival
  today: string
  active: boolean
  /** e.g. "직접 만든 것" for festivals typed into an older version. */
  tag?: string
  /** Right edge: check, plus, or "보는 중". */
  trailing: ReactNode
  /** Got new content since I last opened it: a red dot on its mark. */
  updated?: boolean
  /** A line under the place: what a search found ("NELL 출연"). */
  note?: string
  onPick: () => void
}

/**
 * A festival as one row: its mark (the festival's logo; the first letter of its name for festivals saved from older
 * versions; faded once it is over), name, dates and venue.
 */
export function FestivalRow({ festival, today, active, tag, trailing, updated = false, note, onPick }: Props) {
  const mark = festivalMark(festival.id)
  return (
    <button type="button" className={`fest-row${active ? ' is-active' : ''}`} onClick={onPick}>
      <span className={`fest-mark${hasEnded(festival, today) ? ' fest-mark--ended' : ''}`} aria-hidden="true">
        {mark ? <img className="fest-mark__logo" src={mark} alt="" width="44" height="44" /> : <span className="fest-mark__initial">{nameInitial(festival.name)}</span>}
        {updated && <span className="new-dot new-dot--corner" />}
      </span>
      <span className="fest-row__text">
        <span className="fest-row__name">
          {festival.name}
          {tag && <span className="fest-row__tag">{tag}</span>}
          {updated && <span className="visually-hidden"> (새 소식)</span>}
        </span>
        <span className="fest-row__meta">
          {formatPeriod(festival)}
          {festival.venue.name && ` · ${festival.venue.name}`}
        </span>
        {note && <span className="fest-row__note">{note}</span>}
      </span>
      {trailing}
    </button>
  )
}
