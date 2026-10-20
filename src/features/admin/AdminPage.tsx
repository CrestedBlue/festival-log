import { LogoMark } from '../../components/LogoMark'
import { CATALOG } from '../../data/catalog'
import { catalogOverview, type FestivalOverview } from './overview'
import './admin.css'

type Tone = 'ready' | 'pending' | 'error'

const statusOf = (row: FestivalOverview): { tone: Tone; label: string } => {
  if (row.problems.length > 0) return { tone: 'error', label: `오류 ${row.problems.length}` }
  if (row.missing.length > 0) return { tone: 'pending', label: '준비 중' }
  return { tone: 'ready', label: '완료' }
}

function FestivalCard({ row }: { row: FestivalOverview }) {
  const status = statusOf(row)
  const titleId = `festival-${row.id}`
  const stats: ReadonlyArray<readonly [label: string, value: number | null]> = [
    ['일', row.days],
    ['스테이지', row.stageCount],
    ['공연', row.performanceCount],
    ['핀', row.pinCount],
    ['주의사항', row.noticeCount],
  ]
  return (
    <article className={`admin-card admin-card--${status.tone}`} aria-labelledby={titleId}>
      <header className="admin-card__head">
        <h2 id={titleId} className="admin-card__name">
          {row.name}
        </h2>
        <span className="admin-card__status">{status.label}</span>
      </header>
      <p className="admin-card__meta">
        {row.period}
        {row.venue && ` · ${row.venue}`} · {row.hasIllustratedMap ? '직접 그린 지도' : '기본 지도(OSM)'}
      </p>
      <dl className="admin-card__stats">
        {stats.map(([label, value]) => (
          <div key={label} className="admin-stat">
            <dt>{label}</dt>
            <dd>{value ?? '–'}</dd>
          </div>
        ))}
      </dl>
      {row.missing.length > 0 && <p className="admin-card__missing">아직 없음 · {row.missing.join(', ')}</p>}
      {row.problems.length > 0 && (
        <ul className="admin-card__problems" role="alert">
          {row.problems.map((problem, i) => (
            <li key={i}>{problem}</li>
          ))}
        </ul>
      )}
      {row.notices.length > 0 && (
        <details className="admin-card__notices">
          <summary>주의사항 {row.notices.length}개 보기</summary>
          <ol>
            {row.notices.map((notice, i) => (
              <li key={i}>{notice}</li>
            ))}
          </ol>
        </details>
      )}
      <p className="admin-card__ids">
        <span className="admin-card__id">
          <b>ID</b> <code>{row.id}</code>
        </span>
        <span className="admin-card__id">
          <b>키</b> <code>{row.key}</code>
        </span>
      </p>
    </article>
  )
}

/** Admin-only overview of the festival catalog. Read-only: the catalog is edited in src/data/catalog/. */
export function AdminPage() {
  const rows = catalogOverview(CATALOG)
  const needsWork = rows.filter((row) => statusOf(row).tone !== 'ready').length
  return (
    <div className="admin">
      <header className="admin__header">
        <LogoMark size={34} />
        <div className="admin__titles">
          <p className="admin__kicker">두두페 관리자</p>
          <h1 className="admin__title">페스티벌 카탈로그</h1>
        </div>
        <a className="admin__app-link" href={import.meta.env.BASE_URL}>
          앱 열기
        </a>
      </header>
      <main className="admin__main">
        {/* TODO(admin-auth): check that the viewer is the admin before showing this page. */}
        <p className="admin__note" role="note">
          아직 관리자 확인 없이 열리는 페이지예요. 페스티벌 추가·수정은 저장소의 <code>src/data/catalog/</code> 파일을 고쳐
          push 해요.
        </p>
        <p className="admin__summary">
          페스티벌 <strong>{rows.length}</strong>
          <span aria-hidden="true"> · </span>
          손볼 것 <strong>{needsWork}</strong>
        </p>
        <ol className="admin__list">
          {rows.map((row) => (
            <li key={row.id}>
              <FestivalCard row={row} />
            </li>
          ))}
        </ol>
      </main>
    </div>
  )
}
