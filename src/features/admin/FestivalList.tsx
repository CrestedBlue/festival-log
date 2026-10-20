import type { FestivalOverview } from './overview'
import { statusOf } from './status'

interface Props {
  year: string
  rows: readonly FestivalOverview[]
  selectedKey: string | null
  onSelect: (key: string) => void
}

/** Left column: the chosen year's festivals in date order. */
export function FestivalList({ year, rows, selectedKey, onSelect }: Props) {
  return (
    <nav className="admin-list" aria-label={`${year}년 페스티벌`}>
      {rows.length === 0 ? (
        <p className="admin-list__empty">{year}년에 등록된 페스티벌이 없어요.</p>
      ) : (
        <ul>
          {rows.map((row) => {
            const status = statusOf(row)
            return (
              <li key={row.id}>
                <button
                  type="button"
                  className={`admin-item admin-item--${status.tone}`}
                  aria-current={row.key === selectedKey ? 'true' : undefined}
                  onClick={() => onSelect(row.key)}
                >
                  <span className="admin-item__name">{row.name}</span>
                  <span className="admin-item__meta">
                    {row.period}
                    {row.venue && ` · ${row.venue}`}
                  </span>
                  <span className="admin-item__foot">
                    <span className="admin-codes">
                      <code className="admin-codes__series">{row.series}</code>
                      <code>{row.key}</code>
                    </span>
                    <span className="admin-item__status">{status.label}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </nav>
  )
}
