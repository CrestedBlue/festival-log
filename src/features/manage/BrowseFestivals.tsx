import { CheckIcon, PlusIcon, SearchIcon } from '../../components/icons'
import { CATALOG } from '../../data/catalog'
import { activeFestival, resolveFestival } from '../../data/resolve'
import type { Festival, UserData } from '../../data/schema'
import { showNotice, updateData } from '../../data/store'
import { hasNewContent, markSeen } from '../../data/updates'
import { addMyFestival, setActiveFestival } from '../../data/userData'
import { groupByMonth, matchesQuery } from './browse'
import { FestivalRow } from './FestivalRow'
import { groupByYear } from './years'

interface Props {
  data: UserData
  today: string
  year: string | null
  query: string
  onYear: (year: string) => void
  onQuery: (query: string) => void
}

/** Every registered festival: search, year chips, then the year's festivals by month. */
export function BrowseFestivals({ data, today, year, query, onYear, onQuery }: Props) {
  const all = [...CATALOG.flatMap((entry) => resolveFestival(data, entry.id)?.festival ?? []), ...data.archivedFestivals]
  const years = groupByYear(all)
  const activeYear = activeFestival(data)?.festival.startDate.slice(0, 4)
  const shownYear = years.find((g) => g.year === year)?.year ?? years.find((g) => g.year === activeYear)?.year ?? years[0]?.year
  const inYear = years.find((g) => g.year === shownYear)?.festivals ?? []
  const groups = groupByMonth(inYear.filter((f) => matchesQuery(f, query)))
  const mine = new Set(data.myFestivalIds)
  const archived = new Set(data.archivedFestivals.map((f) => f.id))

  const pick = (festival: Festival) => {
    const isMine = mine.has(festival.id)
    updateData((d) => markSeen(isMine ? setActiveFestival(d, festival.id) : addMyFestival(d, festival.id), festival.id))
    // switching needs no word (the header changes); adding says so
    if (!isMine) showNotice('info', `'${festival.name}'를 추가했어요.`)
  }

  return (
    <>
      <label className="search">
        <SearchIcon />
        <span className="visually-hidden">페스티벌 찾기</span>
        <input type="search" value={query} placeholder="이름이나 장소로 찾기" onChange={(e) => onQuery(e.target.value)} />
      </label>
      <div className="chip-row" role="group" aria-label="연도">
        {years.map((g) => (
          <button key={g.year} type="button" className="chip chip--compact" aria-pressed={g.year === shownYear} onClick={() => onYear(g.year)}>
            {g.year}
          </button>
        ))}
      </div>
      <div className="manage__list">
        {groups.length === 0 ? (
          <p className="manage__empty">{query.trim() ? `'${query.trim()}'에 맞는 페스티벌이 없어요.` : '이 해에 등록된 페스티벌이 없어요.'}</p>
        ) : (
          groups.map((group) => (
            <section key={group.label} className="month" aria-label={group.label}>
              <h3 className="month__label">{group.label}</h3>
              <ul className="fest-list">
                {group.festivals.map((festival) => (
                  <li key={festival.id}>
                    <FestivalRow
                      festival={festival}
                      today={today}
                      active={data.activeFestivalId === festival.id}
                      tag={archived.has(festival.id) ? '직접 만든 것' : undefined}
                      trailing={
                        mine.has(festival.id) ? (
                          <span className="fest-row__state is-added" aria-label="추가됨">
                            <CheckIcon />
                          </span>
                        ) : (
                          <span className="fest-row__state" aria-label="추가하기">
                            <PlusIcon />
                          </span>
                        )
                      }
                      updated={hasNewContent(data, festival.id)}
                      onPick={() => pick(festival)}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </>
  )
}
