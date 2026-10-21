import type { LineupImage } from '../../data/catalog/lineup'
import type { Festival } from '../../data/schema'
import { updateData } from '../../data/store'
import { toggleFavorite } from '../../data/userData'
import { festivalMoment } from '../../lib/time'
import { Lineup } from './Lineup'
import { MyPlanList } from './MyPlanList'
import type { TimetableSelection } from './selection'
import { TimetableGrid } from './TimetableGrid'
import './timetable.css'

interface Props {
  festival: Festival
  /** Shown instead while the festival has no timetable. */
  lineup: readonly LineupImage[]
  favorites: readonly string[]
  now: Date
  /** Day and "my plan" switch, picked in the header (TimetableControls). */
  selection: TimetableSelection
}

export function TimetableView({ festival, lineup, favorites, now, selection }: Props) {
  const moment = festivalMoment(now)
  const favoriteSet = new Set(favorites)
  const dayPerformances = festival.performances.filter((p) => p.day === selection.day)
  const liveMoment = selection.day === moment.day ? moment : null
  const onToggle = (id: string) => updateData((d) => toggleFavorite(d, id))

  // Before the timetable is out there are no days or favorites to pick (the dates may not be set either).
  if (festival.performances.length === 0) {
    return (
      <section className="timetable" aria-label={lineup.length > 0 ? '라인업' : '타임테이블'}>
        {lineup.length > 0 ? <Lineup images={lineup} /> : <p className="timetable__empty">타임테이블이 아직 공개되지 않았어요.</p>}
      </section>
    )
  }

  return (
    <section className="timetable" aria-label="타임테이블">
      {festival.stages.length === 0 || dayPerformances.length === 0 ? (
        <p className="timetable__empty">이 날짜에 등록된 공연이 없어요.</p>
      ) : selection.showMine ? (
        <MyPlanList
          stages={festival.stages}
          performances={dayPerformances.filter((p) => favoriteSet.has(p.id))}
          moment={liveMoment}
          onToggle={onToggle}
        />
      ) : (
        <TimetableGrid
          key={selection.day}
          stages={festival.stages}
          performances={dayPerformances}
          favorites={favoriteSet}
          moment={liveMoment}
          onToggle={onToggle}
        />
      )}
    </section>
  )
}
