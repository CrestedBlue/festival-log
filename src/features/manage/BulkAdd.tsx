import { useMemo, useState } from 'react'
import { addPerformances } from '../../data/actions'
import { PerformanceSchema, type Festival, type Performance } from '../../data/schema'
import { showNotice, updateData } from '../../data/store'
import { makeId } from '../../lib/id'
import { formatDayLabel, listDays } from '../../lib/time'
import { parseTimetableText } from '../../lib/timetableText'

const PLACEHOLDER = '18:30-19:40 아티스트 이름\n20:00-21:10 다른 아티스트\n23:30-01:00 심야 DJ'

export function BulkAdd({ festival }: { festival: Festival }) {
  const days = listDays(festival.startDate, festival.endDate)
  const [day, setDay] = useState(days[0] ?? festival.startDate)
  const [stageId, setStageId] = useState(festival.stages[0]?.id ?? '')
  const [text, setText] = useState('')
  const parsed = useMemo(() => parseTimetableText(text), [text])

  if (festival.stages.length === 0) {
    return <p className="hint">먼저 위에서 스테이지를 하나 이상 추가해 주세요.</p>
  }

  const activeStageId = festival.stages.some((s) => s.id === stageId) ? stageId : (festival.stages[0]?.id ?? '')
  const activeDay = days.includes(day) ? day : (days[0] ?? festival.startDate)

  const submit = () => {
    const candidates = parsed.entries.map((entry) => ({ id: makeId(), stageId: activeStageId, day: activeDay, ...entry }))
    const valid = candidates.flatMap((c) => {
      const result = PerformanceSchema.safeParse(c)
      return result.success ? [result.data] : []
    }) satisfies Performance[]
    if (valid.length !== candidates.length) {
      showNotice('error', `${candidates.length - valid.length}개 줄을 저장할 수 없어요. 시간과 이름을 확인해 주세요.`)
      return
    }
    if (valid.length === 0) return
    updateData((d) => addPerformances(d, festival.id, valid))
    setText('')
    showNotice('info', `${formatDayLabel(activeDay)}에 공연 ${valid.length}개를 추가했어요.`)
  }

  return (
    <div className="form-grid">
      <div className="form-grid__row">
        <label className="field">
          날짜
          <select value={activeDay} onChange={(e) => setDay(e.target.value)}>
            {days.map((d) => (
              <option key={d} value={d}>
                {formatDayLabel(d)}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          스테이지
          <select value={activeStageId} onChange={(e) => setStageId(e.target.value)}>
            {festival.stages.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="field">
        한 줄에 공연 하나씩 (시작-끝 아티스트)
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={PLACEHOLDER} spellCheck={false} />
      </label>
      {parsed.errors.length > 0 && (
        <ul className="parse-errors" role="alert">
          {parsed.errors.map((err) => (
            <li key={err.lineNumber}>
              {err.lineNumber}번째 줄: {err.reason}
            </li>
          ))}
        </ul>
      )}
      <div className="form-actions">
        <button type="button" className="btn btn--accent" disabled={parsed.entries.length === 0} onClick={submit}>
          공연 {parsed.entries.length}개 추가
        </button>
      </div>
    </div>
  )
}
