import { Suspense, lazy, type KeyboardEvent } from 'react'
import { AdminTimetable } from './AdminTimetable'
import type { FestivalOverview } from './overview'
import { ADMIN_VIEWS, type AdminView } from './selection'

// Leaflet is the heaviest dependency: load it when the map view opens.
const AdminMap = lazy(() => import('./AdminMap'))

const VIEW_LABELS: Record<AdminView, string> = { timetable: '타임테이블', map: '지도', notices: '주의사항' }

interface Props {
  row: FestivalOverview
  view: AdminView
  onView: (view: AdminView) => void
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

function ViewBody({ row, view }: Pick<Props, 'row' | 'view'>) {
  const { festival } = row
  if (view === 'notices') return <Notices notices={row.notices} />
  if (!festival) return <p className="admin-empty">페스티벌을 만들지 못해서 보여줄 수 없어요.</p>
  if (view === 'map') {
    return (
      <Suspense fallback={<p className="admin-empty">지도 불러오는 중…</p>}>
        <AdminMap key={festival.id} festival={festival} />
      </Suspense>
    )
  }
  return <AdminTimetable key={festival.id} festival={festival} />
}

/** Right column: the selected festival, with its timetable, map and notices. */
export function FestivalDetail({ row, view, onView }: Props) {
  const titleId = `detail-${row.id}`
  // Arrow keys move between the view tabs (WAI-ARIA tabs pattern).
  const onTabKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!step) return
    const next = ADMIN_VIEWS[(ADMIN_VIEWS.indexOf(view) + step + ADMIN_VIEWS.length) % ADMIN_VIEWS.length]
    if (!next) return
    onView(next)
    e.currentTarget.querySelector<HTMLButtonElement>(`[data-view="${next}"]`)?.focus()
  }
  const stats = [row.days === null ? null : `${row.days}일`, `스테이지 ${row.stageCount}`, `공연 ${row.performanceCount}`, `핀 ${row.pinCount}`]

  return (
    <section className="admin-detail" aria-labelledby={titleId}>
      <header className="admin-detail__head">
        <p className="admin-codes admin-codes--head">
          <code className="admin-codes__series">{row.series}</code>
          <code>{row.key}</code>
        </p>
        <h2 id={titleId} className="admin-detail__name">
          {row.name}
        </h2>
        <p className="admin-detail__meta">
          {row.period}
          {row.venue && ` · ${row.venue}`}
        </p>
        <ul className="admin-detail__stats">
          {stats.filter(Boolean).map((stat) => (
            <li key={stat}>{stat}</li>
          ))}
        </ul>
        {row.problems.length > 0 && (
          <ul className="admin-detail__problems" role="alert">
            {row.problems.map((problem, i) => (
              <li key={i}>{problem}</li>
            ))}
          </ul>
        )}
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
        <ViewBody row={row} view={view} />
      </div>
    </section>
  )
}
