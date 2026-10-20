import { useState } from 'react'
import type { LineupImage } from '../../data/catalog/lineup'
import type { Festival } from '../../data/schema'
import { formatDayLabel, listDays } from '../../lib/time'
import { Lineup } from '../timetable/Lineup'
import { TimetableGrid } from '../timetable/TimetableGrid'
import '../timetable/timetable.css'

const NO_FAVORITES: ReadonlySet<string> = new Set()

/** Read-only timetable: day chips and the stage grid, no favorites. The line-up stands in until it is out. */
export function AdminTimetable({ festival, lineup }: { festival: Festival; lineup: readonly LineupImage[] }) {
  const days = listDays(festival.startDate, festival.endDate)
  const [day, setDay] = useState(days[0] ?? '')

  if (festival.performances.length === 0) {
    return lineup.length > 0 ? <Lineup images={lineup} /> : <p className="admin-empty">타임테이블이 아직 공개되지 않았어요.</p>
  }
  const performances = festival.performances.filter((p) => p.day === day)
  return (
    <div className="admin-tt">
      <div className="chip-row admin-tt__days" role="group" aria-label="날짜">
        {days.map((d) => (
          <button key={d} type="button" className="chip chip--compact" aria-pressed={d === day} onClick={() => setDay(d)}>
            {formatDayLabel(d)}
          </button>
        ))}
      </div>
      {performances.length === 0 ? (
        <p className="admin-empty">이 날짜에 등록된 공연이 없어요.</p>
      ) : (
        <TimetableGrid key={day} stages={festival.stages} performances={performances} favorites={NO_FAVORITES} moment={null} />
      )}
    </div>
  )
}
