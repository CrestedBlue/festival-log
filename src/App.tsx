import { Suspense, lazy, useEffect, type CSSProperties } from 'react'
import { AddFestivalBar } from './components/AddFestivalBar'
import { AppHeader } from './components/AppHeader'
import { BottomNav } from './components/BottomNav'
import { NoticeBanner } from './components/NoticeBanner'
import { NowStrip } from './components/NowStrip'
import { dismissNotice, selectActiveFestival, updateData, useAppState } from './data/store'
import { isMine, showSavedFestival } from './data/userData'
import { newContentAnywhere } from './data/updates'
import { InfoView } from './features/info/InfoView'
import { ManageView } from './features/manage/ManageView'
import { timetableSelection } from './features/timetable/selection'
import { TimetableControls } from './features/timetable/TimetableControls'
import { TimetableView } from './features/timetable/TimetableView'
import { useHashRoute } from './hooks/useHashRoute'
import { useNow } from './hooks/useNow'
import { useOnline } from './hooks/useOnline'
import { loadChunk } from './lib/chunkReload'
import { syncFestivalFiles } from './lib/festivalFiles'
import { FESTIVAL_TABS, homeTab, shownTab, type ClosableTab } from './lib/route'
import { festivalMoment } from './lib/time'

// Leaflet is the heaviest dependency, so it only loads when the map tab opens (after an update the old file can be
// gone: see lib/chunkReload).
const MapView = lazy(() => loadChunk(() => import('./features/map/MapView')))
const NONE_CLOSED: readonly ClosableTab[] = []
const NO_FAVORITES: readonly string[] = []

export default function App() {
  const { data, notice } = useAppState()
  const resolved = selectActiveFestival(data)
  const festival = resolved?.festival ?? null
  const lineup = resolved?.lineup ?? []
  // An edition whose timetable or map is not out yet keeps that tab closed (catalog `closedTabs`).
  const closedTabs = resolved?.closedTabs ?? NONE_CLOSED
  const home = homeTab(festival, lineup.length, closedTabs)
  const route = useHashRoute(home)
  // With no festival on my list the festival tabs are locked and the catalog shows instead.
  const tab = shownTab(route.tab, festival !== null, closedTabs, home)
  const { setParams } = route
  useEffect(() => {
    // the address follows, without a history entry (a link to a locked or closed tab, the first launch)
    if (tab === route.tab) return
    if (tab === 'manage') setParams('manage', { view: 'browse' })
    else setParams(tab, {})
  }, [tab, route.tab, setParams])
  const now = useNow()
  const today = festivalMoment(now).day
  const selection = festival ? timetableSelection(festival, route.params, today) : null
  const accent = resolved?.theme?.accent ?? null
  // a festival opened from the catalog but not on my list: view-only (no favorites, pins or ticket link)
  const readOnly = festival !== null && !isMine(data, festival.id)
  const favorites = readOnly ? NO_FAVORITES : data.favorites
  const online = useOnline()
  // only my festivals' maps and posters are kept for offline use; online again, the missing ones come in
  const myIds = data.myFestivalIds.join(' ')
  useEffect(() => {
    if (online) void syncFestivalFiles(myIds ? myIds.split(' ') : [])
  }, [myIds, online])
  // offline, a festival only looked at is not saved: show one of mine instead
  useEffect(() => {
    if (!online && readOnly) updateData(showSavedFestival)
  }, [online, readOnly])

  const renderView = () => {
    if (tab === 'manage' || !festival) {
      return (
        <ManageView
          data={data}
          params={route.params}
          setParams={(params) => route.setParams('manage', params)}
          today={today}
          online={online}
        />
      )
    }
    if (tab === 'info') {
      return (
        <InfoView
          festivalId={festival.id}
          ticketLink={data.ticketLinks[festival.id] ?? null}
          notices={resolved?.notices ?? []}
          noticeBlocks={resolved?.noticeBlocks ?? []}
          sources={resolved?.sources ?? []}
          tickets={resolved?.tickets ?? []}
          closedTabs={closedTabs}
          readOnly={readOnly}
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
            readOnly={readOnly}
          />
        </Suspense>
      )
    }
    return (
      <TimetableView
        key={festival.id}
        festival={festival}
        lineup={lineup}
        favorites={favorites}
        now={now}
        selection={selection ?? timetableSelection(festival, route.params, today)}
        readOnly={readOnly}
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
      <AppHeader
        festival={festival}
        edition={resolved?.edition ?? null}
        art={resolved?.theme?.art ?? null}
        action={readOnly && festival && tab !== 'manage' ? <AddFestivalBar festival={festival} /> : undefined}
      />
      {/* the timetable's day tickets: a block of their own under the header, so neither moves the other */}
      {showControls && festival && selection && (
        <div className="app-controls">
          <TimetableControls
            festival={festival}
            favorites={favorites}
            selection={selection}
            readOnly={readOnly}
            today={today}
            setParams={(params) => route.setParams('timetable', params)}
            edition={resolved?.edition ?? null}
            accent={accent}
            art={resolved?.theme?.art ?? null}
          />
        </div>
      )}
      {/* The timetable shows what is on in its own sets; the strip covers the other tabs. */}
      {festival && tab !== 'timetable' && <NowStrip festival={festival} favorites={favorites} now={now} />}
      <main className="app-main">
        {notice && <NoticeBanner key={notice.id} notice={notice} onDismiss={dismissNotice} />}
        {renderView()}
      </main>
      <BottomNav
        active={tab}
        onSelect={route.go}
        locked={festival ? closedTabs : FESTIVAL_TABS}
        lockedNote={festival ? '공식 발표가 나오면 열려요' : '페스티벌을 추가하면 열려요'}
        news={{ manage: newContentAnywhere(data) }}
      />
    </div>
  )
}
