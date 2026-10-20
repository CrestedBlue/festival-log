import { useState } from 'react'
import { PlusIcon } from '../../components/icons'
import { CATALOG } from '../../data/catalog'
import { activeFestival, resolveFestival } from '../../data/resolve'
import type { Festival, UserData } from '../../data/schema'
import { showNotice, updateData } from '../../data/store'
import { addMyFestival, removeMyFestival, setActiveFestival } from '../../data/userData'
import { formatDayLabel, listDays } from '../../lib/time'
import { groupByYear } from './years'
import './manage.css'

const period = (f: Festival) =>
  f.startDate === f.endDate ? formatDayLabel(f.startDate) : `${formatDayLabel(f.startDate)} – ${formatDayLabel(f.endDate)}`

function CurrentFestival({ festival }: { festival: Festival | null }) {
  if (!festival) {
    return (
      <section className="panel current" aria-label="지금 보는 페스티벌">
        <p className="current__empty">선택된 페스티벌이 없어요</p>
      </section>
    )
  }
  const remove = () => {
    if (!window.confirm(`'${festival.name}'를 내 목록에서 뺄까요? 이 페스티벌에 남긴 핀과 티켓 링크도 지워져요.`)) return
    updateData((d) => removeMyFestival(d, festival.id))
  }
  return (
    <section className="panel current" aria-label="지금 보는 페스티벌">
      <h2 className="current__name">{festival.name}</h2>
      <p className="current__meta">
        {period(festival)}
        {festival.venue.name && ` · ${festival.venue.name}`}
      </p>
      <ul className="current__stats">
        <li>{listDays(festival.startDate, festival.endDate).length}일</li>
        <li>스테이지 {festival.stages.length}</li>
        <li>공연 {festival.performances.length}</li>
      </ul>
      <button type="button" className="current__remove" onClick={remove}>
        목록에서 빼기
      </button>
    </section>
  )
}

function FestivalBrowser({ data, onPicked }: { data: UserData; onPicked: () => void }) {
  const all = [
    ...CATALOG.flatMap((entry) => resolveFestival(data, entry.id)?.festival ?? []),
    ...data.archivedFestivals,
  ]
  const groups = groupByYear(all)
  const currentYear = activeFestival(data)?.festival.startDate.slice(0, 4)
  const [year, setYear] = useState(groups.some((g) => g.year === currentYear) ? currentYear : groups[0]?.year)
  const shown = groups.find((g) => g.year === year)?.festivals ?? []
  const mine = new Set(data.myFestivalIds)
  const archived = new Set(data.archivedFestivals.map((f) => f.id))

  const pick = (festival: Festival) => {
    const isMine = mine.has(festival.id)
    updateData((d) => (isMine ? setActiveFestival(d, festival.id) : addMyFestival(d, festival.id)))
    showNotice('info', isMine ? `'${festival.name}'로 바꿨어요.` : `'${festival.name}'를 추가했어요.`)
    onPicked()
  }

  return (
    <section className="panel browser" aria-label="등록된 페스티벌">
      <div className="chip-row" role="group" aria-label="연도">
        {groups.map((g) => (
          <button key={g.year} type="button" className="chip" aria-pressed={g.year === year} onClick={() => setYear(g.year)}>
            {g.year}
          </button>
        ))}
      </div>
      <ul className="browser__list">
        {shown.map((festival) => {
          const active = data.activeFestivalId === festival.id
          const state = active ? '보는 중' : mine.has(festival.id) ? '추가됨' : null
          return (
            <li key={festival.id}>
              <button type="button" className={`browser__item${active ? ' is-active' : ''}`} onClick={() => pick(festival)}>
                <span className="browser__text">
                  <span className="browser__name">
                    {festival.name}
                    {archived.has(festival.id) && <span className="browser__tag">직접 만든 것</span>}
                  </span>
                  <span className="browser__meta">
                    {period(festival)}
                    {festival.venue.name && ` · ${festival.venue.name}`}
                  </span>
                </span>
                {state ? <span className="browser__state">{state}</span> : <PlusIcon />}
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export function ManageView({ data }: { data: UserData }) {
  const [browsing, setBrowsing] = useState(false)
  return (
    <div className="manage">
      <CurrentFestival festival={activeFestival(data)?.festival ?? null} />
      <button type="button" className="add-festival" aria-expanded={browsing} onClick={() => setBrowsing((v) => !v)}>
        <PlusIcon />
        페스티벌 추가하기
      </button>
      {browsing && <FestivalBrowser data={data} onPicked={() => setBrowsing(false)} />}
    </div>
  )
}
