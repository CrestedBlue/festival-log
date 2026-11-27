import type { ReactNode } from 'react'
import type { ResolvedFestival } from '../data/resolve'
import type { Festival } from '../data/schema'
import { LogoMark } from './LogoMark'

export const APP_NAME = '두두페'

interface Props {
  festival: Festival | null
  /** "GMF 2026" above the title (catalog festivals); without it the app logo stands beside the title. */
  edition: ResolvedFestival['edition']
  /** The festival's picture to the right of the title. */
  art: string | null
  /** Right under the title on every tab, above the timetable's day tickets (the add button of a festival opened to look at). */
  action?: ReactNode
  /** Controls under the title (the timetable's day tickets); the picture reaches down beside them. */
  children?: ReactNode
}

export function AppHeader({ festival, edition, art, action, children }: Props) {
  return (
    <header className={['app-header', children && 'app-header--with-controls', action && 'app-header--with-action'].filter(Boolean).join(' ')}>
      <div className="app-header__text">
        {edition && (
          <p className="app-header__eyebrow">
            {edition.series.toUpperCase()} {edition.year}
          </p>
        )}
        <div className="app-header__title-row">
          {!edition && <LogoMark />}
          <h1 className="app-header__title">{festival?.name ?? APP_NAME}</h1>
        </div>
      </div>
      {action && <div className="app-header__action">{action}</div>}
      {art && <img className="app-header__art" src={art} alt="" width="96" height="66" />}
      {children && <div className="app-header__controls">{children}</div>}
    </header>
  )
}
