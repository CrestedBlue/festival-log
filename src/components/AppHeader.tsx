import type { Festival } from '../data/schema'

export function AppHeader({ festival }: { festival: Festival | null }) {
  return (
    <header className="app-header">
      <h1 className="app-header__title">{festival?.name ?? '페스티벌 로그'}</h1>
    </header>
  )
}
