import { BackIcon, StarIcon } from '../../components/icons'
import type { Festival } from '../../data/schema'
import { formatDayLabel } from '../../lib/time'
import { selectionParams, type TimetableSelection } from './selection'
import './timetable.css'

interface Props {
  festival: Festival
  favorites: readonly string[]
  selection: TimetableSelection
  today: string
  setParams: (params: Record<string, string | undefined>) => void
}

/** Day tickets and the "my plan" switch. They sit in the app header, under the festival title. */
export function TimetableControls({ festival, favorites, selection, today, setParams }: Props) {
  const favoriteSet = new Set(favorites)
  const favoriteCount = festival.performances.filter((p) => p.day === selection.day && favoriteSet.has(p.id)).length
  const select = (next: { day?: string; mine?: boolean }) => setParams(selectionParams(selection, next))
  const { showMine } = selection

  return (
    <div className="timetable-controls">
      <div className="day-tickets" role="group" aria-label="날짜">
        {selection.days.map((day) => (
          <button
            key={day}
            type="button"
            className="day-ticket"
            aria-pressed={day === selection.day}
            onClick={() => select({ day })}
          >
            {formatDayLabel(day)}
            {day === today && <span className="day-ticket__today" aria-label="오늘" />}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="mine-toggle"
        aria-pressed={showMine}
        aria-label={showMine ? '전체 타임테이블 보기' : `내 일정만 보기 (찜 ${favoriteCount}개)`}
        title={showMine ? '전체 보기' : '내 일정만 보기'}
        onClick={() => select({ mine: !showMine })}
      >
        {/* In "my plan" the switch shows the way back; the count would only repeat the list. */}
        {showMine ? <BackIcon /> : <StarIcon filled={false} />}
        {!showMine && favoriteCount > 0 && <span className="mine-toggle__count">{favoriteCount}</span>}
      </button>
    </div>
  )
}
