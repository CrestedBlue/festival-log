import { useState, type ReactNode } from 'react'
import { addFestival, removeFestival, setActiveFestival, updateFestival } from '../../data/actions'
import { createSampleFestival } from '../../data/sample'
import { FestivalSchema, type AppData, type Festival } from '../../data/schema'
import { updateData } from '../../data/store'
import { makeId } from '../../lib/id'
import { addDays, listDays, toIsoDate } from '../../lib/time'
import { BulkAdd } from './BulkAdd'
import { FestivalForm, type FestivalFormValues } from './FestivalForm'
import { PerformanceList } from './PerformanceList'
import { ShareSection } from './ShareSection'
import { StageEditor } from './StageEditor'
import './manage.css'

/** Seoul City Hall: a sane default until the user sets the venue from the map tab. */
const DEFAULT_VENUE = { lat: 37.5663, lng: 126.9779 }

const toFormValues = (f: Festival): FestivalFormValues => ({
  name: f.name,
  startDate: f.startDate,
  endDate: f.endDate,
  venueName: f.venue.name,
})

function Panel({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section className="panel" aria-labelledby={id}>
      <h2 id={id} className="panel__title">
        {title}
      </h2>
      {children}
    </section>
  )
}

function createFestival(values: FestivalFormValues, venue: { lat: number; lng: number }): string | null {
  const candidate = {
    id: makeId(),
    name: values.name,
    startDate: values.startDate,
    endDate: values.endDate,
    venue: { name: values.venueName, ...venue },
    stages: [],
    performances: [],
    pins: [],
  }
  const parsed = FestivalSchema.safeParse(candidate)
  if (!parsed.success) return parsed.error.issues[0]?.message ?? '입력을 확인해 주세요.'
  updateData((d) => addFestival(d, parsed.data))
  return null
}

function editFestival(festival: Festival, values: FestivalFormValues): string | null {
  const days = new Set(listDays(values.startDate, values.endDate))
  const orphaned = festival.performances.filter((p) => !days.has(p.day)).length
  if (orphaned > 0) return `바뀐 기간 밖에 공연 ${orphaned}개가 있어요. 먼저 그 공연들을 지워 주세요.`
  const patch = {
    name: values.name,
    startDate: values.startDate,
    endDate: values.endDate,
    venue: { ...festival.venue, name: values.venueName },
  }
  const parsed = FestivalSchema.safeParse({ ...festival, ...patch })
  if (!parsed.success) return parsed.error.issues[0]?.message ?? '입력을 확인해 주세요.'
  updateData((d) => updateFestival(d, festival.id, patch))
  return null
}

export function ManageView({ data, festival }: { data: AppData; festival: Festival | null }) {
  const [creating, setCreating] = useState(festival === null)
  const today = toIsoDate(new Date())

  const remove = () => {
    if (festival && window.confirm(`'${festival.name}'와 모든 공연·핀을 지울까요? 되돌릴 수 없어요.`)) {
      updateData((d) => removeFestival(d, festival.id))
    }
  }

  return (
    <div className="manage">
      <Panel id="manage-switch" title="내 페스티벌">
        <div className="inline-form">
          {data.festivals.length > 0 && (
            <label className="field">
              <span className="visually-hidden">페스티벌 선택</span>
              <select value={festival?.id ?? ''} onChange={(e) => updateData((d) => setActiveFestival(d, e.target.value))}>
                {data.festivals.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <button type="button" className="btn btn--accent" onClick={() => setCreating(true)} disabled={creating}>
            + 새로 만들기
          </button>
        </div>
        {creating && (
          <FestivalForm
            initial={{ name: '', startDate: today, endDate: addDays(today, 1), venueName: '' }}
            submitLabel="만들기"
            onSubmit={(values) => {
              const error = createFestival(values, festival?.venue ?? DEFAULT_VENUE)
              if (!error) setCreating(false)
              return error
            }}
            onCancel={festival ? () => setCreating(false) : undefined}
          />
        )}
      </Panel>

      {festival && !creating && (
        <>
          <Panel id="manage-info" title="기본 정보">
            <FestivalForm
              key={Object.values(toFormValues(festival)).join('|') + festival.id}
              initial={toFormValues(festival)}
              submitLabel="저장"
              onSubmit={(values) => editFestival(festival, values)}
            />
            <p className="hint">행사장 위치는 지도 탭에서 지도를 옮긴 뒤 ‘여기를 행사장으로 저장’을 누르세요.</p>
          </Panel>
          <Panel id="manage-stages" title="스테이지">
            <StageEditor festival={festival} />
          </Panel>
          <Panel id="manage-bulk" title="타임테이블 입력">
            <BulkAdd key={festival.id} festival={festival} />
          </Panel>
          <Panel id="manage-list" title={`등록된 공연 ${festival.performances.length}개`}>
            <PerformanceList festival={festival} />
          </Panel>
        </>
      )}

      <Panel id="manage-share" title="친구와 공유">
        <ShareSection data={data} festival={creating ? null : festival} />
      </Panel>

      <Panel id="manage-etc" title="기타">
        <div className="form-actions form-actions--start">
          <button
            type="button"
            className="btn"
            onClick={() => updateData((d) => addFestival(d, createSampleFestival(new Date(), makeId)))}
          >
            샘플 페스티벌 추가
          </button>
          {festival && (
            <button type="button" className="btn btn--danger" onClick={remove}>
              이 페스티벌 삭제
            </button>
          )}
        </div>
      </Panel>
    </div>
  )
}
