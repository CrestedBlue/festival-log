import { ChevronRightIcon } from '../../components/icons'
import { activeFestival } from '../../data/resolve'
import type { UserData } from '../../data/schema'
import { BrowseFestivals } from './BrowseFestivals'
import { MyFestivals } from './MyFestivals'
import './manage.css'

type Section = 'mine' | 'browse'

interface Props {
  data: UserData
  /** view (mine | browse), year and q live in the address so Back and reloads keep them. */
  params: URLSearchParams
  setParams: (params: Record<string, string | undefined>) => void
  today: string
  /** Opens the festival being viewed (its timetable, or its map before there is one). */
  onOpenActive: () => void
}

export function ManageView({ data, params, setParams, today, onOpenActive }: Props) {
  const active = activeFestival(data)?.festival ?? null
  const requested = params.get('view')
  // Someone with nothing added yet starts on the catalog.
  const section: Section = requested === 'browse' || requested === 'mine' ? requested : data.myFestivalIds.length > 0 ? 'mine' : 'browse'
  const update = (next: { view?: Section; year?: string; q?: string }) =>
    setParams({
      view: next.view ?? section,
      year: next.year ?? params.get('year') ?? undefined,
      q: (next.q ?? params.get('q') ?? '') || undefined,
    })

  return (
    <div className="manage">
      <div className="segmented" role="group" aria-label="페스티벌 목록">
        <button type="button" aria-pressed={section === 'mine'} onClick={() => update({ view: 'mine' })}>
          내 페스티벌
        </button>
        <button type="button" aria-pressed={section === 'browse'} onClick={() => update({ view: 'browse' })}>
          둘러보기
        </button>
      </div>

      {section === 'mine' ? (
        <MyFestivals data={data} today={today} onBrowse={() => update({ view: 'browse' })} />
      ) : (
        <BrowseFestivals
          data={data}
          today={today}
          year={params.get('year')}
          query={params.get('q') ?? ''}
          onYear={(year) => update({ year })}
          onQuery={(q) => update({ q })}
        />
      )}

      {active && (
        <button type="button" className="active-bar" onClick={onOpenActive}>
          <span className="active-bar__dot" aria-hidden="true" />
          <span className="active-bar__text">보는 중 · {active.name}</span>
          <ChevronRightIcon />
        </button>
      )}
    </div>
  )
}
