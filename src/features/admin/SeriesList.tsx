import type { SeriesOverview } from './overview'

interface Props {
  series: readonly SeriesOverview[]
  selected: string | null
  onSelect: (code: string) => void
}

/** Left column: every festival once, by its festival code (the same every year). */
export function SeriesList({ series, selected, onSelect }: Props) {
  return (
    <nav className="admin-list" aria-label="페스티벌">
      {series.length === 0 ? (
        <p className="admin-list__empty">등록된 페스티벌이 없어요.</p>
      ) : (
        <ul>
          {series.map((s) => (
            <li key={s.code}>
              <button type="button" className="admin-item" aria-current={s.code === selected ? 'true' : undefined} onClick={() => onSelect(s.code)}>
                <span className="admin-item__name">{s.name}</span>
                <span className="admin-item__foot">
                  <code className="admin-code">{s.code}</code>
                  <span className="admin-item__years">{s.editions.map((e) => e.year).join(' · ') || '회차 없음'}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </nav>
  )
}
