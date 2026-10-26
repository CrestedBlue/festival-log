import { CloseIcon } from '../../components/icons'
import { resolveFestival } from '../../data/resolve'
import type { Festival, UserData } from '../../data/schema'
import { updateData } from '../../data/store'
import { hasNewContent, markSeen } from '../../data/updates'
import { removeMyFestival, setActiveFestival } from '../../data/userData'
import { FestivalRow } from './FestivalRow'

interface Props {
  data: UserData
  today: string
  onBrowse: () => void
}

/**
 * The festivals the user added, latest first: tap to switch (and to see what is new: the red dot goes), ✕ to take
 * one off the list.
 */
export function MyFestivals({ data, today, onBrowse }: Props) {
  const mine = data.myFestivalIds
    .flatMap((id) => resolveFestival(data, id)?.festival ?? [])
    .sort((a, b) => b.startDate.localeCompare(a.startDate))
  const archived = new Set(data.archivedFestivals.map((f) => f.id))

  if (mine.length === 0) {
    return (
      <div className="manage__list">
        <div className="manage__empty">
          <p>아직 추가한 페스티벌이 없어요.</p>
          <button type="button" className="btn btn--primary" onClick={onBrowse}>
            둘러보기
          </button>
        </div>
      </div>
    )
  }

  const pick = (festival: Festival) => {
    if (data.activeFestivalId === festival.id && !hasNewContent(data, festival.id)) return
    updateData((d) => markSeen(setActiveFestival(d, festival.id), festival.id))
  }
  const remove = (festival: Festival) => {
    if (!window.confirm(`'${festival.name}'를 내 목록에서 뺄까요? 이 페스티벌에 남긴 핀과 티켓 링크도 지워져요.`)) return
    updateData((d) => removeMyFestival(d, festival.id))
  }

  return (
    <div className="manage__list">
      <ul className="fest-list">
        {mine.map((festival) => {
          const active = data.activeFestivalId === festival.id
          return (
            <li key={festival.id} className="fest-list__mine">
              <FestivalRow
                festival={festival}
                today={today}
                active={active}
                tag={archived.has(festival.id) ? '직접 만든 것' : undefined}
                trailing={active ? <span className="fest-row__pill">보는 중</span> : null}
                updated={hasNewContent(data, festival.id)}
                onPick={() => pick(festival)}
              />
              <button type="button" className="fest-remove" aria-label={`'${festival.name}' 목록에서 빼기`} onClick={() => remove(festival)}>
                <CloseIcon />
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
