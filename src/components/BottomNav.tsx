import type { ReactNode } from 'react'
import type { Tab } from '../lib/route'
import { InfoIcon, ManageIcon, MapIcon, TimetableIcon } from './icons'

const ITEMS: ReadonlyArray<{ tab: Tab; label: string; icon: ReactNode }> = [
  { tab: 'timetable', label: '타임테이블', icon: <TimetableIcon /> },
  { tab: 'map', label: '지도', icon: <MapIcon /> },
  { tab: 'info', label: '정보', icon: <InfoIcon /> },
  { tab: 'manage', label: '관리', icon: <ManageIcon /> },
]

interface Props {
  active: Tab
  onSelect: (tab: Tab) => void
  /** Tabs with something new (a red dot): the manage tab when a festival on my list got new content. */
  news?: Partial<Record<Tab, boolean>>
}

export function BottomNav({ active, onSelect, news = {} }: Props) {
  return (
    <nav className="bottom-nav" aria-label="주요 화면">
      {ITEMS.map((item) => (
        <button
          key={item.tab}
          type="button"
          className="bottom-nav__item"
          aria-current={active === item.tab ? 'page' : undefined}
          onClick={() => onSelect(item.tab)}
        >
          <span className="bottom-nav__icon">
            {item.icon}
            {news[item.tab] && <span className="new-dot" aria-hidden="true" />}
          </span>
          {item.label}
          {news[item.tab] && <span className="visually-hidden"> (새 소식)</span>}
        </button>
      ))}
    </nav>
  )
}
