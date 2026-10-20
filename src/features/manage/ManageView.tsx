import { CATALOG } from '../../data/catalog'
import { resolveFestival } from '../../data/resolve'
import type { Festival, UserData } from '../../data/schema'
import { showNotice, updateData } from '../../data/store'
import { addMyFestival, removeMyFestival, setActiveFestival } from '../../data/userData'
import { formatDayLabel } from '../../lib/time'
import './manage.css'

interface Props {
  data: UserData
  /** Called after a festival is opened, to move to the timetable. */
  onOpen: () => void
}

const period = (f: Festival) =>
  f.startDate === f.endDate ? formatDayLabel(f.startDate) : `${formatDayLabel(f.startDate)} – ${formatDayLabel(f.endDate)}`

function FestivalRow({ festival, active, mine, onOpen }: { festival: Festival; active: boolean; mine: boolean; onOpen: () => void }) {
  const open = () => {
    updateData((d) => (mine ? setActiveFestival(d, festival.id) : addMyFestival(d, festival.id)))
    if (!mine) showNotice('info', `'${festival.name}'를 내 페스티벌에 추가했어요.`)
    onOpen()
  }
  const remove = () => {
    if (!window.confirm(`'${festival.name}'를 내 목록에서 뺄까요? 이 페스티벌에 남긴 핀과 티켓 링크도 지워져요.`)) return
    updateData((d) => removeMyFestival(d, festival.id))
  }
  return (
    <li className={`festival-row${active ? ' is-active' : ''}`}>
      <div className="festival-row__text">
        <span className="festival-row__name">{festival.name}</span>
        <span className="festival-row__meta">
          {period(festival)}
          {festival.venue.name && ` · ${festival.venue.name}`}
        </span>
      </div>
      <div className="festival-row__actions">
        {mine && (
          <button type="button" className="btn btn--small btn--ghost" onClick={remove}>
            빼기
          </button>
        )}
        <button type="button" className={`btn btn--small${mine ? '' : ' btn--accent'}`} onClick={open}>
          {mine ? (active ? '보는 중' : '보기') : '추가'}
        </button>
      </div>
    </li>
  )
}

/** Festivals come from the admin-maintained catalog; the user only picks which ones to follow. */
export function ManageView({ data, onOpen }: Props) {
  const mine = new Set(data.myFestivalIds)
  const catalog = CATALOG.flatMap((entry) => {
    const resolved = resolveFestival(data, entry.id)
    return resolved ? [resolved.festival] : []
  })

  return (
    <div className="manage">
      <section className="panel" aria-labelledby="manage-festivals">
        <h2 id="manage-festivals" className="panel__title">
          페스티벌 목록
        </h2>
        <p className="hint">가고 싶은 페스티벌을 추가하세요. 일정은 관리자가 등록하고 고쳐요.</p>
        <ul className="festival-list">
          {catalog.map((festival) => (
            <FestivalRow
              key={festival.id}
              festival={festival}
              mine={mine.has(festival.id)}
              active={data.activeFestivalId === festival.id}
              onOpen={onOpen}
            />
          ))}
        </ul>
      </section>

      {data.archivedFestivals.length > 0 && (
        <section className="panel" aria-labelledby="manage-archived">
          <h2 id="manage-archived" className="panel__title">
            예전에 직접 만든 페스티벌
          </h2>
          <p className="hint">이전 버전에서 직접 입력한 일정이에요. 보기만 할 수 있어요.</p>
          <ul className="festival-list">
            {data.archivedFestivals.map((festival) => (
              <FestivalRow
                key={festival.id}
                festival={festival}
                mine
                active={data.activeFestivalId === festival.id}
                onOpen={onOpen}
              />
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
