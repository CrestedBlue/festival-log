import type { Festival } from '../data/schema'
import { formatDayLabel } from '../lib/time'

export function AppHeader({ festival }: { festival: Festival | null }) {
  return (
    <header className="app-header">
      <div style={{ minWidth: 0 }}>
        <h1 className="app-header__title">{festival?.name ?? '페스티벌 로그'}</h1>
        {festival && (
          <p className="app-header__meta">
            {formatDayLabel(festival.startDate)}
            {festival.endDate !== festival.startDate && ` – ${formatDayLabel(festival.endDate)}`}
            {festival.venue.name && ` · ${festival.venue.name}`}
          </p>
        )}
      </div>
    </header>
  )
}
