import { CheckIcon, PlusIcon, SearchIcon } from '../../components/icons'
import { CATALOG, catalogEntry } from '../../data/catalog'
import { activeFestival, resolveFestival } from '../../data/resolve'
import type { Festival, UserData } from '../../data/schema'
import { showNotice, updateData } from '../../data/store'
import { hasNewContent, markSeen } from '../../data/updates'
import { addMyFestival, setActiveFestival } from '../../data/userData'
import { artistHit, groupByMonth, matchesQuery } from './browse'
import { FestivalRow } from './FestivalRow'
import { ALL_YEARS, inShownYear } from './years'
import { YearChips } from './YearChips'

interface Props {
  data: UserData
  today: string
  year: string | null
  query: string
  onYear: (year: string) => void
  onQuery: (query: string) => void
}

// a festival's line-up posters, searched for artists when its timetable is not out yet
const lineupOf = (festivalId: string): string[] => catalogEntry(festivalId)?.lineup.map((image) => image.alt) ?? []

/** Every registered festival: search (name, place or artist), year chips ("전체" first), then the festivals by month. */
export function BrowseFestivals({ data, today, year, query, onYear, onQuery }: Props) {
  const all = [...CATALOG.flatMap((entry) => resolveFestival(data, entry.id)?.festival ?? []), ...data.archivedFestivals]
  const shown = inShownYear(all, year, activeFestival(data)?.festival.startDate.slice(0, 4))
  const groups = groupByMonth(
    shown.festivals.filter((f) => matchesQuery(f, query, lineupOf(f.id))),
    { withYear: shown.year === ALL_YEARS },
  )
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
        <input type="search" value={query} placeholder="이름·장소·아티스트로 찾기" onChange={(e) => onQuery(e.target.value)} />
      </label>
      <YearChips years={shown.years} shown={shown.year} onYear={onYear} />
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
                      note={artistHit(festival, query, lineupOf(festival.id)) ?? undefined}
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
