import { useState } from 'react'
import { LogoMark } from '../../components/LogoMark'
import { CATALOG } from '../../data/catalog'
import { SERIES } from '../../data/catalog/series'
import { festivalMoment } from '../../lib/time'
import { seriesOverview } from './overview'
import { resolveSelection, selectionQuery, type AdminSection, type AdminSelection, type AdminView } from './selection'
import { SeriesDetail } from './SeriesDetail'
import { SeriesList } from './SeriesList'
import './admin.css'

// Catalog festivals are app data: build them once.
const SERIES_ROWS = seriesOverview(CATALOG, SERIES)

const SECTIONS: ReadonlyArray<readonly [AdminSection, string]> = [
  ['festivals', '페스티벌'],
  ['cs', 'CS'],
]

/** The selection lives in the address (?festival=…&year=…&view=…, or ?tab=cs), so a reload keeps it. */
function useAdminSelection(today: string) {
  const [search, setSearch] = useState(() => window.location.search)
  const selection = resolveSelection(new URLSearchParams(search), SERIES_ROWS, today)
  const select = (next: AdminSelection) => {
    const query = selectionQuery(next)
    window.history.replaceState(null, '', `${window.location.pathname}${query}`)
    setSearch(query)
  }
  // Defaults (year, view) for a festival or year come from the same rules as a fresh visit.
  const pick = (params: Record<string, string>) => select(resolveSelection(new URLSearchParams(params), SERIES_ROWS, today))
  return {
    selection,
    selectSection: (section: AdminSection) => select({ ...selection, section }),
    selectSeries: (festival: string) => pick({ festival }),
    selectYear: (year: string) => pick({ festival: selection.series ?? '', year }),
    selectView: (view: AdminView) => select({ ...selection, view }),
  }
}

/** Admin-only page: festivals by festival code on the left; the chosen one's timetable, map and notices on the right. */
export function AdminPage() {
  const today = festivalMoment(new Date()).day
  const { selection, selectSection, selectSeries, selectYear, selectView } = useAdminSelection(today)
  const selected = SERIES_ROWS.find((s) => s.code === selection.series) ?? null

  return (
    <div className="admin">
      {/* TODO(admin-auth): check that the viewer is the admin before showing this page. */}
      <header className="admin__bar">
        <LogoMark size={30} />
        <h1 className="admin__title">두두페 관리</h1>
        <nav className="admin-nav" aria-label="관리 메뉴">
          {SECTIONS.map(([section, label]) => (
            <button
              key={section}
              type="button"
              className="admin-nav__item"
              aria-current={selection.section === section ? 'page' : undefined}
              onClick={() => selectSection(section)}
            >
              {label}
            </button>
          ))}
        </nav>
        <a className="admin__app-link" href={import.meta.env.BASE_URL}>
          앱 열기
        </a>
      </header>
      {selection.section === 'cs' ? (
        <main className="admin-cs">
          <p className="admin-empty">CS 화면은 아직 내용이 정해지지 않았어요.</p>
        </main>
      ) : (
        <div className="admin__body">
          <SeriesList series={SERIES_ROWS} selected={selection.series} onSelect={selectSeries} />
          {selected && (
            <SeriesDetail key={selected.code} series={selected} year={selection.year} view={selection.view} onYear={selectYear} onView={selectView} />
          )}
        </div>
      )}
    </div>
  )
}
