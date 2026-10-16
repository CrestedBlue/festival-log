import type { ReactNode } from 'react'
import type { Tab } from '../lib/route'
import { ManageIcon, MapIcon, TimetableIcon } from './icons'

const ITEMS: ReadonlyArray<{ tab: Tab; label: string; icon: ReactNode }> = [
  { tab: 'timetable', label: '타임테이블', icon: <TimetableIcon /> },
  { tab: 'map', label: '지도', icon: <MapIcon /> },
  { tab: 'manage', label: '관리', icon: <ManageIcon /> },
]

export function BottomNav({ active, onSelect }: { active: Tab; onSelect: (tab: Tab) => void }) {
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
          {item.icon}
          {item.label}
        </button>
      ))}
    </nav>
  )
}
