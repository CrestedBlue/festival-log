import { useState, type CSSProperties, type FormEvent } from 'react'
import { addStage, removeStage } from '../../data/actions'
import { StageSchema, nextStageColor, type Festival } from '../../data/schema'
import { updateData } from '../../data/store'
import { makeId } from '../../lib/id'

export function StageEditor({ festival }: { festival: Festival }) {
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  const add = (e: FormEvent) => {
    e.preventDefault()
    const parsed = StageSchema.safeParse({ id: makeId(), name, color: nextStageColor(festival) })
    if (!parsed.success) {
      setError('스테이지 이름을 입력해 주세요.')
      return
    }
    updateData((d) => addStage(d, festival.id, parsed.data))
    setName('')
    setError(null)
  }

  const remove = (stageId: string, stageName: string) => {
    const count = festival.performances.filter((p) => p.stageId === stageId).length
    const message = count > 0 ? `'${stageName}'와 이 스테이지의 공연 ${count}개를 지울까요?` : `'${stageName}'를 지울까요?`
    if (window.confirm(message)) updateData((d) => removeStage(d, festival.id, stageId))
  }

  return (
    <div className="form-grid">
      {festival.stages.length > 0 && (
        <ul className="stage-list">
          {festival.stages.map((stage) => (
            <li key={stage.id} style={{ '--stage-color': stage.color } as CSSProperties}>
              <span className="stage-list__name">{stage.name}</span>
              <button type="button" className="btn btn--small btn--ghost" onClick={() => remove(stage.id, stage.name)}>
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}
      <form className="inline-form" onSubmit={add}>
        <label className="field">
          <span className="visually-hidden">새 스테이지 이름</span>
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder="새 스테이지 이름" />
        </label>
        <button type="submit" className="btn btn--primary">
          추가
        </button>
      </form>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
