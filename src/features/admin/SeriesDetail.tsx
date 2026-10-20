import { Suspense, lazy, type KeyboardEvent } from 'react'
import { sourceHref, sourceLabel } from '../../data/catalog/series/sources'
import type { CollectionSource } from '../../data/catalog/series/types'
import { AdminTimetable } from './AdminTimetable'
import type { FestivalOverview, SeriesOverview } from './overview'
import { ADMIN_VIEWS, type AdminView } from './selection'

// Leaflet is the heaviest dependency: load it when the map view opens.
const AdminMap = lazy(() => import('./AdminMap'))

const VIEW_LABELS: Record<AdminView, string> = { timetable: '타임테이블', map: '지도', notices: '주의사항' }

function Sources({ sources }: { sources: readonly CollectionSource[] }) {
  return (
    <ul className="admin-sources" aria-label="수집 대상">
      {sources.map((source) => (
        <li key={`${source.method}-${source.value}`} className="admin-source">
          <span className="admin-source__method">{source.method}</span>
          <a href={sourceHref(source)} target="_blank" rel="noopener noreferrer">
            {sourceLabel(source)}
          </a>
          <span className="admin-source__date">마지막 스크랩 {source.lastScrapedPostDate ?? '없음'}</span>
        </li>
      ))}
    </ul>
  )
}

function Notices({ notices }: { notices: readonly string[] }) {
  if (notices.length === 0) return <p className="admin-empty">아직 등록된 주의사항이 없어요.</p>
  return (
    <ol className="admin-notices">
      {notices.map((notice, i) => (
        <li key={i}>{notice}</li>
      ))}
    </ol>
  )
}

function ViewBody({ series, edition, view }: { series: string; edition: FestivalOverview | null; view: AdminView }) {
  if (!edition) return <p className="admin-empty">아직 등록된 회차가 없어요.</p>
  if (view === 'notices') return <Notices notices={edition.notices} />
  const { festival } = edition
  if (!festival) return <p className="admin-empty">이 회차를 만들지 못해서 보여줄 수 없어요.</p>
  if (view === 'map') {
    return (
      <Suspense fallback={<p className="admin-empty">지도 불러오는 중…</p>}>
        {/* The map belongs to the festival code: switching years keeps it as it is. */}
        <AdminMap key={series} festival={festival} />
      </Suspense>
    )
  }
  return <AdminTimetable key={edition.id} festival={festival} lineup={edition.lineup} />
}

interface Props {
  series: SeriesOverview
  year: string | null
  view: AdminView
  onYear: (year: string) => void
  onView: (view: AdminView) => void
}

/** Right column: where it is collected from, which year, its edition id, then timetable / map / notices. */
export function SeriesDetail({ series, year, view, onYear, onView }: Props) {
  const edition = series.editions.find((e) => e.year === year) ?? null
  // Arrow keys move between the view tabs (WAI-ARIA tabs pattern).
  const onTabKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!step) return
    const next = ADMIN_VIEWS[(ADMIN_VIEWS.indexOf(view) + step + ADMIN_VIEWS.length) % ADMIN_VIEWS.length]
    if (!next) return
    onView(next)
    e.currentTarget.querySelector<HTMLButtonElement>(`[data-view="${next}"]`)?.focus()
  }

  return (
    <section className="admin-detail" aria-label={series.name}>
      <header className="admin-detail__bar">
        <Sources sources={series.sources} />
        <div className="admin-detail__edition">
          <div className="admin-years" role="group" aria-label="연도">
            {series.editions.map((e) => (
              <button key={e.id} type="button" className="admin-year" aria-pressed={e.year === year} onClick={() => onYear(e.year)}>
                {e.year}
              </button>
            ))}
          </div>
          {edition && (
            <p className="admin-edition-id">
              <span>회차 ID</span> <code>{edition.key}</code> <code className="admin-edition-id__uuid">{edition.id}</code>
            </p>
          )}
        </div>
      </header>
      <div className="admin-tabs" role="tablist" aria-label="보기" onKeyDown={onTabKey}>
        {ADMIN_VIEWS.map((v) => (
          <button
            key={v}
            type="button"
            role="tab"
            data-view={v}
            id={`tab-${v}`}
            aria-selected={v === view}
            aria-controls="admin-view"
            tabIndex={v === view ? 0 : -1}
            className="admin-tabs__tab"
            onClick={() => onView(v)}
          >
            {VIEW_LABELS[v]}
          </button>
        ))}
      </div>
      <div id="admin-view" className={`admin-view admin-view--${view}`} role="tabpanel" aria-labelledby={`tab-${view}`}>
        <ViewBody series={series.code} edition={edition} view={view} />
      </div>
    </section>
  )
}
