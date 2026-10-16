import type { Festival } from '../data/schema'
import { LogoMark } from './LogoMark'

export const APP_NAME = '두두페'

export function AppHeader({ festival }: { festival: Festival | null }) {
  return (
    <header className="app-header">
      <LogoMark />
      <h1 className="app-header__title">{festival?.name ?? APP_NAME}</h1>
    </header>
  )
}
