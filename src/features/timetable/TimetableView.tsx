import type { Festival } from '../../data/schema'
import { updateData } from '../../data/store'
import { toggleFavorite } from '../../data/actions'
import { festivalMoment, formatDayLabel, listDays } from '../../lib/time'
import { StarIcon } from '../../components/icons'
import { MyPlanList } from './MyPlanList'
import { TimetableGrid } from './TimetableGrid'
import './timetable.css'

interface Props {
  festival: Festival
  favorites: readonly string[]
  now: Date
  params: URLSearchParams
  setParams: (params: Record<string, string | undefined>) => void
}

export function TimetableView({ festival, favorites, now, params, setParams }: Props) {
  const days = listDays(festival.startDate, festival.endDate)
  const moment = festivalMoment(now)
  const requestedDay = params.get('day')
  const selectedDay =
    requestedDay && days.includes(requestedDay) ? requestedDay : days.includes(moment.day) ? moment.day : days[0]
  const showMine = params.get('mine') === '1'
  const favoriteSet = new Set(favorites)
  const dayPerformances = festival.performances.filter((p) => p.day === selectedDay)
  const favoriteCount = dayPerformances.filter((p) => favoriteSet.has(p.id)).length
  const liveMoment = selectedDay === moment.day ? moment : null
  const onToggle = (id: string) => updateData((d) => toggleFavorite(d, id))

  const select = (next: { day?: string; mine?: boolean }) =>
    setParams({ day: next.day ?? selectedDay, mine: (next.mine ?? showMine) ? '1' : undefined })

  return (
    <section className="timetable" aria-label="타임테이블">
      <div className="timetable__controls">
        <div className="chip-row timetable__days" role="group" aria-label="날짜">
          {days.map((day) => (
            <button
              key={day}
              type="button"
              className="chip chip--compact"
              aria-pressed={day === selectedDay}
              onClick={() => select({ day })}
            >
              {formatDayLabel(day)}
              {day === moment.day && <span className="chip__today" aria-label="오늘" />}
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
          <StarIcon filled={showMine} />
          {favoriteCount > 0 && <span className="mine-toggle__count">{favoriteCount}</span>}
        </button>
      </div>

      {festival.stages.length === 0 || dayPerformances.length === 0 ? (
        <p className="timetable__empty">이 날짜에 등록된 공연이 없어요. 관리 탭에서 타임테이블을 입력해 보세요.</p>
      ) : showMine ? (
        <MyPlanList
          stages={festival.stages}
          performances={dayPerformances.filter((p) => favoriteSet.has(p.id))}
          moment={liveMoment}
          onToggle={onToggle}
        />
      ) : (
        <TimetableGrid
          key={selectedDay}
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
