import { Suspense, lazy } from 'react'
import { AppHeader } from './components/AppHeader'
import { BottomNav } from './components/BottomNav'
import { EmptyState } from './components/EmptyState'
import { NoticeBanner } from './components/NoticeBanner'
import { NowStrip } from './components/NowStrip'
import { dismissNotice, selectActiveFestival, useAppState } from './data/store'
import { InfoView } from './features/info/InfoView'
import { ManageView } from './features/manage/ManageView'
import { TimetableView } from './features/timetable/TimetableView'
import { useHashRoute } from './hooks/useHashRoute'
import { useNow } from './hooks/useNow'

// Leaflet is the heaviest dependency, so it only loads when the map tab opens.
const MapView = lazy(() => import('./features/map/MapView'))

export default function App() {
  const { data, notice } = useAppState()
  const resolved = selectActiveFestival(data)
  const festival = resolved?.festival ?? null
  const route = useHashRoute()
  const now = useNow()

  const renderView = () => {
    if (route.tab === 'manage') return <ManageView data={data} />
    if (!festival) return <EmptyState onOpenList={() => route.go('manage')} />
    if (route.tab === 'info') {
      return <InfoView festivalId={festival.id} ticketLink={data.ticketLinks[festival.id] ?? null} notices={resolved?.notices ?? []} />
    }
    if (route.tab === 'map') {
      return (
        <Suspense fallback={<p className="timetable__empty">지도 불러오는 중…</p>}>
          <MapView
            key={festival.id}
            festival={festival}
            userPinIds={new Set((data.userPins[festival.id] ?? []).map((pin) => pin.id))}
          />
        </Suspense>
      )
    }
    return (
      <TimetableView
        key={festival.id}
        festival={festival}
        favorites={data.favorites}
        now={now}
        params={route.params}
        setParams={(params) => route.setParams('timetable', params)}
      />
    )
  }

  return (
    <div className="app-shell">
      <AppHeader festival={festival} />
      {festival && <NowStrip festival={festival} favorites={data.favorites} now={now} />}
      <main className="app-main">
        {notice && <NoticeBanner key={notice.id} notice={notice} onDismiss={dismissNotice} />}
        {renderView()}
      </main>
      <BottomNav active={route.tab} onSelect={route.go} />
    </div>
  )
}
