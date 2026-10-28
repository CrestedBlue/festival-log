import { Suspense, lazy, useEffect, type CSSProperties } from 'react'
import { AppHeader } from './components/AppHeader'
import { BottomNav } from './components/BottomNav'
import { NoticeBanner } from './components/NoticeBanner'
import { NowStrip } from './components/NowStrip'
import { dismissNotice, selectActiveFestival, useAppState } from './data/store'
import { newContentAnywhere } from './data/updates'
import { InfoView } from './features/info/InfoView'
import { ManageView } from './features/manage/ManageView'
import { timetableSelection } from './features/timetable/selection'
import { TimetableControls } from './features/timetable/TimetableControls'
import { TimetableView } from './features/timetable/TimetableView'
import { useHashRoute } from './hooks/useHashRoute'
import { useNow } from './hooks/useNow'
import { FESTIVAL_TABS, homeTab, shownTab } from './lib/route'
import { festivalMoment } from './lib/time'

// Leaflet is the heaviest dependency, so it only loads when the map tab opens.
const MapView = lazy(() => import('./features/map/MapView'))

export default function App() {
  const { data, notice } = useAppState()
  const resolved = selectActiveFestival(data)
  const festival = resolved?.festival ?? null
  const lineup = resolved?.lineup ?? []
  const route = useHashRoute(homeTab(festival, lineup.length))
  // With no festival on my list the festival tabs are locked and the catalog shows instead.
  const tab = shownTab(route.tab, festival !== null)
  const { setParams } = route
  useEffect(() => {
    // the address follows, without a history entry (a link to a locked tab, the first launch)
    if (tab !== route.tab) setParams('manage', { view: 'browse' })
  }, [tab, route.tab, setParams])
  const now = useNow()
  const today = festivalMoment(now).day
  const selection = festival ? timetableSelection(festival, route.params, today) : null
  const accent = resolved?.theme?.accent ?? null

  const renderView = () => {
    if (tab === 'manage' || !festival) {
      return (
        <ManageView
          data={data}
          params={route.params}
          setParams={(params) => route.setParams('manage', params)}
          today={today}
        />
      )
    }
    if (tab === 'info') {
      return (
        <InfoView
          festivalId={festival.id}
          ticketLink={data.ticketLinks[festival.id] ?? null}
          notices={resolved?.notices ?? []}
          guides={resolved?.guides ?? []}
          sources={resolved?.sources ?? []}
          tickets={resolved?.tickets ?? []}
        />
      )
    }
    if (tab === 'map') {
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
        lineup={lineup}
        favorites={data.favorites}
        now={now}
        selection={selection ?? timetableSelection(festival, route.params, today)}
      />
    )
  }

  const showControls = tab === 'timetable' && festival !== null && festival.performances.length > 0

  return (
    // The festival's main color drives the selected day, the selected tab and the "my plan" switch.
    <div
      className="app-shell"
      data-themed={accent ? '' : undefined}
      style={accent ? ({ '--festival-accent': accent } as CSSProperties) : undefined}
    >
      <AppHeader festival={festival} edition={resolved?.edition ?? null} art={resolved?.theme?.art ?? null}>
        {showControls && festival && selection && (
          <TimetableControls
            festival={festival}
            favorites={data.favorites}
            selection={selection}
            today={today}
            setParams={(params) => route.setParams('timetable', params)}
            edition={resolved?.edition ?? null}
            accent={accent}
            art={resolved?.theme?.art ?? null}
          />
        )}
      </AppHeader>
      {/* The timetable shows what is on in its own sets; the strip covers the other tabs. */}
      {festival && tab !== 'timetable' && <NowStrip festival={festival} favorites={data.favorites} now={now} />}
      <main className="app-main">
        {notice && <NoticeBanner key={notice.id} notice={notice} onDismiss={dismissNotice} />}
        {renderView()}
      </main>
      <BottomNav
        active={tab}
        onSelect={route.go}
        locked={festival ? [] : FESTIVAL_TABS}
        news={{ manage: newContentAnywhere(data) }}
      />
    </div>
  )
}
