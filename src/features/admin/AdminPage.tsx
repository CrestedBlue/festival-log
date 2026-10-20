import { useState } from 'react'
import { LogoMark } from '../../components/LogoMark'
import { CATALOG } from '../../data/catalog'
import { festivalMoment } from '../../lib/time'
import { FestivalDetail } from './FestivalDetail'
import { FestivalList } from './FestivalList'
import { catalogOverview } from './overview'
import { adminYears, festivalsOfYear, resolveSelection, selectionQuery, type AdminSelection, type AdminView } from './selection'
import './admin.css'

// Catalog festivals are app data: build them once.
const ROWS = catalogOverview(CATALOG)

/** The selection lives in the address (?year=…&festival=…&view=…), so a reload keeps it. */
function useAdminSelection(today: string) {
  const [search, setSearch] = useState(() => window.location.search)
  const selection = resolveSelection(new URLSearchParams(search), ROWS, today)
  const select = (next: AdminSelection) => {
    const query = selectionQuery(next)
    window.history.replaceState(null, '', `${window.location.pathname}${query}`)
    setSearch(query)
  }
  // Defaults (festival, view) for a year or festival come from the same rules as a fresh visit.
  const pick = (params: Record<string, string>) => select(resolveSelection(new URLSearchParams(params), ROWS, today))
  return {
    selection,
    selectYear: (year: string) => pick({ year }),
    selectFestival: (festival: string) => pick({ year: selection.year, festival }),
    selectView: (view: AdminView) => select({ ...selection, view }),
  }
}

/** Admin-only catalog page: the year's festivals on the left, the chosen one's timetable, map and notices on the right. */
export function AdminPage() {
  const today = festivalMoment(new Date()).day
  const { selection, selectYear, selectFestival, selectView } = useAdminSelection(today)
  const years = adminYears(ROWS, today)
  const rows = festivalsOfYear(ROWS, selection.year)
  const selected = rows.find((row) => row.key === selection.festivalKey) ?? null

  return (
    <div className="admin">
      {/* TODO(admin-auth): check that the viewer is the admin before showing this page. */}
      <header className="admin__bar">
        <LogoMark size={30} />
        <h1 className="admin__title">두두페 관리</h1>
        <div className="admin__years" role="group" aria-label="관리할 연도">
          {years.map((year) => (
            <button
              key={year}
              type="button"
              className="admin__year"
              aria-pressed={year === selection.year}
              onClick={() => selectYear(year)}
            >
              {year}
            </button>
          ))}
        </div>
        <a className="admin__app-link" href={import.meta.env.BASE_URL}>
          앱 열기
        </a>
      </header>
      <div className="admin__body">
        <FestivalList year={selection.year} rows={rows} selectedKey={selection.festivalKey} onSelect={selectFestival} />
        {/* A year with no festivals has nothing to show here (the list already says so). */}
        {selected && <FestivalDetail key={selected.id} row={selected} view={selection.view} onView={selectView} />}
      </div>
    </div>
  )
}
